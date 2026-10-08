-- Phase 1: catalog — sellers, attribute sets, brands, categories, products,
-- variants, inventory, and images. Single seller today, marketplace-ready
-- (ADR-004): every product/variant/inventory row carries seller_id.
--
-- Create order matters for foreign keys: attribute_sets and brands before
-- categories (categories.default_attribute_set_id), categories before products.

-- ---------------------------------------------------------------------------
-- sellers
-- ---------------------------------------------------------------------------
create table erp.sellers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  legal_name text,
  gstin text,
  fssai_license_no text,
  pan text,
  registered_address jsonb,
  is_platform boolean not null default false,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table erp.sellers is
  'Sellers. One row (slug = vivodha, is_platform = true) today; ready for a '
  'marketplace of third-party sellers later without a schema change.';

create unique index sellers_one_platform_seller
  on erp.sellers ((true)) where is_platform;

create trigger set_updated_at
  before update on erp.sellers
  for each row execute function erp.set_updated_at();

-- Now that sellers exists, add the admin_users.seller_id FK deferred from migration 02.
alter table erp.admin_users
  add constraint admin_users_seller_id_fkey
  foreign key (seller_id) references erp.sellers (id) on delete set null;

-- ---------------------------------------------------------------------------
-- attribute_sets: generic variant/spec definitions (grocery = weight/pack size,
-- fashion = size/colour, ... — never hardcode weight as the only variant type).
-- ---------------------------------------------------------------------------
create table erp.attribute_sets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  option_types jsonb not null default '[]'::jsonb,
  spec_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attribute_sets_option_types_is_array check (jsonb_typeof(option_types) = 'array'),
  constraint attribute_sets_spec_fields_is_array check (jsonb_typeof(spec_fields) = 'array')
);

comment on table erp.attribute_sets is
  'Generic variant option types (e.g. pack_size, or size+colour) and spec fields '
  'per product family. Drives product_options/variants without hardcoding weight.';

create trigger set_updated_at
  before update on erp.attribute_sets
  for each row execute function erp.set_updated_at();

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------
create table erp.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_path text,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on erp.brands
  for each row execute function erp.set_updated_at();

-- ---------------------------------------------------------------------------
-- categories (tree) — return-policy columns are per-category config (ADR-126),
-- never hardcoded in application code. null means "inherit from the parent,
-- then from store_config"; the resolving function is added in migration 07
-- (erp.category_return_policy), once it has a fallback to read from.
-- ---------------------------------------------------------------------------
create table erp.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references erp.categories (id) on delete restrict,
  slug text not null unique,
  name text not null,
  image_path text,
  sort_order int not null default 0,
  default_attribute_set_id uuid references erp.attribute_sets (id),
  -- Return policy overrides (ADR-126). null = inherit from parent / store_config.
  is_returnable boolean,
  return_days int check (return_days is null or return_days >= 0),
  issue_report_hours int check (issue_report_hours is null or issue_report_hours >= 0),
  sealed_return_only boolean,
  -- Materialised ancestor path (root-first, self-inclusive) for fast subtree queries.
  -- Maintained on insert / re-parent of the row itself; re-parenting a subtree with
  -- existing children does not cascade-update their paths in Phase 1 (categories
  -- are seeded once and not expected to move — revisit if admin re-parenting ships).
  path uuid[] not null default '{}',
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table erp.categories is
  'Category tree. Return-policy columns are explicit per-category config (ADR-126): '
  'perishables are non-returnable with an issue-report window, packaged/personal-care/'
  'beverages/home-care are 7-day sealed-only, home & kitchen / lifestyle are 7-day.';

create index categories_parent_id_idx on erp.categories (parent_id);

create trigger set_updated_at
  before update on erp.categories
  for each row execute function erp.set_updated_at();

create or replace function erp.categories_set_path()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_path uuid[];
begin
  if new.parent_id is null then
    new.path = array[new.id];
  else
    select c.path into parent_path from erp.categories c where c.id = new.parent_id;
    if parent_path is null then
      raise exception 'Parent category % not found', new.parent_id;
    end if;
    new.path = parent_path || new.id;
  end if;
  return new;
end;
$$;

comment on function erp.categories_set_path() is
  'Maintains categories.path (root-first ancestor array) on insert or re-parent.';

create trigger categories_set_path
  before insert or update of parent_id on erp.categories
  for each row execute function erp.categories_set_path();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table erp.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references erp.sellers (id),
  category_id uuid not null references erp.categories (id),
  brand_id uuid references erp.brands (id),
  attribute_set_id uuid not null references erp.attribute_sets (id),
  slug text not null unique,
  name text not null,
  description text,
  specs jsonb not null default '{}'::jsonb,
  hsn_code text,
  gst_rate numeric(5, 2) not null default 0 check (gst_rate >= 0 and gst_rate <= 100),
  is_veg boolean,
  country_of_origin text,
  status erp.product_status not null default 'draft',
  rating_avg numeric(3, 2) not null default 0 check (rating_avg >= 0 and rating_avg <= 5),
  rating_count int not null default 0 check (rating_count >= 0),
  search tsvector generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table erp.products is
  'Catalog products. rating_avg/rating_count are denormalised from reviews (Phase 7). '
  'search is a generated tsvector; its GIN index is created in migration 11.';

create index products_seller_id_idx on erp.products (seller_id);
create index products_category_id_idx on erp.products (category_id);
create index products_brand_id_idx on erp.products (brand_id);
create index products_status_idx on erp.products (status) where deleted_at is null;

create trigger set_updated_at
  before update on erp.products
  for each row execute function erp.set_updated_at();

-- ---------------------------------------------------------------------------
-- product_options: the options a specific product actually uses.
-- ---------------------------------------------------------------------------
create table erp.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references erp.products (id) on delete cascade,
  code text not null,
  label text not null,
  values text[] not null default '{}',
  position int not null default 0,
  unique (product_id, code)
);

create index product_options_product_id_idx on erp.product_options (product_id);

-- ---------------------------------------------------------------------------
-- variants
-- ---------------------------------------------------------------------------
create table erp.variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references erp.products (id) on delete cascade,
  seller_id uuid not null references erp.sellers (id),
  sku text not null unique,
  option_values jsonb not null default '{}'::jsonb,
  label text not null,
  mrp_paise bigint not null check (mrp_paise >= 0),
  price_paise bigint not null check (price_paise >= 0 and price_paise <= mrp_paise),
  member_price_paise bigint
    check (member_price_paise is null or (member_price_paise >= 0 and member_price_paise <= price_paise)),
  barcode text,
  shipping_weight_grams int check (shipping_weight_grams is null or shipping_weight_grams > 0),
  max_per_order int not null default 10 check (max_per_order > 0),
  is_active boolean not null default true,
  position int not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table erp.variants is
  'Purchasable SKUs. member_price_paise is the "Vivo price" shown only to '
  'registered members (hidden from anon/guest via the variants_public view).';

create index variants_product_id_idx on erp.variants (product_id);
create index variants_seller_id_idx on erp.variants (seller_id);

create trigger set_updated_at
  before update on erp.variants
  for each row execute function erp.set_updated_at();

-- ---------------------------------------------------------------------------
-- inventory: stock per variant x seller. Mutated only through the reserve /
-- release / commit functions below — never by a direct UPDATE from clients.
-- ---------------------------------------------------------------------------
create table erp.inventory (
  variant_id uuid not null references erp.variants (id) on delete cascade,
  seller_id uuid not null references erp.sellers (id),
  quantity int not null default 0 check (quantity >= 0),
  reserved int not null default 0 check (reserved >= 0),
  low_stock_threshold int not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now(),
  primary key (variant_id, seller_id),
  constraint inventory_reserved_le_quantity check (reserved <= quantity)
);

comment on table erp.inventory is
  'available = quantity - reserved. Only reserve_inventory/release_inventory/'
  'commit_inventory (security definer, service_role only) may change this table.';

create trigger set_updated_at
  before update on erp.inventory
  for each row execute function erp.set_updated_at();

-- ---------------------------------------------------------------------------
-- product_images
-- ---------------------------------------------------------------------------
create table erp.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references erp.products (id) on delete cascade,
  variant_id uuid references erp.variants (id) on delete cascade,
  storage_path text not null,
  alt text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on erp.product_images (product_id);

-- ---------------------------------------------------------------------------
-- Inventory primitives. security definer + search_path '' + granted only to
-- service_role: clients never mutate stock directly (docs/rls-policies.md).
-- ---------------------------------------------------------------------------
create or replace function erp.reserve_inventory(
  p_variant_id uuid, p_seller_id uuid, p_quantity int
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  did_update boolean;
begin
  if p_quantity <= 0 then
    raise exception 'p_quantity must be positive';
  end if;

  update erp.inventory
  set reserved = reserved + p_quantity
  where variant_id = p_variant_id
    and seller_id = p_seller_id
    and (quantity - reserved) >= p_quantity
  returning true into did_update;

  return coalesce(did_update, false);
end;
$$;

comment on function erp.reserve_inventory(uuid, uuid, int) is
  'Atomically reserves stock for one line item. Returns false if unavailable stock '
  'is insufficient (caller must treat false as OUT_OF_STOCK, not retry/loop).';

create or replace function erp.release_inventory(
  p_variant_id uuid, p_seller_id uuid, p_quantity int
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_quantity <= 0 then
    raise exception 'p_quantity must be positive';
  end if;

  update erp.inventory
  set reserved = greatest(reserved - p_quantity, 0)
  where variant_id = p_variant_id and seller_id = p_seller_id;
end;
$$;

comment on function erp.release_inventory(uuid, uuid, int) is
  'Releases a previous reservation (order cancelled before shipment, or payment never completed).';

create or replace function erp.commit_inventory(
  p_variant_id uuid, p_seller_id uuid, p_quantity int
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_quantity <= 0 then
    raise exception 'p_quantity must be positive';
  end if;

  update erp.inventory
  set quantity = quantity - p_quantity,
      reserved = greatest(reserved - p_quantity, 0)
  where variant_id = p_variant_id and seller_id = p_seller_id;
end;
$$;

comment on function erp.commit_inventory(uuid, uuid, int) is
  'Converts a reservation into a permanent stock decrement once an order ships.';

-- Supabase grants EXECUTE on every new function directly to anon/authenticated
-- by default (ALTER DEFAULT PRIVILEGES at the project level) — a plain
-- "revoke ... from public" does NOT undo that, since those are separate grants
-- to those roles, not to the PUBLIC pseudo-role. Revoke from them explicitly.
revoke all on function erp.reserve_inventory(uuid, uuid, int) from public, anon, authenticated;
revoke all on function erp.release_inventory(uuid, uuid, int) from public, anon, authenticated;
revoke all on function erp.commit_inventory(uuid, uuid, int) from public, anon, authenticated;
grant execute on function erp.reserve_inventory(uuid, uuid, int) to service_role;
grant execute on function erp.release_inventory(uuid, uuid, int) to service_role;
grant execute on function erp.commit_inventory(uuid, uuid, int) to service_role;
