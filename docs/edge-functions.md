# Edge Functions (draft)

Supabase Edge Functions (Deno), in `supabase/functions/<name>/index.ts`. **Secrets (Razorpay keys, AI model key, service-role key, Resend) live only in Edge Function secrets** (`supabase secrets set`) and are never put in the apps.

Common conventions:

- Requests and responses are JSON. Input is validated with zod (shared schemas where possible).
- Errors use `{ "error": { "code": "SNAKE_CASE", "message": "Human readable" } }` with an appropriate HTTP status.
- **Auth.** The caller's JWT (`Authorization: Bearer`) is verified unless stated otherwise. Functions create a user-scoped client for reads that should respect RLS, and use a service-role client only for the privileged writes.
- Idempotency: mutating calls accept an `Idempotency-Key` header (stored for 24 h).
- Logging: no PII in logs. Errors go to Sentry (Phase 11).

| Function               | Phase | Auth                                                                   | Trigger                    |
| ---------------------- | ----- | ---------------------------------------------------------------------- | -------------------------- |
| username-login         | 3     | none (`verify_jwt=false`, rate-limited, dual: per-IP + per-identifier) | HTTP                       |
| geocode-reverse        | 3     | any authenticated (incl. guest), per-user rate limit                   | HTTP                       |
| places-autocomplete    | 3     | any authenticated, looser per-user budget (fires per keystroke)        | HTTP                       |
| places-details         | 3     | any authenticated, per-user rate limit                                 | HTTP                       |
| place-order            | 6     | guest or customer JWT                                                  | HTTP                       |
| create-razorpay-order  | 6     | guest or customer JWT                                                  | HTTP                       |
| razorpay-webhook       | 6     | Razorpay signature (no JWT)                                            | HTTP (webhook)             |
| cancel-order           | 7     | owner JWT or admin                                                     | HTTP                       |
| points-credit          | 9     | cron (service)                                                         | Scheduled (pg_cron → HTTP) |
| points-expiry          | 9     | cron (service)                                                         | Scheduled                  |
| ai-shopping-list-parse | 10    | guest or customer JWT                                                  | HTTP                       |

---

## username-login — **Phase 3, planned, not yet deployed**

Resolves a username to the user's email server-side and signs in, so emails are never exposed to clients. Mobile client: `apps/mobile/src/features/auth/api/login.ts` already calls this (via `supabase.functions.invoke`) and falls back to direct `signInWithPassword` when the identifier looks like an email — it just can't succeed yet because the function doesn't exist on the hosted project.

- **`supabase/config.toml`:** `[functions.username-login]` with `verify_jwt = false` — the platform must not reject the unauthenticated call before our code runs. The other three Phase 3 functions below keep the default `verify_jwt = true`.
- **Input:** `{ identifier: string, password: string, captchaToken: string }`.
- **Process:** look up `usernames → user_id` with a service-role client, resolve the email via `auth.admin.getUserById`, then sign in through a **separate anon-key client** calling `signInWithPassword({ email, password, options: { captchaToken } })`. This lets GoTrue itself verify the Turnstile token (it already holds the secret key via Attack Protection) rather than a second Cloudflare-secret-dependent verification path inside the function.
- **Output:** `200 { session: { access_token, refresh_token, expires_at, expires_in, token_type, user: { id, email, is_anonymous } } }` — matches `UsernameLoginResponse` in `login.ts`.
- **Errors:** `400 INVALID_INPUT`, `401 INVALID_CREDENTIALS` (identical response for an unknown username and a wrong password — never reveal which), `429 RATE_LIMITED` (dual: per-IP **and** per-identifier via `consume_request_limit`, both must pass).
- **Notes:** Never returns the resolved email as its own field — only inside `session.user.email`, same shape as the direct email-login path, so there's no way to enumerate usernames → emails from the response shape alone.

## geocode-reverse — **Phase 3, planned, not yet deployed**

- **Input:** `{ lat: number, lng: number }`
- **Process:** call Google's Geocoding API server-side (secret lives only in this function's Edge Function secret), parse `address_components` by `types` into a flat shape.
- **Output:** `200 { line1, area, city, state, pincode, formattedAddress }`
- **Errors:** `400 INVALID_INPUT`, `404 NO_RESULT`, `429 RATE_LIMITED` (per-user), `502 PROVIDER_ERROR`.
- **Auth:** any authenticated session, including an anonymous guest.
- **Mobile interim:** until this ships, `app/(onboarding)/location/index.tsx`'s "use my current location" uses `expo-location`'s on-device reverse geocoder instead (ADR-152) — the detected pincode is always shown for the user to confirm/edit before a serviceability check runs. Once this function ships, swap that call for `supabase.functions.invoke('geocode-reverse', ...)` and compare accuracy before removing the on-device fallback.

## places-autocomplete — **Phase 3, planned, not yet deployed**

- **Input:** `{ query: string, sessionToken: string }` — India-restricted (`components=country:in`). The session token groups one search session for Google's session-based Places billing.
- **Output:** `200 { suggestions: [{ placeId, description }] }`
- **Errors:** `400 INVALID_INPUT`, `429 RATE_LIMITED` (per-user, looser budget since it fires per keystroke), `502 PROVIDER_ERROR`.
- **Auth:** any authenticated session.
- **Mobile:** not wired up yet — `location/search.tsx` currently only takes a typed pincode (ADR unassigned; see docs/phase-3-handoff.md Step 8).

## places-details — **Phase 3, planned, not yet deployed**

- **Input:** `{ placeId: string, sessionToken: string }` — same session token as the autocomplete call that produced `placeId` (closes out Google's session-based billing).
- **Output:** `200 { address: { line1, area, city, state, pincode }, lat, lng }`
- **Errors:** `400 INVALID_INPUT`, `404 NOT_FOUND`, `429 RATE_LIMITED` (per-user), `502 PROVIDER_ERROR`.
- **Auth:** any authenticated session.

**Serviceability is not an Edge Function.** It's the `check_pincode` Postgres RPC (migration 14, `supabase/migrations/20261008143000_14_auth_onboarding.sql`) — a plain RLS-safe read, no network call needed. `apps/mobile/src/features/location/api/serviceability.ts` already calls it directly. This replaces the Phase 0 draft's `serviceability-check` Edge Function concept above; keeping the RPC approach avoids a network round-trip for something that's just a table lookup.

## place-order

The single source of truth for creating an order.

- **Input:**
  ```json
  {
    "addressId": "uuid | null",
    "address": { "...": "required for guests if no addressId" },
    "contact": { "fullName": "", "phone": "", "email": "" },
    "deliveryType": "standard",
    "paymentMethod": "upi|card|wallet|cod",
    "couponCode": "optional",
    "usePoints": true,
    "clientTotalPaise": 123400
  }
  ```
- **Process (one DB transaction via RPC `place_order_tx`):** load the cart, re-price each variant (member price only for registered users), validate active status, stock, pincode serviceability, `max_per_order`, coupon rules, and the points rules (min 50, max 20%, balance). Compute fees, GST split, and `points_to_earn`. Reserve inventory. Insert `orders`, `order_items`, `order_status_history`, `coupon_redemptions`, and `points_ledger` (`redeem_order`). Clear the cart. Status is `placed` for COD and `pending_payment` for online payments.
- **Output:** `201 { orderId, orderNumber, status, totalPaise, payment: { required: boolean } }`
- **Errors:** `400 INVALID_INPUT`, `409 PRICE_CHANGED { newTotalPaise }`, `409 OUT_OF_STOCK { variantIds }`, `422 NOT_SERVICEABLE`, `422 COUPON_INVALID { reason }`, `422 POINTS_INVALID { reason }`, `422 COD_NOT_ALLOWED`, `409 CART_EMPTY`.

## create-razorpay-order

- **Input:** `{ orderId: uuid }` (the caller must own an order in `pending_payment`)
- **Process:** create a Razorpay order (amount = `total_paise`, receipt = `order_number`) and insert `payments(status='created')`.
- **Output:** `200 { razorpayOrderId, amountPaise, currency: 'INR', keyId }`. `keyId` is the public Razorpay key id; the key secret never leaves the function.
- **Errors:** `404 ORDER_NOT_FOUND`, `409 ORDER_NOT_PAYABLE`, `502 PROVIDER_ERROR`.

## razorpay-webhook

- **Input:** the Razorpay webhook (`payment.captured`, `payment.failed`, `order.paid`, `refund.processed`). The raw body is required for signature checks.
- **Auth:** HMAC verification of `X-Razorpay-Signature` with the webhook secret. JWT verification is disabled for this function only.
- **Process:** idempotent on `event.id`. On success, `payments.captured` and order `pending_payment → placed` (+ history). On failure, `payments.failed`. On a refund, update `refunds`.
- **Output:** `200 { ok: true }` (always 200 after a valid signature, so Razorpay doesn't retry handled events).
- **Errors:** `400 INVALID_SIGNATURE`.

## cancel-order

- **Input:** `{ orderId: uuid, reason: string }`
- **Auth:** the order owner (only while the status is `placed`), or an admin with `ord`/`adm` (any status before `delivered`).
- **Process:** status → `cancelled` + history. Release the inventory reservation. Void the coupon redemption. Reverse the redeemed points (`reverse_cancel`). If the order was paid online, create `refunds` and call the Razorpay refund API.
- **Output:** `200 { status: 'cancelled', refund?: { id, amountPaise, status } }`
- **Errors:** `403 FORBIDDEN`, `404 ORDER_NOT_FOUND`, `409 NOT_CANCELLABLE { status }`.

## points-credit (scheduled job)

- **Schedule:** hourly (pg_cron → `net.http_post` with the service key stored in Vault, or Supabase Scheduled Functions).
- **Process:** find orders where `status = delivered`, `return_window_ends_at < now()`, and the points are not yet credited. Insert `earn_order` (and `earn_booster`) rows for the non-returned quantity. Mark the order as credited. Notify the user.
- **Output:** `200 { credited: number }`. It is idempotent: there is a unique index on `(order_id, reason)` for earn rows.

## points-expiry (scheduled job)

- **Schedule:** daily.
- **Process:** users with balance > 0 and `last_activity_at < now() - interval '12 months'` (from config) get an `expire` row of −balance. Send the reminder notification 30 days before (TBD - owner decision).
- **Output:** `200 { expiredUsers: number, pointsExpired: number }`.

## ai-shopping-list-parse

- **Input:** `{ listId: uuid }`. The list was already created by the client with either `raw_text` or `image_path` (Storage `shopping-lists/{uid}/…`).
- **Process:** load the list (the owner check uses the user's JWT). For images, create a signed URL and call the **vision model** (provider TBD - owner decision) with a strict JSON schema: `[{ name, quantity, unit }]`. For text, use the same model or a parser. Match each line against the catalog with pg_trgm + full-text plus brand/size heuristics; the model may optionally re-rank. Insert `shopping_list_items` with confidence. Set the status to `parsed`.
- **Output:** `200 { listId, items: [{ id, rawLine, parsedName, quantity, unit, match?: { variantId, productName, label, pricePaise, confidence } }] }`
- **Errors:** `404 LIST_NOT_FOUND`, `413 IMAGE_TOO_LARGE`, `422 UNREADABLE_IMAGE`, `429 RATE_LIMITED` (per user per day), `502 MODEL_ERROR`.
- **Privacy:** images are retained per the policy (TBD, e.g. 30 days) and are not used for training (provider setting).
