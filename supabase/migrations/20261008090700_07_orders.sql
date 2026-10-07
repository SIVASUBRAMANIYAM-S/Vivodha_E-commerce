-- Phase 1: orders — orders, order_items (price snapshots), order_status_history,
-- payments, returns, refunds, shipments, plus the order/invoice number generators
-- and the status-transition machinery (ADR-124, ADR-125, ADR-126, ADR-127).

-- ---------------------------------------------------------------------------
-- Order number: 'VVD' + YYMM + 6-digit sequence, reset every calendar month.
-- A dedicated counter table (not a bare SEQUENCE) so the sequence can reset per
-- period atomically under concurrent inserts.
-- ---------------------------------------------------------------------------
create table public.order_number_counters (
  period text primary key, -- 'YYMM'
  last_value int not null default 0
);

create or replace function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period text := to_char(now(), 'YYMM');
  v_next int;
begin
  insert into public.order_number_counters (period, last_value)
  values (v_period, 1)
  on conflict (period) do update
    set last_value = public.order_number_counters.last_value + 1
  returning last_value into v_next;

  return 'VVD' || v_period || lpad(v_next::text, 6, '0');
end;
$$;

comment on function public.next_order_number() is
  'ADR-124: VVD + YYMM + 6-digit zero-padded sequence, e.g. VVD2610000123. Resets monthly.';

-- ---------------------------------------------------------------------------
-- Invoice number: 'VVD/' + Indian financial year (Apr-Mar) + '/' + 6-digit
-- sequence, max 16 chars, consecutive per FY. Issued at ship time, not placement.
-- ---------------------------------------------------------------------------
create or replace function public.financial_year_label(p_date date default current_date)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when extract(month from p_date) >= 4 then
      lpad((extract(year from p_date)::int % 100)::text, 2, '0')
      || lpad(((extract(year from p_date)::int + 1) % 100)::text, 2, '0')
    else
      lpad(((extract(year from p_date)::int - 1) % 100)::text, 2, '0')
      || lpad((extract(year from p_date)::int % 100)::text, 2, '0')
  end;
$$;

comment on function public.financial_year_label(date) is
  'Indian financial year label for a date, e.g. 2026-10-07 -> ''2627'' (Apr 2026-Mar 2027).';

create table public.invoice_number_counters (
  fy text primary key,
  last_value int not null default 0
);

create or replace function public.next_invoice_number()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fy text := public.financial_year_label(current_date);
  v_next int;
  v_number text;
begin
  insert into public.invoice_number_counters (fy, last_value)
  values (v_fy, 1)
  on conflict (fy) do update
    set last_value = public.invoice_number_counters.last_value + 1
  returning last_value into v_next;

  v_number := 'VVD/' || v_fy || '/' || lpad(v_next::text, 6, '0');

  if length(v_number) > 16 then
    raise exception 'Invoice number % exceeds the 16-character limit', v_number;
  end if;

  return v_number;
end;
$$;

comment on function public.next_invoice_number() is
  'ADR-125: VVD/<FY>/<6-digit sequence>, e.g. VVD/2627/000123. Resets each Indian FY, max 16 chars.';

-- ---------------------------------------------------------------------------
-- Per-category return window (ADR-126/127): walks the category's ancestor
-- chain (self first) for the first non-null override, then falls back to
-- store_config, then a hardcoded safety net.
-- ---------------------------------------------------------------------------
create or replace function public.category_return_window(p_category_id uuid)
returns interval
language plpgsql
stable
set search_path = ''
as $$
declare
  v_path uuid[];
  v_ancestor_id uuid;
  v_i int;
  v_is_returnable boolean;
  v_return_days int;
  v_issue_report_hours int;
  r_is_returnable boolean;
  r_return_days int;
  r_issue_report_hours int;
begin
  select path into v_path from public.categories where id = p_category_id;
  if v_path is null then
    raise exception 'Category % not found', p_category_id;
  end if;

  -- path is root-first. Postgres has no reverse() for arrays (only strings/
  -- bytea), so walk self -> root with a descending index instead, keeping the
  -- first non-null override seen for each field.
  for v_i in reverse array_length(v_path, 1) .. 1 loop
    v_ancestor_id := v_path[v_i];

    select c.is_returnable, c.return_days, c.issue_report_hours
      into r_is_returnable, r_return_days, r_issue_report_hours
    from public.categories c
    where c.id = v_ancestor_id;

    v_is_returnable := coalesce(v_is_returnable, r_is_returnable);
    v_return_days := coalesce(v_return_days, r_return_days);
    v_issue_report_hours := coalesce(v_issue_report_hours, r_issue_report_hours);
  end loop;

  if coalesce(v_is_returnable, true) = false then
    return make_interval(hours => coalesce(
      v_issue_report_hours,
      (select (business -> 'returns' ->> 'defaultIssueReportHours')::int from public.store_config),
      48
    ));
  end if;

  return make_interval(days => coalesce(
    v_return_days,
    (select (business -> 'returns' ->> 'defaultReturnDays')::int from public.store_config),
    7
  ));
end;
$$;

comment on function public.category_return_window(uuid) is
  'Resolved return/issue-report window for a category: category override -> '
  'ancestor override -> store_config default -> hardcoded fallback (7d / 48h).';

-- Supabase grants EXECUTE on every new function directly to anon/authenticated
-- by default (ALTER DEFAULT PRIVILEGES at the project level) — a plain
-- "revoke ... from public" does NOT undo that. next_order_number() legitimately
-- needs authenticated (it runs as the orders.order_number column default when a
-- customer inserts their own order); next_invoice_number() must stay service_role-only.
revoke all on function public.next_order_number() from public, anon;
revoke all on function public.next_invoice_number() from public, anon, authenticated;
grant execute on function public.next_order_number() to authenticated, service_role;
grant execute on function public.next_invoice_number() to service_role;
grant execute on function public.category_return_window(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.next_order_number(),
  user_id uuid not null references public.profiles (id),
  seller_id uuid not null references public.sellers (id),
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  shipping_address jsonb not null,
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  delivery_mode public.delivery_mode not null,
  delivery_type text not null default 'standard',
  delivery_slot tstzrange,
  status public.order_status not null default 'pending_payment',
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'created',
  subtotal_mrp_paise bigint not null check (subtotal_mrp_paise >= 0),
  subtotal_paise bigint not null check (subtotal_paise >= 0),
  coupon_discount_paise bigint not null default 0 check (coupon_discount_paise >= 0),
  points_redeemed int not null default 0 check (points_redeemed >= 0),
  points_discount_paise bigint not null default 0 check (points_discount_paise >= 0),
  delivery_fee_paise bigint not null default 0 check (delivery_fee_paise >= 0),
  total_paise bigint not null check (total_paise >= 0),
  tax_paise bigint not null default 0 check (tax_paise >= 0),
  points_to_earn int not null default 0 check (points_to_earn >= 0),
  -- ADR-127: longest return window among this order's items; points-credit job
  -- (Phase 9) credits points_to_earn once now() passes this timestamp.
  points_credit_at timestamptz,
  points_credited boolean not null default false,
  return_window_ends_at timestamptz,
  invoice_number text unique,
  invoice_path text,
  cancel_reason text,
  placed_at timestamptz,
  packed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is
  'Orders. invoice_number is null until the order ships (ADR-125). '
  'Status changes only via the validated trigger below — never a bare UPDATE from clients.';

create index orders_user_id_idx on public.orders (user_id);
create index orders_seller_id_idx on public.orders (seller_id);
create index orders_status_idx on public.orders (status);
create index orders_points_credit_pending_idx
  on public.orders (points_credit_at) where points_credited = false and status = 'delivered';

create trigger set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- order_items: a full price/tax/identity snapshot. Orders never re-read live
-- catalog prices for history.
-- ---------------------------------------------------------------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  variant_id uuid not null references public.variants (id),
  seller_id uuid not null references public.sellers (id),
  name text not null,
  variant_label text not null,
  image_path text,
  sku text not null,
  hsn_code text,
  gst_rate numeric(5, 2) not null default 0,
  quantity int not null check (quantity > 0),
  mrp_paise bigint not null check (mrp_paise >= 0),
  unit_price_paise bigint not null check (unit_price_paise >= 0),
  line_total_paise bigint not null check (line_total_paise >= 0),
  tax_paise bigint not null default 0 check (tax_paise >= 0),
  points_multiplier numeric(3, 1) not null default 1,
  returned_quantity int not null default 0 check (returned_quantity >= 0),
  created_at timestamptz not null default now(),
  constraint order_items_returned_le_quantity check (returned_quantity <= quantity)
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- order_status_history: append-only audit trail.
-- ---------------------------------------------------------------------------
create table public.order_status_history (
  id bigint generated by default as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  note text,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.order_status_history is
  'Append-only. changed_by is null for system-driven changes (e.g. the webhook, a cron job).';

create index order_status_history_order_id_idx on public.order_status_history (order_id);

create or replace function public.orders_log_status(p_order_id uuid, p_status public.order_status)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.order_status_history (order_id, status, changed_by)
  values (p_order_id, p_status, auth.uid());
$$;

create or replace function public.orders_log_initial_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.orders_log_status(new.id, new.status);
  return new;
end;
$$;

create trigger orders_log_initial_status
  after insert on public.orders
  for each row execute function public.orders_log_initial_status();

create or replace function public.orders_log_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    perform public.orders_log_status(new.id, new.status);
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Status-transition guard. Fires before the logging trigger so an invalid
-- transition raises and nothing is ever logged for it.
--
-- NOTE: this is a Phase 1 starting graph (see docs/user-flows.md). Phase 7
-- (returns/refunds) may extend it as the return/refund flows are built out.
-- ---------------------------------------------------------------------------
create or replace function public.orders_validate_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  allowed boolean;
begin
  if new.status = old.status then
    return new;
  end if;

  allowed := case old.status
    when 'pending_payment' then new.status in ('placed', 'cancelled')
    when 'placed' then new.status in ('packed', 'cancelled')
    when 'packed' then new.status in ('shipped', 'cancelled')
    when 'shipped' then new.status in ('out_for_delivery', 'delivered', 'cancelled')
    when 'out_for_delivery' then new.status in ('delivered', 'cancelled')
    when 'delivered' then new.status in ('return_requested')
    when 'return_requested' then new.status in ('returned', 'delivered')
    when 'returned' then new.status in ('refunded')
    else false
  end;

  if not allowed then
    raise exception 'Invalid order status transition: % -> %', old.status, new.status;
  end if;

  if new.status = 'placed' and new.placed_at is null then
    new.placed_at = now();
  end if;

  if new.status = 'packed' and new.packed_at is null then
    new.packed_at = now();
  end if;

  if new.status = 'shipped' then
    if new.shipped_at is null then
      new.shipped_at = now();
    end if;
    if new.invoice_number is null then
      new.invoice_number = public.next_invoice_number();
    end if;
  end if;

  if new.status = 'delivered' and old.status is distinct from 'delivered' then
    if new.delivered_at is null then
      new.delivered_at = now();
    end if;
    -- ADR-127: credit date = now + the longest return/issue-report window among
    -- this order's items.
    select now() + max(public.category_return_window(p.category_id))
      into new.return_window_ends_at
    from public.order_items oi
    join public.products p on p.id = oi.product_id
    where oi.order_id = new.id;
    new.points_credit_at = new.return_window_ends_at;
  end if;

  if new.status = 'cancelled' and new.cancelled_at is null then
    new.cancelled_at = now();
  end if;

  return new;
end;
$$;

comment on function public.orders_validate_status_transition() is
  'Rejects any order status change that is not in the allowed transition graph, '
  'and stamps the matching lifecycle timestamp (placed_at, shipped_at, ...).';

create trigger orders_validate_status_transition
  before update of status on public.orders
  for each row execute function public.orders_validate_status_transition();

create trigger orders_log_status_change
  after update of status on public.orders
  for each row execute function public.orders_log_status_change();

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  provider text not null check (provider in ('razorpay', 'cod')),
  method public.payment_method not null,
  amount_paise bigint not null check (amount_paise >= 0),
  currency text not null default 'INR',
  status public.payment_status not null default 'created',
  provider_order_id text unique,
  provider_payment_id text unique,
  error_code text,
  error_description text,
  raw_event jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_order_id_idx on public.payments (order_id);

create trigger set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- returns (created before refunds: refunds.return_id references this table)
-- ---------------------------------------------------------------------------
create table public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  user_id uuid not null references public.profiles (id),
  status public.return_status not null default 'requested',
  reason text not null,
  items jsonb not null,
  photo_paths text[] not null default '{}',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint returns_items_is_array check (jsonb_typeof(items) = 'array')
);

comment on column public.returns.items is 'Array of {order_item_id, quantity}.';

create index returns_order_id_idx on public.returns (order_id);

create trigger set_updated_at
  before update on public.returns
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- refunds
-- ---------------------------------------------------------------------------
create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  payment_id uuid references public.payments (id),
  return_id uuid references public.returns (id),
  amount_paise bigint not null check (amount_paise >= 0),
  method text not null check (method in ('original', 'upi', 'bank', 'points')),
  status public.refund_status not null default 'pending',
  provider_refund_id text,
  reason text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index refunds_order_id_idx on public.refunds (order_id);

-- ---------------------------------------------------------------------------
-- shipments
-- ---------------------------------------------------------------------------
create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  seller_id uuid not null references public.sellers (id),
  mode public.delivery_mode not null,
  carrier text,
  awb text,
  tracking_url text,
  status text not null default 'pending',
  rider_name text,
  rider_phone text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shipments_order_id_idx on public.shipments (order_id);

create trigger set_updated_at
  before update on public.shipments
  for each row execute function public.set_updated_at();
