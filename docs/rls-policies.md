# RLS policies (draft for Phase 1)

**Rule: RLS is enabled on every table in `public`, with no exceptions.** A table without policies denies everything. Phase 1 adds a CI check that fails if any `public` table has `relrowsecurity = false`.

## Actors

| Actor            | How Postgres sees it                                        | Notes                                                     |
| ---------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| **Public**       | role `anon` (no session yet)                                | Only splash/serviceability before guest sign-in           |
| **Guest**        | role `authenticated`, JWT `is_anonymous = true`             | Supabase anonymous sign-in. Can browse, cart, and order   |
| **Customer**     | role `authenticated`, `is_anonymous = false`                | Registered (email verified for sensitive actions)         |
| **Admin**        | `authenticated` + row in `admin_users` (active) with a role | Checked by `has_admin_role(array[...])`                   |
| **Service role** | `service_role` (bypasses RLS)                               | **Edge Functions only.** Never in the app or admin bundle |

Helper functions (`security definer`, `stable`, `set search_path = ''`):

- `auth.uid()`: the current user.
- `public.is_anonymous()`: `coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)`.
- `public.is_admin()`: an active row exists in `admin_users` for `auth.uid()`.
- `public.has_admin_role(roles admin_role[])`: the role is in the given list. `owner` is always true.

Legend: **R** select · **C** insert · **U** update · **D** delete · **own** = `user_id = auth.uid()` · ✗ = no access · SR = service role (Edge Function).

Admin role shorthand: **cat** = catalog_manager, **ord** = order_manager, **sup** = support, **adm** = admin, **own.** = owner.

## Policy matrix

| Table                   | Public (anon)                                   | Guest                                | Customer                                              | Admin                                | Service role                               |
| ----------------------- | ----------------------------------------------- | ------------------------------------ | ----------------------------------------------------- | ------------------------------------ | ------------------------------------------ |
| profiles                | ✗                                               | R/U own                              | R/U own (not `deleted_at`)                            | R all (sup+); U adm+                 | all                                        |
| usernames               | ✗ (resolver is SR)                              | ✗                                    | R own; C own (once)                                   | R all                                | all                                        |
| addresses               | ✗                                               | R/C/U/D own                          | R/C/U/D own                                           | R all (ord, sup)                     | all                                        |
| admin_users             | ✗                                               | ✗                                    | ✗                                                     | R all; C/U/D owner only              | all                                        |
| serviceable_pincodes    | R active                                        | R active                             | R active                                              | R all; C/U/D adm, ord                | all                                        |
| serviceability_requests | ✗ (via function)                                | C (own contact)                      | C                                                     | R all                                | all                                        |
| sellers                 | R active (public fields via view)               | same                                 | same                                                  | R all; C/U owner/adm                 | all                                        |
| categories              | R active                                        | R active                             | R active                                              | R all; C/U/D cat+                    | all                                        |
| brands                  | R active                                        | R active                             | R active                                              | R all; C/U/D cat+                    | all                                        |
| attribute_sets          | R                                               | R                                    | R                                                     | C/U/D cat+                           | all                                        |
| products                | R `status='active'`                             | R active                             | R active                                              | R all; C/U/D cat+                    | all                                        |
| product_options         | R (parent active)                               | R                                    | R                                                     | C/U/D cat+                           | all                                        |
| variants                | R active (hides `member_price_paise` via view*) | R active (no member price)           | R active incl. member price                           | R all; C/U/D cat+                    | all                                        |
| inventory               | R available qty via view                        | R via view                           | R via view                                            | R all; U cat, ord                    | all (reserve/release)                      |
| product_images          | R                                               | R                                    | R                                                     | C/U/D cat+                           | all                                        |
| banners                 | R active & in schedule                          | R                                    | R                                                     | C/U/D adm, cat                       | all                                        |
| home_sections           | R active                                        | R                                    | R                                                     | C/U/D adm, cat                       | all                                        |
| carts                   | ✗                                               | R/C/U own                            | R/C/U own                                             | R (sup)                              | all                                        |
| cart_items              | ✗                                               | R/C/U/D own cart                     | R/C/U/D own cart                                      | R (sup)                              | all                                        |
| wishlists               | ✗                                               | ✗ (registered only)                  | R/C/D own                                             | ✗                                    | all                                        |
| recently_viewed         | ✗                                               | R/C/U/D own                          | R/C/U/D own                                           | ✗                                    | all                                        |
| coupons                 | ✗                                               | R active (code lookup via function)  | R active (via function)                               | R all; C/U/D adm                     | all                                        |
| coupon_redemptions      | ✗                                               | R own                                | R own                                                 | R all                                | C/U (place/cancel-order)                   |
| orders                  | ✗ (lookup via function)                         | R own                                | R own                                                 | R all; U status (ord, adm)           | C/U (place-order, webhook)                 |
| order_items             | ✗                                               | R own order                          | R own order                                           | R all                                | C                                          |
| order_status_history    | ✗                                               | R own order                          | R own order                                           | R all; C (ord, adm)                  | C                                          |
| payments                | ✗                                               | R own (no `raw_event`) via view      | R own via view                                        | R all                                | C/U                                        |
| refunds                 | ✗                                               | R own                                | R own                                                 | R all; C (ord, adm)                  | C/U                                        |
| returns                 | ✗                                               | R own; C own (delivered + in window) | same                                                  | R all; U (ord, adm)                  | all                                        |
| shipments               | ✗                                               | R own order                          | R own order                                           | R all; C/U (ord)                     | all                                        |
| points_ledger           | ✗                                               | R own                                | R own                                                 | R all; C `admin_adjust` (adm, owner) | C only (no U/D for anyone; trigger blocks) |
| points_boosters         | R active                                        | R active                             | R active                                              | C/U/D adm                            | all                                        |
| shopping_lists          | ✗                                               | R/C/D own                            | R/C/D own                                             | R (sup)                              | U (parse results)                          |
| shopping_list_items     | ✗                                               | R/U own (confirm/remove)             | R/U own                                               | R (sup)                              | C/U                                        |
| notifications           | ✗                                               | R/U(read_at) own                     | R/U(read_at) own                                      | C (broadcast via function)           | C                                          |
| device_tokens           | ✗                                               | C/U/D own                            | C/U/D own                                             | ✗                                    | R                                          |
| reviews                 | R published                                     | ✗ (registered only)                  | R published + own; C own (verified order_item); U own | R all; U status (adm, sup)           | all                                        |
| store_config            | R (public subset via view)                      | R                                    | R                                                     | R; U owner/adm                       | all                                        |
| feature_flags           | R                                               | R                                    | R                                                     | U owner/adm                          | all                                        |

\* Column-level exposure: Postgres RLS is row-level, so sensitive columns are hidden with **views** (`security_invoker = true`) or column `GRANT`s. Examples: `variants_public` without `member_price_paise` for anon/guest, `inventory_available` exposing only `variant_id, available`, `payments_customer` without `raw_event`, `store_config_public` without `legal` internals.

## Rules that are not plain RLS

- **Price, stock, coupon, and points maths never trust the client.** `place-order` (SR) recomputes everything.
- **Order lookup for guests** (order number + email/phone) is a rate-limited `security definer` function that returns a minimal summary, never the full row.
- **Username login** is resolved by the `username-login` Edge Function (SR). Clients can never select emails.
- **Status transitions** are validated by a trigger: the allowed transitions table from [user-flows.md](user-flows.md). Admins cannot jump `placed → delivered` without the intermediate rows.
- **Ledger immutability:** `points_ledger` gets `revoke update, delete` for all roles, plus a trigger that raises on update or delete.
- **Storage policies** mirror the tables: `shopping-lists/{user_id}/…`, `returns/{user_id}/…`, and `invoices/{user_id}/…` are readable only by the owner (signed URLs). Public buckets are read-only to clients, and writes are limited to cat+/adm.
- **Anonymous abuse:** enable CAPTCHA (hCaptcha/Turnstile) for anonymous sign-ins before launch, and keep the Supabase per-IP anonymous rate limit (TBD - owner decision on provider).
- **Account conversion:** because the `user_id` is unchanged, no data migration is needed.
- **Marketplace later:** add `seller_id = current_seller_id()` conditions to the admin policies for seller-scoped admins (`admin_users.seller_id`).

## Testing

Phase 1 adds pgTAP tests (`supabase/tests/`) that cover, for each table, the anon, guest, customer, other-customer, each admin role, and service role cases.
