-- Phase 1: extensions, enums, and shared helper functions/triggers.
-- See docs/data-model.md for the full schema and docs/rls-policies.md for the actor model.

-- ---------------------------------------------------------------------------
-- `erp` schema (ADR: this Supabase project's database is shared with another,
-- pre-existing application that owns the `public` schema. All Vivodha objects
-- live in `erp` instead, so the two apps never collide. See docs/decisions.md.)
--
-- Unlike `public`, Supabase does not auto-grant schema usage/table privileges
-- for custom schemas, so we grant them explicitly here. RLS policies (added
-- per-table from migration 02 onward) remain the real authorization gate;
-- these grants only satisfy Postgres' base privilege check.
-- ---------------------------------------------------------------------------
create schema if not exists erp;

grant usage on schema erp to anon, authenticated, service_role;

alter default privileges in schema erp grant all on tables to service_role;
alter default privileges in schema erp grant all on sequences to service_role;
alter default privileges in schema erp grant all on routines to service_role;
alter default privileges in schema erp grant execute on functions to service_role;

alter default privileges in schema erp grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema erp grant usage, select on sequences to authenticated;

alter default privileges in schema erp grant select on tables to anon;

-- RLS policies and views added from migration 02 onward call helper functions
-- (is_admin(), is_anonymous(), has_admin_role(...)) unqualified. Those
-- policies run under the querying role's own session search_path, which
-- Supabase does not extend to custom schemas by default — so without this,
-- every policy referencing those functions would fail to resolve them once
-- they live in `erp`. (The functions' own bodies stay safe regardless: each
-- is defined with `set search_path = ''` and fully-qualifies its internals.)
alter role anon set search_path = "$user", erp, public, extensions;
alter role authenticated set search_path = "$user", erp, public, extensions;
alter role service_role set search_path = "$user", erp, public, extensions;

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
create type erp.order_status as enum (
  'pending_payment', 'placed', 'packed', 'shipped', 'out_for_delivery',
  'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'
);

create type erp.payment_method as enum ('upi', 'card', 'wallet', 'netbanking', 'cod');

create type erp.payment_status as enum (
  'created', 'pending', 'captured', 'failed', 'refunded', 'partially_refunded'
);

create type erp.delivery_mode as enum ('own_delivery', 'courier');

create type erp.product_status as enum ('draft', 'active', 'archived');

create type erp.return_status as enum (
  'requested', 'approved', 'rejected', 'picked_up', 'received', 'refunded'
);

create type erp.refund_status as enum ('pending', 'processing', 'processed', 'failed');

create type erp.points_reason as enum (
  'earn_order', 'earn_booster', 'redeem_order', 'reverse_cancel',
  'reverse_return', 'expire', 'admin_adjust'
);

-- ADR-128: super_admin / manager / catalog / orders / support (not owner/admin/... from Phase 0).
create type erp.admin_role as enum ('super_admin', 'manager', 'catalog', 'orders', 'support');

create type erp.shopping_list_source as enum ('text', 'photo', 'upload');

create type erp.coupon_type as enum ('percent', 'flat', 'free_delivery');

-- ---------------------------------------------------------------------------
-- updated_at trigger (attached to every mutable table in later migrations)
-- ---------------------------------------------------------------------------
create or replace function erp.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function erp.set_updated_at() is
  'Row trigger: stamps updated_at = now() on every UPDATE. Attach with: '
  'create trigger set_updated_at before update on <table> for each row execute function erp.set_updated_at();';

-- NOTE: is_admin() / has_admin_role() are NOT defined here even though they are
-- generic "admin helper" functions, because they query erp.admin_users —
-- and unlike plpgsql, a LANGUAGE SQL function's body is parsed and bound to
-- the catalog at CREATE FUNCTION time, so admin_users must already exist.
-- They are defined in migration 02, immediately after that table.

-- ---------------------------------------------------------------------------
-- Guest (anonymous Supabase Auth user) helper
-- No security definer needed: auth.jwt() is already readable by the calling role.
-- ---------------------------------------------------------------------------
create or replace function erp.is_anonymous()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

comment on function erp.is_anonymous() is 'True if the current JWT belongs to a Supabase anonymous (guest) session.';

revoke all on function erp.set_updated_at() from public;
revoke all on function erp.is_anonymous() from public;
grant execute on function erp.is_anonymous() to anon, authenticated;
