-- Phase 1: merchandising & store configuration — banners, the admin-configurable
-- home layout, and the re-skinnability tables (store_config, feature_flags).

create table erp.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_path text not null,
  deep_link text,
  placement text not null check (placement in ('home_carousel', 'category_top')),
  category_id uuid references erp.categories (id),
  sort_order int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banners_schedule_order check (starts_at is null or ends_at is null or starts_at <= ends_at)
);

create index banners_placement_idx on erp.banners (placement) where is_active;

create trigger set_updated_at
  before update on erp.banners
  for each row execute function erp.set_updated_at();

create table erp.home_sections (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'banner_carousel', 'category_grid', 'shopping_list_entry',
    'rail_deals', 'rail_best_sellers', 'rail_top_picks',
    'rail_recently_viewed', 'rail_collection'
  )),
  title text,
  config jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  platform text[] not null default array['mobile']::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table erp.home_sections is
  'Admin-configurable home layout (ADR-005 re-skinnability). The app renders '
  'exactly these sections, in sort_order, instead of a hardcoded screen.';

create trigger set_updated_at
  before update on erp.home_sections
  for each row execute function erp.set_updated_at();

-- ---------------------------------------------------------------------------
-- store_config: a single row (id = 'default'). The id check constraint plus the
-- primary key together guarantee the table can never hold more than one row.
-- ---------------------------------------------------------------------------
create table erp.store_config (
  id text primary key default 'default' check (id = 'default'),
  store_name text not null default 'Vivodha',
  logo_url text,
  theme jsonb not null default '{}'::jsonb,
  features jsonb not null default '{}'::jsonb,
  business jsonb not null default '{}'::jsonb,
  legal jsonb not null default '{}'::jsonb,
  support jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references erp.profiles (id) on delete set null
);

comment on table erp.store_config is
  'Single-row re-skinnability config: logo, theme, feature toggles, delivery/points/'
  'returns business numbers, legal identity, and support details. logo_url (ADR-123) '
  'points at the real brand asset once supplied; the app/admin must not hardcode it.';

create trigger set_updated_at
  before update on erp.store_config
  for each row execute function erp.set_updated_at();

create table erp.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  rules jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on erp.feature_flags
  for each row execute function erp.set_updated_at();
