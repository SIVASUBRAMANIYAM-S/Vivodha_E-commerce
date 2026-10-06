# Vivodha: Product Requirements Document

> Status: Draft v0.1 (Phase 0). Owner: product owner. Items marked **TBD - owner decision** need a decision; see [open-questions.md](open-questions.md).

## 1. Vision

Vivodha ("Fresh to your door") is a multi-category online store for India. It sells everyday groceries and household essentials with fast, reliable delivery, honest pricing in INR with GST-compliant invoices, and a rewarding loyalty programme (Vivo Points).

The platform is built **single-seller now, marketplace-ready later**, and is **re-skinnable** for other verticals (e.g. a boutique) through admin configuration rather than code changes.

### Goals

| Goal                      | Measure (initial target: TBD - owner decision)      |
| ------------------------- | --------------------------------------------------- |
| Fast, low-friction buying | Median time from app open to order placed           |
| Repeat purchase           | 30-day repeat order rate; reorder usage             |
| Trust                     | Order accuracy, on-time delivery, refund turnaround |
| Loyalty                   | % of orders using or earning Vivo Points            |
| Operational simplicity    | Orders handled per admin user per day               |

### Non-goals (MVP)

- Multi-seller marketplace UI (data model is ready; UI comes later).
- Live rider map, Google sign-in, courier aggregator integration, iOS release.
- Subscriptions / scheduled recurring deliveries (TBD - owner decision for V1).

## 2. Category scope

Food & grocery · Fruits & vegetables · Dairy & bakery · Beverages · Home care · Personal care & beauty · Home & kitchen · Lifestyle.

Variant types are **generic attribute sets**: grocery uses weight / pack size, fashion uses size / colour. Weight is never hardcoded as the only variant type.

## 3. Users & personas

| Persona                      | Description                                  | Key needs                                                  |
| ---------------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| **Guest shopper**            | First-time visitor; doesn't want to register | Browse and order without an account; track by order number |
| **Registered customer**      | Repeat household buyer                       | Saved addresses, reorder, points, order history            |
| **Admin / store owner**      | Runs catalog, pricing, orders                | Fast catalog editing, order queue, configuration           |
| **Catalog manager**          | Maintains products, images, stock            | Bulk edits, variants, inventory                            |
| **Order / ops manager**      | Packs and dispatches                         | Status updates, cancellations, returns, refunds            |
| **Support agent**            | Answers customers                            | Order lookup, customer view, notes                         |
| _Future: marketplace seller_ | Third-party seller                           | Own catalog, own orders (later phase)                      |

## 4. Release scope

### MVP (Phases 1-12, Android)

- Onboarding (splash, welcome, location/pincode, serviceability, "notify me")
- Auth: username **or** email + password; sign-up; email verification; password reset by email
- Guest browsing and guest checkout (Supabase anonymous sign-in); post-order account conversion; order lookup by order number + email/phone
- Home: header, delivery pincode, search, banners, category grid, Shopping List entry, rails (Deals, Best sellers, Top picks, Recently viewed)
- Catalog: category listing with subcategory tabs, filters (brand, price, discount), sort; product detail; search
- Cart: sticky bar, savings summary, coupons, free-delivery nudge, Vivo Points toggle
- Checkout: address → delivery type → payment (UPI, card, wallet via Razorpay; COD) → confirmation
- Orders: status tracking, cancellation, reorder, ratings, returns & refunds, points earned
- Vivo Points: earn, redeem, Vivo price, category boosters, expiry
- AI Shopping List: write / photo / upload → matched products → confirm → add to cart
- Admin: catalog, inventory, orders, customers, banners, home sections, coupons, pincodes, points, settings, feature flags
- Notifications (push + email), analytics, crash reporting
- Compliance: GST invoice, policy pages, account deletion

### V1 (post-launch)

- iOS release (same codebase)
- Google sign-in
- Courier aggregator integration
- Wishlist sharing, richer recommendations (TBD - owner decision)

### Later

- Marketplace (multi-seller onboarding, seller portal, settlements)
- Live rider map
- Re-skinned vertical deployments (e.g. boutique)

## 5. Features, user stories & acceptance criteria

Each feature lists the phase that delivers it ([phases.md](phases.md)).

### F1. Onboarding & location (Phase 4)

- **US1.1** As a new user, I see a branded splash and can choose Log in, Sign up, or Continue as guest.
  - AC: The splash shows for at most 2 s after assets load. All three options are visible without scrolling on a 360×640 screen.
- **US1.2** As a user, I'm asked for location permission so my address can be detected.
  - AC: If granted, the address and pincode are auto-detected and editable. If denied, I can type an address or pincode manually. Denial never blocks progress.
- **US1.3** As a user in an unserviceable pincode, I see "Coming soon" and can ask to be notified.
  - AC: Entering an unserviceable pincode shows a "Coming soon, notify me" form (email or phone). The request is stored once per contact + pincode. I can still change the pincode.

### F2. Authentication (Phase 4)

- **US2.1** As a new customer, I sign up with name, username, email, password, and phone.
  - AC: Usernames are unique, lowercase, `[a-z0-9_]{3,20}`, and checked live. Email must be verified before checkout as a registered user (guest checkout stays available). Phone is a 10-digit Indian mobile number.
- **US2.2** As a customer, I log in with my username **or** email plus password.
  - AC: Usernames are resolved to emails server-side (Edge Function `username-login`), never by exposing emails to the client. Errors are generic ("Invalid credentials").
- **US2.3** As a customer, I can reset my password by email.
  - AC: The reset link expires per Supabase settings, and the response does not reveal whether the email exists.
- No OTP. Google sign-in comes later.

### F3. Guest checkout & conversion (Phases 4, 6)

- **US3.1** As a guest, I can browse and place an order without creating an account.
  - AC: An anonymous Supabase session is created silently. Checkout collects name, phone, email, and address.
- **US3.2** As a guest who just ordered, I'm offered "Create account" to keep my orders.
  - AC: Converting links the anonymous user to email/password (same `user_id`), so orders, addresses, and points stay attached.
- **US3.3** As a guest, I can look up my order with order number + email or phone.
  - AC: The lookup is rate-limited and returns only that order's status summary.

### F4. Home (Phase 5)

- **US4.1** As a shopper, I see the logo header with "Delivering to <pincode>", a persistent search bar, a banner carousel, a category grid, a Shopping List entry, and rails: Deals, Best sellers, Top picks for you, Recently viewed.
  - AC: Layout is driven by `home_sections` (admin-configurable order and visibility). Each rail hides when empty. Banners respect schedule windows.

### F5. Catalog, listing & search (Phase 5)

- **US5.1** As a shopper, I browse a category with subcategory tabs, filter by brand, price, and discount, and sort (relevance, price ↑/↓, discount, newest).
  - AC: Filters combine with AND, and the result count updates. Out-of-stock items sort last.
- **US5.2** The product card shows image, name, variant dropdown, MRP struck through, price, and "Add", which turns into a −/+ stepper.
  - AC: Changing the variant updates price and MRP. The stepper is bounded by stock and a per-order limit.
- **US5.3** Search returns relevant products with typo tolerance.
  - AC: Search uses Postgres full-text plus trigram. Recent searches are kept locally.

### F6. Cart (Phase 6)

- **US6.1** The cart shows items, a savings summary (MRP − price − coupon − points), coupons, a free-delivery nudge ("Add ₹X more for free delivery"), and a "Use Vivo Points" toggle. A sticky bottom bar shows the total and a Proceed button.
  - AC: Totals are recomputed server-side at checkout. Client totals are display-only.

### F7. Checkout & payments (Phase 6)

- **US7.1** Checkout steps: address → delivery type → payment (UPI, card, wallet, COD) → confirmation.
  - AC: The order is created by the `place-order` Edge Function, which re-prices, validates stock, applies coupon and points, and reserves inventory. Online payments use a Razorpay order created server-side, with the signature verified by webhook. COD availability and limits come from config (TBD - owner decision).
- **US7.2** Payment success, failure, and pending each show a clear state with retry.
  - AC: See [user-flows.md](user-flows.md#payment-outcomes).

### F8. Post-order (Phase 7)

- **US8.1** I can track status: placed → packed → shipped / out for delivery → delivered.
  - AC: The timeline comes from `order_status_history`. Realtime updates arrive while the screen is open.
- **US8.2** I can cancel before packing, reorder, rate items, and request a return or refund within the return window.
  - AC: The return window per category comes from config (TBD - owner decision). Refunds go to the original method, or as Vivo Points if the customer chooses (TBD - owner decision).
- **US8.3** I see the points earned (pending until the return window closes).

### F9. Delivery & serviceability (Phases 4, 8)

- Each serviceable pincode has a mode `own_delivery | courier`, a delivery fee, a free-delivery threshold, and an ETA. Courier aggregator integration comes later (manual AWB entry for now).

### F10. Vivo Points (Phase 9)

- Earn 1 point per ₹100 of eligible order value (1 pt = ₹1), credited after the return window closes.
- Redeem a minimum of 50 points, capped at 20% of the order value.
- Member "Vivo price" on selected SKUs (registered members only).
- 2× category boosters (admin-scheduled).
- Points expire after 12 months of account inactivity.
- Append-only `points_ledger`. All numbers live in `store_config`.
- AC: The balance always equals the sum of ledger entries. No update or delete on the ledger. Reversal entries cover cancellations and returns.

### F11. AI Shopping List (Phase 10)

- **US11.1** I can type, photograph, or upload a shopping list. The system matches items to the catalog, I confirm or adjust, then add everything to the cart.
  - AC: The image goes to Storage, then the `ai-shopping-list-parse` Edge Function calls a vision model (provider TBD - owner decision), and the matched results are stored in `shopping_list_items`. Unmatched lines remain editable. The model key exists only in the Edge Function.

### F12. Admin panel (Phases 2, 8)

- Catalog (products, variants, attribute sets, images), categories (tree), brands, inventory, orders, customers, banners, home sections, coupons, pincodes, points, settings (store_config, feature flags, admin users and roles).
- AC: Every admin action is authorised by role through RLS plus server checks. Destructive actions need confirmation.

### F13. Notifications, analytics & crash reporting (Phase 11)

- Push (Expo Notifications / FCM) and email (Resend SMTP) for order status, points credited or expiring, and back-in-stock (TBD).
- Firebase Analytics events, plus Sentry for both apps.

### F14. Compliance (Phases 7, 12)

- GST tax invoice, FSSAI display for food, DPDP Act 2023 consent and rights, Google Play in-app and web account deletion, and policy pages. See [compliance.md](compliance.md).

## 6. Re-skinnability

- `store_config`: logo, theme tokens, enabled features, home layout, business numbers.
- `feature_flags`: toggle modules (e.g. `shopping_list`, `vivo_points`, `cod`).
- Generic `attribute_sets` / `product_options` / `variants`.
- The mobile app reads config at launch and caches it. Brand tokens default to Vivodha.

## 7. Constraints

- Copy **UX patterns only** from reference apps. Never use any competitor's name, logo, colours, icons, illustrations, banner artwork, copy, or pixel-identical screens.
- RLS on every table. Secrets live only in Edge Functions. Generated Supabase types are used everywhere.
- Money is stored as integer paise. Prices include GST (MRP-inclusive, Indian retail norm).
