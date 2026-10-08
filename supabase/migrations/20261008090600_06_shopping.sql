-- Phase 1: shopping — carts, wishlists, recently viewed.

create table erp.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references erp.profiles (id) on delete cascade,
  pincode text check (pincode is null or pincode ~ '^[1-9][0-9]{5}$'),
  coupon_code text,
  use_points boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table erp.carts is 'One active cart per user, anonymous (guest) users included.';

create trigger set_updated_at
  before update on erp.carts
  for each row execute function erp.set_updated_at();

create table erp.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references erp.carts (id) on delete cascade,
  variant_id uuid not null references erp.variants (id),
  quantity int not null check (quantity > 0),
  added_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create index cart_items_cart_id_idx on erp.cart_items (cart_id);

create table erp.wishlists (
  user_id uuid not null references erp.profiles (id) on delete cascade,
  product_id uuid not null references erp.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table erp.recently_viewed (
  user_id uuid not null references erp.profiles (id) on delete cascade,
  product_id uuid not null references erp.products (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- Keep only the 50 most recent views per user.
create or replace function erp.trim_recently_viewed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from erp.recently_viewed
  where user_id = new.user_id
    and product_id not in (
      select product_id from erp.recently_viewed
      where user_id = new.user_id
      order by viewed_at desc
      limit 50
    );
  return new;
end;
$$;

create trigger trim_recently_viewed
  after insert or update on erp.recently_viewed
  for each row execute function erp.trim_recently_viewed();
