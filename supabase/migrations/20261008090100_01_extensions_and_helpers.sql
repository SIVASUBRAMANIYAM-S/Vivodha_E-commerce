-- Phase 1: extensions, enums, and shared helper functions/triggers.
-- See docs/data-model.md for the full schema and docs/rls-policies.md for the actor model.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
-- Supabase projects already have an `extensions` schema on every role's search_path
-- (search_path = "$user", public, extensions), so unqualified calls below
-- (gen_random_uuid(), etc.) resolve correctly once installed here.
create extension if not exists pgcrypto with schema extensions;   -- gen_random_uuid()
create extension if not exists citext with schema extensions;    -- case-insensitive usernames/coupon codes
create extension if not exists pg_trgm with schema extensions;   -- typo-tolerant search
create extension if not exists btree_gin with schema extensions; -- composite GIN indexes
create extension if not exists unaccent with schema extensions;  -- search normalisation

-- ---------------------------------------------------------------------------
-- Enums (docs/data-model.md "Enums" table; admin_role per ADR-128)
-- ---------------------------------------------------------------------------
create type public.order_status as enum (
  'pending_payment', 'placed', 'packed', 'shipped', 'out_for_delivery',
  'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'
);

create type public.payment_method as enum ('upi', 'card', 'wallet', 'netbanking', 'cod');

create type public.payment_status as enum (
  'created', 'pending', 'captured', 'failed', 'refunded', 'partially_refunded'
);

create type public.delivery_mode as enum ('own_delivery', 'courier');

create type public.product_status as enum ('draft', 'active', 'archived');

create type public.return_status as enum (
  'requested', 'approved', 'rejected', 'picked_up', 'received', 'refunded'
);

create type public.refund_status as enum ('pending', 'processing', 'processed', 'failed');

create type public.points_reason as enum (
  'earn_order', 'earn_booster', 'redeem_order', 'reverse_cancel',
  'reverse_return', 'expire', 'admin_adjust'
);

-- ADR-128: super_admin / manager / catalog / orders / support (not owner/admin/... from Phase 0).
create type public.admin_role as enum ('super_admin', 'manager', 'catalog', 'orders', 'support');

create type public.shopping_list_source as enum ('text', 'photo', 'upload');

create type public.coupon_type as enum ('percent', 'flat', 'free_delivery');

-- ---------------------------------------------------------------------------
-- updated_at trigger (attached to every mutable table in later migrations)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Row trigger: stamps updated_at = now() on every UPDATE. Attach with: '
  'create trigger set_updated_at before update on <table> for each row execute function public.set_updated_at();';

-- NOTE: is_admin() / has_admin_role() are NOT defined here even though they are
-- generic "admin helper" functions, because they query public.admin_users —
-- and unlike plpgsql, a LANGUAGE SQL function's body is parsed and bound to
-- the catalog at CREATE FUNCTION time, so admin_users must already exist.
-- They are defined in migration 02, immediately after that table.

-- ---------------------------------------------------------------------------
-- Guest (anonymous Supabase Auth user) helper
-- No security definer needed: auth.jwt() is already readable by the calling role.
-- ---------------------------------------------------------------------------
create or replace function public.is_anonymous()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

comment on function public.is_anonymous() is 'True if the current JWT belongs to a Supabase anonymous (guest) session.';

revoke all on function public.set_updated_at() from public;
revoke all on function public.is_anonymous() from public;
grant execute on function public.is_anonymous() to anon, authenticated;
