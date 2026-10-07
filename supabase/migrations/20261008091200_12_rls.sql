-- Phase 1: Row Level Security. Every table in `public` gets RLS enabled here,
-- plus the policies matching docs/rls-policies.md. A table with RLS enabled and
-- no matching policy denies that operation to that role outright — the safe
-- default. The final DO block fails the migration if any public base table is
-- missing RLS.
--
-- Actors (see docs/rls-policies.md):
--   anon           = no session yet (Postgres role `anon`)
--   guest          = Supabase anonymous sign-in (Postgres role `authenticated`,
--                    JWT is_anonymous = true) — public.is_anonymous()
--   customer       = registered, verified (role `authenticated`, is_anonymous = false)
--   admin          = active row in admin_users — public.is_admin() / has_admin_role()
--   service_role   = Edge Functions only; bypasses RLS entirely (never used by clients)

-- ---------------------------------------------------------------------------
-- Enable RLS on every table created so far.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.usernames enable row level security;
alter table public.admin_invites enable row level security;
alter table public.admin_users enable row level security;
alter table public.sellers enable row level security;
alter table public.attribute_sets enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_options enable row level security;
alter table public.variants enable row level security;
alter table public.inventory enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.serviceable_pincodes enable row level security;
alter table public.serviceability_requests enable row level security;
alter table public.banners enable row level security;
alter table public.home_sections enable row level security;
alter table public.store_config enable row level security;
alter table public.feature_flags enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.recently_viewed enable row level security;
alter table public.order_number_counters enable row level security;
alter table public.invoice_number_counters enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.returns enable row level security;
alter table public.refunds enable row level security;
alter table public.shipments enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.points_ledger enable row level security;
alter table public.points_boosters enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.device_tokens enable row level security;

-- order_number_counters / invoice_number_counters: RLS enabled, deliberately NO
-- policies for anon/authenticated. Only the owning SECURITY DEFINER functions
-- (next_order_number/next_invoice_number, which run as the table owner and
-- therefore bypass RLS) or service_role ever touch these.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());

create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (has_admin_role(array['support', 'manager', 'super_admin']::public.admin_role[]));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (has_admin_role(array['manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['manager', 'super_admin']::public.admin_role[]));

-- Column-level lock on top of RLS: a customer's own UPDATE can never set
-- deleted_at directly (account deletion is a dedicated, audited flow).
revoke update (deleted_at) on public.profiles from authenticated;

-- ---------------------------------------------------------------------------
-- usernames (no SELECT for anon/authenticated beyond owner; resolved to an
-- email only by the service-role username-login Edge Function in Phase 4)
-- ---------------------------------------------------------------------------
create policy usernames_select_own on public.usernames
  for select to authenticated using (user_id = auth.uid());

create policy usernames_select_admin on public.usernames
  for select to authenticated using (is_admin());

create policy usernames_insert_own on public.usernames
  for insert to authenticated with check (user_id = auth.uid() and not is_anonymous());

-- No UPDATE/DELETE policy: a username, once set, is permanent in Phase 1.

-- ---------------------------------------------------------------------------
-- admin_invites / admin_users (super_admin manages; any admin can read admin_users)
-- ---------------------------------------------------------------------------
create policy admin_invites_all_super_admin on public.admin_invites
  for all to authenticated
  using (has_admin_role(array['super_admin']::public.admin_role[]))
  with check (has_admin_role(array['super_admin']::public.admin_role[]));

create policy admin_users_select_admin on public.admin_users
  for select to authenticated using (is_admin());

create policy admin_users_insert_super_admin on public.admin_users
  for insert to authenticated
  with check (has_admin_role(array['super_admin']::public.admin_role[]));

create policy admin_users_update_super_admin on public.admin_users
  for update to authenticated
  using (has_admin_role(array['super_admin']::public.admin_role[]))
  with check (has_admin_role(array['super_admin']::public.admin_role[]));

create policy admin_users_delete_super_admin on public.admin_users
  for delete to authenticated
  using (has_admin_role(array['super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- Catalog: sellers, attribute_sets, brands, categories, products, product_options
-- Public read of active/non-deleted rows; catalog+ manage (insert/update/delete).
-- ---------------------------------------------------------------------------
create policy sellers_select_active on public.sellers
  for select to anon, authenticated using (status = 'active');

create policy sellers_manage_admin on public.sellers
  for all to authenticated
  using (has_admin_role(array['manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['manager', 'super_admin']::public.admin_role[]));

create policy attribute_sets_select on public.attribute_sets
  for select to anon, authenticated using (true);

create policy attribute_sets_manage_admin on public.attribute_sets
  for all to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy brands_select_active on public.brands
  for select to anon, authenticated using (is_active and deleted_at is null);

create policy brands_manage_admin on public.brands
  for all to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy categories_select_active on public.categories
  for select to anon, authenticated using (is_active and deleted_at is null);

create policy categories_manage_admin on public.categories
  for all to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy products_select_active on public.products
  for select to anon, authenticated using (status = 'active' and deleted_at is null);

create policy products_manage_admin on public.products
  for all to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy product_options_select on public.product_options
  for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_options.product_id and p.status = 'active' and p.deleted_at is null
  ));

create policy product_options_manage_admin on public.product_options
  for all to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy product_images_select on public.product_images
  for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_images.product_id and p.status = 'active' and p.deleted_at is null
  ));

create policy product_images_manage_admin on public.product_images
  for all to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

-- variants / inventory: NO select policy for anon/authenticated on the base
-- table at all (member_price_paise and raw stock counts must never leak).
-- Clients read through variants_public / inventory_available below instead.
create policy variants_select_admin on public.variants
  for select to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy variants_manage_admin on public.variants
  for insert to authenticated
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy variants_update_admin on public.variants
  for update to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy variants_delete_admin on public.variants
  for delete to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy inventory_select_admin on public.inventory
  for select to authenticated
  using (has_admin_role(array['catalog', 'orders', 'manager', 'super_admin']::public.admin_role[]));

create policy inventory_update_admin on public.inventory
  for update to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- addresses
-- ---------------------------------------------------------------------------
create policy addresses_all_own on public.addresses
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy addresses_select_admin on public.addresses
  for select to authenticated
  using (has_admin_role(array['orders', 'support', 'manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- serviceable_pincodes / serviceability_requests
-- ---------------------------------------------------------------------------
create policy serviceable_pincodes_select_active on public.serviceable_pincodes
  for select to anon, authenticated using (is_active);

create policy serviceable_pincodes_manage_admin on public.serviceable_pincodes
  for all to authenticated
  using (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]));

-- Anon must go through a function (serviceability-check, Phase 4); only guest
-- and customer sessions can insert a notify-me request directly.
create policy serviceability_requests_insert on public.serviceability_requests
  for insert to authenticated with check (true);

create policy serviceability_requests_select_admin on public.serviceability_requests
  for select to authenticated using (is_admin());

-- ---------------------------------------------------------------------------
-- banners / home_sections / store_config / feature_flags
-- ---------------------------------------------------------------------------
create policy banners_select_scheduled on public.banners
  for select to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy banners_manage_admin on public.banners
  for all to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy home_sections_select_active on public.home_sections
  for select to anon, authenticated using (is_active);

create policy home_sections_manage_admin on public.home_sections
  for all to authenticated
  using (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[]));

create policy store_config_select on public.store_config
  for select to anon, authenticated using (true);

create policy store_config_update_admin on public.store_config
  for update to authenticated
  using (has_admin_role(array['manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['manager', 'super_admin']::public.admin_role[]));

create policy feature_flags_select on public.feature_flags
  for select to anon, authenticated using (true);

create policy feature_flags_update_admin on public.feature_flags
  for update to authenticated
  using (has_admin_role(array['manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- carts / cart_items (guest + customer, own cart only)
-- ---------------------------------------------------------------------------
create policy carts_all_own on public.carts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy carts_select_admin on public.carts
  for select to authenticated
  using (has_admin_role(array['support', 'manager', 'super_admin']::public.admin_role[]));

create policy cart_items_all_own on public.cart_items
  for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid()));

create policy cart_items_select_admin on public.cart_items
  for select to authenticated
  using (has_admin_role(array['support', 'manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- wishlists (registered customers only) / recently_viewed (guest + customer)
-- ---------------------------------------------------------------------------
create policy wishlists_all_own on public.wishlists
  for all to authenticated
  using (user_id = auth.uid() and not is_anonymous())
  with check (user_id = auth.uid() and not is_anonymous());

create policy recently_viewed_all_own on public.recently_viewed
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- orders / order_items / order_status_history
-- Customers can INSERT their own order (checkout) but can never UPDATE it —
-- every status change goes through orders_validate_status_transition() plus
-- an admin policy, or a service-role Edge Function.
-- ---------------------------------------------------------------------------
create policy orders_select_own on public.orders
  for select to authenticated using (user_id = auth.uid());

create policy orders_select_admin on public.orders
  for select to authenticated
  using (has_admin_role(array['orders', 'support', 'manager', 'super_admin']::public.admin_role[]));

create policy orders_insert_own on public.orders
  for insert to authenticated with check (user_id = auth.uid());

create policy orders_update_admin on public.orders
  for update to authenticated
  using (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]));

create policy order_items_select_own on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));

create policy order_items_select_admin on public.order_items
  for select to authenticated
  using (has_admin_role(array['orders', 'support', 'manager', 'super_admin']::public.admin_role[]));

create policy order_status_history_select_own on public.order_status_history
  for select to authenticated
  using (exists (
    select 1 from public.orders o where o.id = order_status_history.order_id and o.user_id = auth.uid()
  ));

create policy order_status_history_select_admin on public.order_status_history
  for select to authenticated
  using (has_admin_role(array['orders', 'support', 'manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- payments (base table admin-only; customers read via payments_customer below)
-- ---------------------------------------------------------------------------
create policy payments_select_admin on public.payments
  for select to authenticated
  using (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- returns / refunds / shipments
-- ---------------------------------------------------------------------------
create policy returns_select_own on public.returns
  for select to authenticated using (user_id = auth.uid());

create policy returns_insert_own on public.returns
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.id = returns.order_id and o.user_id = auth.uid() and o.status = 'delivered'
    )
  );

create policy returns_select_admin on public.returns
  for select to authenticated
  using (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]));

create policy returns_update_admin on public.returns
  for update to authenticated
  using (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]));

create policy refunds_select_own on public.refunds
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = refunds.order_id and o.user_id = auth.uid()));

create policy refunds_select_admin on public.refunds
  for select to authenticated
  using (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]));

create policy refunds_insert_admin on public.refunds
  for insert to authenticated
  with check (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]));

create policy shipments_select_own on public.shipments
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = shipments.order_id and o.user_id = auth.uid()));

create policy shipments_manage_admin on public.shipments
  for all to authenticated
  using (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- coupons (no direct browsing — see public.lookup_coupon in migration 08) /
-- coupon_redemptions
-- ---------------------------------------------------------------------------
create policy coupons_select_admin on public.coupons
  for select to authenticated
  using (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]));

create policy coupons_manage_admin on public.coupons
  for insert to authenticated
  with check (has_admin_role(array['manager', 'super_admin']::public.admin_role[]));

create policy coupons_update_admin on public.coupons
  for update to authenticated
  using (has_admin_role(array['manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['manager', 'super_admin']::public.admin_role[]));

create policy coupons_delete_admin on public.coupons
  for delete to authenticated
  using (has_admin_role(array['manager', 'super_admin']::public.admin_role[]));

create policy coupon_redemptions_select_own on public.coupon_redemptions
  for select to authenticated using (user_id = auth.uid());

create policy coupon_redemptions_select_admin on public.coupon_redemptions
  for select to authenticated
  using (has_admin_role(array['orders', 'manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- points_ledger (append-only; also enforced by triggers in migration 09) /
-- points_boosters
-- ---------------------------------------------------------------------------
create policy points_ledger_select_own on public.points_ledger
  for select to authenticated using (user_id = auth.uid());

create policy points_ledger_select_admin on public.points_ledger
  for select to authenticated
  using (has_admin_role(array['manager', 'super_admin']::public.admin_role[]));

create policy points_ledger_insert_admin_adjust on public.points_ledger
  for insert to authenticated
  with check (
    has_admin_role(array['manager', 'super_admin']::public.admin_role[])
    and reason = 'admin_adjust'
  );

create policy points_boosters_select_active on public.points_boosters
  for select to anon, authenticated using (is_active);

create policy points_boosters_manage_admin on public.points_boosters
  for all to authenticated
  using (has_admin_role(array['manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- shopping_lists / shopping_list_items
-- ---------------------------------------------------------------------------
create policy shopping_lists_select_own on public.shopping_lists
  for select to authenticated using (user_id = auth.uid());

create policy shopping_lists_insert_own on public.shopping_lists
  for insert to authenticated with check (user_id = auth.uid());

create policy shopping_lists_delete_own on public.shopping_lists
  for delete to authenticated using (user_id = auth.uid());

create policy shopping_lists_select_admin on public.shopping_lists
  for select to authenticated
  using (has_admin_role(array['support', 'manager', 'super_admin']::public.admin_role[]));

create policy shopping_list_items_select_own on public.shopping_list_items
  for select to authenticated
  using (exists (
    select 1 from public.shopping_lists sl
    where sl.id = shopping_list_items.list_id and sl.user_id = auth.uid()
  ));

create policy shopping_list_items_update_own on public.shopping_list_items
  for update to authenticated
  using (exists (
    select 1 from public.shopping_lists sl
    where sl.id = shopping_list_items.list_id and sl.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shopping_lists sl
    where sl.id = shopping_list_items.list_id and sl.user_id = auth.uid()
  ));

create policy shopping_list_items_select_admin on public.shopping_list_items
  for select to authenticated
  using (has_admin_role(array['support', 'manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create policy reviews_select_published on public.reviews
  for select to anon, authenticated using (status = 'published');

create policy reviews_select_own on public.reviews
  for select to authenticated using (user_id = auth.uid());

create policy reviews_insert_own on public.reviews
  for insert to authenticated with check (user_id = auth.uid() and not is_anonymous());

create policy reviews_update_own on public.reviews
  for update to authenticated
  using (user_id = auth.uid() and not is_anonymous())
  with check (user_id = auth.uid());

create policy reviews_manage_admin on public.reviews
  for update to authenticated
  using (has_admin_role(array['support', 'manager', 'super_admin']::public.admin_role[]))
  with check (has_admin_role(array['support', 'manager', 'super_admin']::public.admin_role[]));

-- ---------------------------------------------------------------------------
-- notifications / device_tokens
-- ---------------------------------------------------------------------------
create policy notifications_select_own on public.notifications
  for select to authenticated using (user_id = auth.uid());

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy device_tokens_all_own on public.device_tokens
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Column-hiding exposure views.
-- RLS filters ROWS, not columns, so a sensitive column that must be visible to
-- some callers and hidden from others needs a view. These views are deliberately
-- plain (not `security_invoker`): they run as their owner, which — since that
-- owner also owns the underlying table and FORCE ROW LEVEL SECURITY is never
-- set — bypasses the restrictive base-table policies above by design, then
-- re-applies its own filtering/column projection explicitly in the view body.
-- ---------------------------------------------------------------------------
create view public.variants_public as
select
  v.id,
  v.product_id,
  v.seller_id,
  v.sku,
  v.option_values,
  v.label,
  v.mrp_paise,
  v.price_paise,
  -- "Vivo price": null for anon and for guest (anonymous) sessions.
  case when is_anonymous() then null else v.member_price_paise end as member_price_paise,
  v.barcode,
  v.shipping_weight_grams,
  v.max_per_order,
  v.position
from public.variants v
join public.products p on p.id = v.product_id
where v.is_active
  and v.deleted_at is null
  and p.status = 'active'
  and p.deleted_at is null;

comment on view public.variants_public is
  'Public catalog read of variants. member_price_paise is null unless the caller '
  'is an authenticated, non-anonymous (registered) user.';

grant select on public.variants_public to anon, authenticated;

create view public.inventory_available as
select
  i.variant_id,
  i.seller_id,
  (i.quantity - i.reserved) as available,
  (i.quantity - i.reserved) <= i.low_stock_threshold as is_low_stock
from public.inventory i;

comment on view public.inventory_available is
  'Public stock read: only the computed available count, never raw quantity/reserved.';

grant select on public.inventory_available to anon, authenticated;

create view public.payments_customer as
select
  p.id,
  p.order_id,
  p.provider,
  p.method,
  p.amount_paise,
  p.currency,
  p.status,
  p.provider_order_id,
  p.provider_payment_id,
  p.error_code,
  p.error_description,
  p.created_at,
  p.updated_at
from public.payments p
join public.orders o on o.id = p.order_id
where o.user_id = auth.uid();

comment on view public.payments_customer is
  'Customer-safe read of their own payments: excludes raw_event (the webhook '
  'payload). Explicitly scoped to auth.uid() in the view body, since this view '
  'bypasses the (admin-only) RLS on the base payments table.';

grant select on public.payments_customer to authenticated;

-- ---------------------------------------------------------------------------
-- Safety net: fail this migration if any base table in `public` does not have
-- RLS enabled (CLAUDE.md: "RLS on every table", no exceptions).
-- ---------------------------------------------------------------------------
do $$
declare
  v_missing text;
begin
  select string_agg(format('%I.%I', schemaname, tablename), ', ')
  into v_missing
  from pg_tables
  where schemaname = 'public'
    and not exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = pg_tables.schemaname
        and c.relname = pg_tables.tablename
        and c.relrowsecurity
    );

  if v_missing is not null then
    raise exception 'RLS is not enabled on: %', v_missing;
  end if;
end;
$$;
