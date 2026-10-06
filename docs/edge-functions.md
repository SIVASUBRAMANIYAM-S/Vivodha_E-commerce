# Edge Functions (draft)

Supabase Edge Functions (Deno), in `supabase/functions/<name>/index.ts`. **Secrets (Razorpay keys, AI model key, service-role key, Resend) live only in Edge Function secrets** (`supabase secrets set`) and are never put in the apps.

Common conventions:

- Requests and responses are JSON. Input is validated with zod (shared schemas where possible).
- Errors use `{ "error": { "code": "SNAKE_CASE", "message": "Human readable" } }` with an appropriate HTTP status.
- **Auth.** The caller's JWT (`Authorization: Bearer`) is verified unless stated otherwise. Functions create a user-scoped client for reads that should respect RLS, and use a service-role client only for the privileged writes.
- Idempotency: mutating calls accept an `Idempotency-Key` header (stored for 24 h).
- Logging: no PII in logs. Errors go to Sentry (Phase 11).

| Function               | Phase | Auth                        | Trigger                    |
| ---------------------- | ----- | --------------------------- | -------------------------- |
| username-login         | 4     | none (public, rate-limited) | HTTP                       |
| serviceability-check   | 4     | none / any                  | HTTP                       |
| place-order            | 6     | guest or customer JWT       | HTTP                       |
| create-razorpay-order  | 6     | guest or customer JWT       | HTTP                       |
| razorpay-webhook       | 6     | Razorpay signature (no JWT) | HTTP (webhook)             |
| cancel-order           | 7     | owner JWT or admin          | HTTP                       |
| points-credit          | 9     | cron (service)              | Scheduled (pg_cron → HTTP) |
| points-expiry          | 9     | cron (service)              | Scheduled                  |
| ai-shopping-list-parse | 10    | guest or customer JWT       | HTTP                       |

---

## username-login

Resolves a username to the user's email server-side and signs in, so emails are never exposed to clients.

- **Input:** `{ identifier: string, password: string }`. If `identifier` contains `@` it is treated as an email.
- **Process:** look up `usernames → auth.users.email` (SR), then call `signInWithPassword` against GoTrue and return the session.
- **Output:** `200 { session: { access_token, refresh_token, expires_at, user } }`
- **Errors:** `400 INVALID_INPUT`, `401 INVALID_CREDENTIALS` (the same response for an unknown user and a wrong password), `403 EMAIL_NOT_VERIFIED`, `429 RATE_LIMITED`.
- **Notes:** Per-IP and per-identifier rate limit. Email-based login can call Supabase Auth directly from the client; this function exists for usernames.
- **Alternative (decide in Phase 4):** an RPC that returns only "exists" + signs in. Returning a session from an Edge Function is the safer default.

## serviceability-check

- **Input:** `{ pincode: string }` (6 digits)
- **Output:** `200 { serviceable: boolean, pincode, city?, deliveryMode?: 'own_delivery'|'courier', deliveryFeePaise?, freeDeliveryThresholdPaise?, etaText?, codAllowed?, codMaxPaise? }`
- **Errors:** `400 INVALID_PINCODE`
- **Auth:** none required (cached at the edge for 5 minutes). This could also be a plain RLS read of `serviceable_pincodes`. A function keeps the response shape stable and makes it easy to add a courier API later.

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
