-- Phase 1: engagement — AI shopping lists, reviews, notifications, device tokens.

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source public.shopping_list_source not null,
  raw_text text,
  image_path text,
  status text not null default 'pending'
    check (status in ('pending', 'parsing', 'parsed', 'failed', 'added_to_cart')),
  model text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shopping_lists_user_id_idx on public.shopping_lists (user_id);

create trigger set_updated_at
  before update on public.shopping_lists
  for each row execute function public.set_updated_at();

create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists (id) on delete cascade,
  position int not null default 0,
  raw_line text not null,
  parsed_name text,
  quantity numeric,
  unit text,
  matched_variant_id uuid references public.variants (id),
  confidence numeric(4, 3) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  status text not null default 'unmatched'
    check (status in ('matched', 'unmatched', 'confirmed', 'removed'))
);

create index shopping_list_items_list_id_idx on public.shopping_list_items (list_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id),
  user_id uuid not null references public.profiles (id),
  order_item_id uuid unique references public.order_items (id),
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_product_id_idx on public.reviews (product_id) where status = 'published';

create trigger set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  channel text not null check (channel in ('push', 'email', 'in_app')),
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);

create table public.device_tokens (
  token text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android', 'web')),
  app_version text,
  updated_at timestamptz not null default now()
);

create index device_tokens_user_id_idx on public.device_tokens (user_id);

create trigger set_updated_at
  before update on public.device_tokens
  for each row execute function public.set_updated_at();
