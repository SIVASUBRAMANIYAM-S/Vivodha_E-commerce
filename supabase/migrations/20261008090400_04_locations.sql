-- Phase 1: delivery locations — customer addresses, serviceable pincodes, and
-- "coming soon, notify me" requests for unserviceable pincodes.

create table erp.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references erp.profiles (id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  line1 text not null,
  line2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  lat double precision,
  lng double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one default address per user.
create unique index addresses_one_default_per_user
  on erp.addresses (user_id) where is_default;

create index addresses_user_id_idx on erp.addresses (user_id);

create trigger set_updated_at
  before update on erp.addresses
  for each row execute function erp.set_updated_at();

create table erp.serviceable_pincodes (
  pincode text primary key check (pincode ~ '^[1-9][0-9]{5}$'),
  city text,
  state text,
  delivery_mode erp.delivery_mode not null,
  delivery_fee_paise bigint not null default 0 check (delivery_fee_paise >= 0),
  free_delivery_threshold_paise bigint check (free_delivery_threshold_paise is null or free_delivery_threshold_paise >= 0),
  eta_text text,
  cod_allowed boolean not null default true,
  cod_max_paise bigint check (cod_max_paise is null or cod_max_paise >= 0),
  -- ADR-130: seeded rows are placeholders until the owner supplies the real coverage area.
  is_placeholder boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table erp.serviceable_pincodes is
  'Delivery coverage per pincode. Rows with is_placeholder = true (ADR-130) are '
  'development scaffolding, not real coverage, and must be replaced before launch.';

create trigger set_updated_at
  before update on erp.serviceable_pincodes
  for each row execute function erp.set_updated_at();

create table erp.serviceability_requests (
  id uuid primary key default gen_random_uuid(),
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  email text,
  phone text,
  user_id uuid references erp.profiles (id) on delete set null,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint serviceability_requests_contact_required check (email is not null or phone is not null)
);

-- One notify-me request per pincode + contact (email takes precedence over phone).
create unique index serviceability_requests_unique_contact
  on erp.serviceability_requests (pincode, coalesce(email, phone));

create index serviceability_requests_pincode_idx on erp.serviceability_requests (pincode);
