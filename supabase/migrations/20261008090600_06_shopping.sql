-- Phase 1: shopping — carts, wishlists, recently viewed.

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  pincode text check (pincode is null or pincode ~ '^[1-9][0-9]{5}$'),
  coupon_code text,
  use_points boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.carts is 'One active cart per user, anonymous (guest) users included.';

create trigger set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.variants (id),
  quantity int not null check (quantity > 0),
  added_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create index cart_items_cart_id_idx on public.cart_items (cart_id);

create table public.wishlists (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.recently_viewed (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- Keep only the 50 most recent views per user.
create or replace function public.trim_recently_viewed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.recently_viewed
  where user_id = new.user_id
    and product_id not in (
      select product_id from public.recently_viewed
      where user_id = new.user_id
      order by viewed_at desc
      limit 50
    );
  return new;
end;
$$;

create trigger trim_recently_viewed
  after insert or update on public.recently_viewed
  for each row execute function public.trim_recently_viewed();
