-- Phase 1: coupons.

create table erp.coupons (
  id uuid primary key default gen_random_uuid(),
  code extensions.citext not null unique,
  description text,
  type erp.coupon_type not null,
  value bigint not null check (value >= 0),
  max_discount_paise bigint check (max_discount_paise is null or max_discount_paise >= 0),
  min_order_paise bigint not null default 0 check (min_order_paise >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit_total int check (usage_limit_total is null or usage_limit_total > 0),
  usage_limit_per_user int check (usage_limit_per_user is null or usage_limit_per_user > 0),
  first_order_only boolean not null default false,
  category_ids uuid[] not null default '{}',
  seller_id uuid references erp.sellers (id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_schedule_order check (starts_at is null or ends_at is null or starts_at <= ends_at)
);

create trigger set_updated_at
  before update on erp.coupons
  for each row execute function erp.set_updated_at();

create table erp.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references erp.coupons (id),
  user_id uuid not null references erp.profiles (id),
  order_id uuid not null unique references erp.orders (id),
  discount_paise bigint not null check (discount_paise >= 0),
  status text not null default 'applied' check (status in ('applied', 'voided')),
  created_at timestamptz not null default now()
);

create index coupon_redemptions_coupon_id_idx on erp.coupon_redemptions (coupon_id);
create index coupon_redemptions_user_id_idx on erp.coupon_redemptions (user_id);

-- ---------------------------------------------------------------------------
-- Coupons are looked up by exact code, never browsed: migration 12 gives anon/
-- authenticated no SELECT policy on the base table, so this is the only way a
-- client can check a code (prevents enumerating every currently-valid coupon).
-- ---------------------------------------------------------------------------
create or replace function erp.lookup_coupon(p_code extensions.citext)
returns erp.coupons
language sql
stable
security definer
set search_path = ''
as $$
  select *
  from erp.coupons
  where code = p_code
    and is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now());
$$;

comment on function erp.lookup_coupon(extensions.citext) is
  'Exact-code coupon lookup. Returns no row for an unknown, inactive, or out-of-window code.';

revoke all on function erp.lookup_coupon(extensions.citext) from public;
grant execute on function erp.lookup_coupon(extensions.citext) to anon, authenticated;
