# RLS policies

> **Implemented in Phase 1**, migration `20261008091200_12_rls.sql` (plus storage policies in `..._13_storage.sql`). This doc reflects what was actually built — read the migration itself for the exact `USING`/`WITH CHECK` clauses.

**Rule: RLS is enabled on every table in `public`, with no exceptions.** A table without policies denies everything. The migration ends with a `DO` block that raises an exception (failing the migration) if any `public` table is missing `relrowsecurity`.

## Actors

| Actor            | How Postgres sees it                                      | Notes                                                     |
| ---------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| **Public**       | role `anon` (no session yet)                              | Only splash/serviceability before guest sign-in           |
| **Guest**        | role `authenticated`, JWT `is_anonymous = true`           | Supabase anonymous sign-in. Can browse, cart, and order   |
| **Customer**     | role `authenticated`, `is_anonymous = false`              | Registered (email verified for sensitive actions)         |
| **Admin**        | `authenticated` + active row in `admin_users` with a role | Checked by `has_admin_role(array[...])`                   |
| **Service role** | `service_role` (bypasses RLS entirely)                    | **Edge Functions only.** Never in the app or admin bundle |

Admin roles (ADR-128): **super_admin, manager, catalog, orders, support**. `super_admin` passes every `has_admin_role()` check regardless of the list passed in.

Helper functions, all `set search_path = ''`:

- `auth.uid()` — the current user (null for anon or when no JWT is set).
- `public.is_anonymous()` — `coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)`. `stable`, no `security definer` needed (`auth.jwt()` is already readable by the caller).
- `public.is_admin()` — an active row exists in `admin_users` for `auth.uid()`. `security definer`, so it can check `admin_users` (no public SELECT policy) without granting anon/authenticated direct access to that table. Defined in migration 02 (not 01), because a `LANGUAGE SQL` function's body is parsed and bound to the catalog at `CREATE FUNCTION` time — unlike `plpgsql`, it can't reference a table that doesn't exist yet.
- `public.has_admin_role(roles admin_role[])` — the caller's role is in the given list, or is `super_admin`. Same `security definer` reasoning.

**A real gotcha worth flagging:** Supabase grants `EXECUTE` on every newly created function directly to `anon`/`authenticated` (project-level `ALTER DEFAULT PRIVILEGES`). A plain `revoke all on function ... from public` does **not** undo that — those are separate grants to those roles, not to the `PUBLIC` pseudo-role. Every `security definer` function meant to be restricted (the inventory reserve/release/commit functions, `next_invoice_number()`) explicitly revokes from `anon, authenticated` too.

Legend: **R** select · **C** insert · **U** update · **D** delete · **own** = scoped to the caller's own row(s) · ✗ = no access.

## Policy matrix

| Table                   | anon                           | guest                                    | customer                            | admin                                               | service_role                                |
| ----------------------- | ------------------------------ | ---------------------------------------- | ----------------------------------- | --------------------------------------------------- | ------------------------------------------- |
| profiles                | ✗                              | R/U own¹                                 | R/U own¹                            | R all (support+); U (manager+)                      | all (bypasses RLS)                          |
| usernames               | ✗                              | R own; C own                             | R own; C own                        | R all                                               | all                                         |
| admin_invites           | ✗                              | ✗                                        | ✗                                   | all (super_admin only)                              | all                                         |
| admin_users             | ✗                              | ✗                                        | ✗                                   | R all; C/U/D (super_admin only)                     | all                                         |
| sellers                 | R active                       | R active                                 | R active                            | R all; C/U (manager+)                               | all                                         |
| attribute_sets          | R                              | R                                        | R                                   | all (catalog+)                                      | all                                         |
| brands                  | R active                       | R active                                 | R active                            | all (catalog+)                                      | all                                         |
| categories              | R active                       | R active                                 | R active                            | all (catalog+)                                      | all                                         |
| products                | R active                       | R active                                 | R active                            | all (catalog+)                                      | all                                         |
| product_options         | R (active product)             | R (active product)                       | R (active product)                  | all (catalog+)                                      | all                                         |
| product_images          | R (active product)             | R (active product)                       | R (active product)                  | all (catalog+)                                      | all                                         |
| variants                | ✗ (via `variants_public`²)     | ✗ (via `variants_public`²)               | ✗ (via `variants_public`²)          | R all; C/U/D (catalog+)                             | all                                         |
| inventory               | ✗ (via `inventory_available`²) | ✗ (via `inventory_available`²)           | ✗ (via `inventory_available`²)      | R (catalog/orders+); U (catalog+)                   | all                                         |
| addresses               | ✗                              | all own                                  | all own                             | R all (orders/support+)                             | all                                         |
| serviceable_pincodes    | R active                       | R active                                 | R active                            | all (orders+)                                       | all                                         |
| serviceability_requests | ✗                              | C                                        | C                                   | R (any admin)                                       | all                                         |
| banners                 | R active & scheduled           | R active & scheduled                     | R active & scheduled                | all (catalog+)                                      | all                                         |
| home_sections           | R active                       | R active                                 | R active                            | all (catalog+)                                      | all                                         |
| store_config            | R                              | R                                        | R                                   | R all; U (manager+)                                 | all                                         |
| feature_flags           | R                              | R                                        | R                                   | R all; U (manager+)                                 | all                                         |
| carts                   | ✗                              | all own                                  | all own                             | R (support+)                                        | all                                         |
| cart_items              | ✗                              | all own (via cart ownership)             | all own (via cart ownership)        | R (support+)                                        | all                                         |
| wishlists               | ✗                              | ✗ (registered only)                      | all own                             | ✗                                                   | all                                         |
| recently_viewed         | ✗                              | all own                                  | all own                             | ✗                                                   | all                                         |
| order_number_counters   | ✗                              | ✗ (used only via the generator function) | ✗                                   | ✗                                                   | all                                         |
| invoice_number_counters | ✗                              | ✗                                        | ✗                                   | ✗                                                   | all                                         |
| orders                  | ✗                              | R own; C own                             | R own; C own                        | R all; U (orders+)³                                 | all                                         |
| order_items             | ✗                              | R (own order)                            | R (own order)                       | R all (orders/support+)                             | all                                         |
| order_status_history    | ✗                              | R (own order)                            | R (own order)                       | R all (orders/support+)                             | all                                         |
| payments                | ✗                              | ✗ (via `payments_customer`²)             | ✗ (via `payments_customer`²)        | R all (orders+)                                     | all                                         |
| returns                 | ✗                              | R own; C own (delivered)                 | R own; C own (delivered)            | R all; U (orders+)                                  | all                                         |
| refunds                 | ✗                              | R (own order)                            | R (own order)                       | R all; C (orders+)                                  | all                                         |
| shipments               | ✗                              | R (own order)                            | R (own order)                       | all (orders+)                                       | all                                         |
| coupons                 | ✗ (lookup via function⁴)       | ✗ (lookup via function⁴)                 | ✗ (lookup via function⁴)            | R all (orders+); C/U/D (manager+)                   | all                                         |
| coupon_redemptions      | ✗                              | R own                                    | R own                               | R all (orders+)                                     | all                                         |
| points_ledger           | ✗                              | R own                                    | R own                               | R all (manager+); C `admin_adjust` only (manager+)⁵ | all (append-only trigger applies even here) |
| points_boosters         | R active                       | R active                                 | R active                            | all (manager+)                                      | all                                         |
| shopping_lists          | ✗                              | R/C/D own                                | R/C/D own                           | R (support+)                                        | all                                         |
| shopping_list_items     | ✗                              | R/U own (via list ownership)             | R/U own (via list ownership)        | R (support+)                                        | all                                         |
| reviews                 | R published                    | R published; R own                       | R published; R/C/U own (registered) | R all; U status (support+)                          | all                                         |
| notifications           | ✗                              | R/U own                                  | R/U own                             | ✗                                                   | all                                         |
| device_tokens           | ✗                              | all own                                  | all own                             | ✗                                                   | all                                         |

¹ A customer's own `UPDATE` can never set `deleted_at` directly — `REVOKE UPDATE (deleted_at) ON public.profiles FROM authenticated` locks it at the column-privilege level, below RLS. Account deletion is a dedicated flow (later phase).

² **Column-hiding is done with views, because RLS filters rows, not columns.** The base table has no SELECT policy at all for anon/authenticated (admins only); the view is a plain (non-`security_invoker`) view, so it runs as its owner — which, since that owner also owns the underlying table and `FORCE ROW LEVEL SECURITY` is never set, bypasses the restrictive base-table policy by design — and then re-applies its own filtering/projection explicitly in the view body:

- `variants_public` — all variant columns except `member_price_paise`, which is `null` unless the caller is authenticated and non-anonymous (`case when is_anonymous() then null else member_price_paise end`).
- `inventory_available` — only `variant_id, seller_id, available, is_low_stock` (never raw `quantity`/`reserved`).
- `payments_customer` — all payment columns except `raw_event` (the webhook payload), and explicitly scoped to `orders.user_id = auth.uid()` in the view body (since it bypasses the admin-only base-table RLS, the view itself must not be globally readable).

³ No `UPDATE` policy exists for a plain customer at all, so an attempted status change from the client simply updates 0 rows (no error) — this is RLS behaviour, not something to catch via try/catch. All real status changes go through `orders_validate_status_transition()` (migration 07) plus either the admin policy or a `service_role` Edge Function.

⁴ `public.lookup_coupon(code)` (`security definer`, migration 08) is the only read path for anon/guest/customer — there is no SELECT policy on the `coupons` table for them at all, so no one can enumerate every currently-valid code by scanning the table.

⁵ `points_ledger` has no `UPDATE`/`DELETE` policy for any role, and on top of that, triggers (`points_ledger_no_update`/`points_ledger_no_delete`, migration 09) unconditionally reject `UPDATE`/`DELETE` — this also blocks `service_role` and the table owner, which plain RLS alone cannot do (`service_role` bypasses RLS entirely).

## Rules that are not plain RLS

- **Price, stock, coupon, and points maths never trust the client.** The `place-order` Edge Function (Phase 6, `service_role`) recomputes everything server-side.
- **Order status transitions are validated by a trigger** (`orders_validate_status_transition`, migration 07), not just by who is allowed to run the `UPDATE`. An admin cannot jump `placed → delivered` without the intermediate rows, and the transition also stamps the matching lifecycle timestamp and, on `delivered`, computes `points_credit_at`/`return_window_ends_at` from `category_return_window()`.
- **`points_ledger` immutability** is enforced by triggers, not just RLS (see footnote 5 above) — the only way to correct a mistake is an offsetting row, never an edit.
- **Inventory is mutated only through `reserve_inventory`/`release_inventory`/`commit_inventory`** (migration 03, `security definer`, `service_role`-only). No role — including a plain `UPDATE` by an authenticated customer or even an admin — can touch `inventory.quantity`/`reserved` directly except through those functions or the `inventory_update_admin` policy (manual stock corrections).
- **Order/invoice numbers are generated server-side** by `next_order_number()`/`next_invoice_number()` (migration 07, counter tables + `security definer`), never constructed by the client.
- **Username → email resolution** happens only inside the `username-login` Edge Function (Phase 4, `service_role`). There is no RLS policy, function, or view that lets any client-reachable role read `auth.users.email` by username.
- **Guest order lookup** (order number + email/phone) is planned as a rate-limited `security definer` function (Phase 4/6) returning a minimal summary — not yet built in Phase 1, since `orders` doesn't need it until checkout exists.
- **Storage policies mirror the equivalent table's RLS** (migration 13): `product-images`/`banners` are public-read, catalog+-write; `shopping-list-uploads/{user_id}/…` is owner-only (via `storage.foldername(name)[1] = auth.uid()::text`) plus support/manager/super_admin read.
- **Anonymous sign-in abuse:** enable CAPTCHA (hCaptcha/Turnstile) before launch, and keep Supabase's per-IP anonymous rate limit — provider choice is still open (`docs/open-questions.md`).
- **Account conversion:** because the `user_id` is unchanged when an anonymous session gets a password/email (Supabase `updateUser`), no data migration is needed — orders, addresses, cart, and points stay attached automatically.
- **Marketplace later:** scoping a seller-admin to their own seller (`admin_users.seller_id`) needs `seller_id = current_seller_id()` added to the relevant admin policies — not done in Phase 1 (single seller).

## Testing

`supabase/tests/database/*.sql` has a pgTAP suite covering RLS-enabled-on-every-table, the `admin_invites` → `admin_users` signup trigger, anon/guest/customer/admin access patterns for the tables above, ledger immutability, the status-transition guard, and the order/invoice number generators.

**Could not be run in this environment** (no Docker, so no local Supabase stack, so no `pnpm supabase test db`). Instead, every one of these assertions was verified by hand against a throwaway local Postgres 17 cluster with a minimal Supabase-compatible shim (`auth.uid()`/`auth.jwt()`, `storage.objects`, the `anon`/`authenticated`/`service_role` roles) — all 13 migrations applied cleanly from zero, the seed applied and re-ran idempotently, and all 40 manual test assertions passed. Run `pnpm supabase test db` after `supabase start` to execute the real pgTAP suite.
