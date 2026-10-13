-- Phase 3: identity finalization, restricted serviceability, and address defaults.
create table public.request_rate_limits (
  scope text not null,
  subject text not null,
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0),
  primary key (scope, subject)
);
alter table public.request_rate_limits enable row level security;
revoke all on public.request_rate_limits from public, anon, authenticated;
grant all on public.request_rate_limits to service_role;

create function public.consume_request_limit(
  p_scope text, p_subject text, p_limit integer, p_window_seconds integer
) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  used integer;
begin
  if p_scope is null or length(p_scope) not between 1 and 100
    or p_subject is null or length(p_subject) not between 1 and 256
    or p_limit is null or p_limit not between 1 and 1000000
    or p_window_seconds is null or p_window_seconds not between 1 and 86400 then
    raise exception 'Invalid rate limit configuration' using errcode = '22023';
  end if;
  insert into public.request_rate_limits as limits (scope, subject, window_start, attempts)
  values (p_scope, p_subject, clock_timestamp(), 1)
  on conflict (scope, subject) do update
  set attempts = case
        when limits.window_start <= clock_timestamp() - make_interval(secs => p_window_seconds)
        then 1 else least(limits.attempts + 1, p_limit + 1) end,
      window_start = case
        when limits.window_start <= clock_timestamp() - make_interval(secs => p_window_seconds)
        then clock_timestamp() else limits.window_start end
  returning attempts into used;
  return used <= p_limit;
end;
$$;
revoke all on function public.consume_request_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_request_limit(text, text, integer, integer)
  to service_role;

-- Reserve usernames during email confirmation, without publishing profile data.
create table public.username_reservations (
  username extensions.citext primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  check (username::text ~ '^[a-z0-9_]{3,20}$')
);
alter table public.username_reservations enable row level security;
revoke all on public.username_reservations from public, anon, authenticated;
grant all on public.username_reservations to service_role;

create function public.sync_signup_identity()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  requested text := new.raw_user_meta_data ->> 'username';
  requested_name text := btrim(new.raw_user_meta_data ->> 'full_name');
  requested_phone text := new.raw_user_meta_data ->> 'phone';
  existing_username text;
begin
  if requested is null then return new; end if;
  if requested !~ '^[a-z0-9_]{3,20}$'
    or requested_name is null or length(requested_name) not between 2 and 100
    or requested_phone is null or requested_phone !~ '^[6-9][0-9]{9}$' then
    raise exception 'Invalid signup profile' using errcode = '22023';
  end if;

  -- Serialize reservations and claims, including a concurrent confirmation.
  perform pg_advisory_xact_lock(hashtextextended('vivodha-username:' || requested, 0));
  select username::text into existing_username
  from public.usernames where user_id = new.id;
  if existing_username is not null then
    if existing_username <> requested then
      raise exception 'Username cannot be changed' using errcode = '23514';
    end if;
    return new;
  end if;
  if exists (
    select 1 from public.usernames
    where username::text = requested and user_id <> new.id
  ) then
    raise exception 'Username unavailable' using errcode = '23505';
  end if;
  delete from public.username_reservations
  where (username::text = requested and expires_at <= now()) or user_id = new.id;
  insert into public.username_reservations (username, user_id)
  values (requested, new.id);

  if new.email_confirmed_at is not null and not coalesce(new.is_anonymous, false) then
    insert into public.usernames (username, user_id) values (requested, new.id);
    update public.profiles
    set full_name = requested_name, phone = requested_phone
    where id = new.id;
    delete from public.username_reservations where user_id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_signup_identity() from public, anon, authenticated;
create trigger on_signup_identity
  after insert or update of raw_user_meta_data, email_confirmed_at, is_anonymous on auth.users
  for each row execute function public.sync_signup_identity();
-- Identity claims must go through the auth confirmation trigger, not client inserts.
drop policy if exists usernames_insert_own on public.usernames;
revoke insert, update, delete on public.usernames from anon, authenticated;

create function public.username_available(p_username text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  subject text;
begin
  if p_username is null or p_username !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'Invalid username' using errcode = '22023';
  end if;
  subject := coalesce(auth.uid()::text,
    md5(coalesce(headers ->> 'x-forwarded-for', 'public')));
  if not public.consume_request_limit('username-availability', subject, 30, 60) then
    raise exception 'Too many availability checks' using errcode = 'P0001';
  end if;
  return not exists (select 1 from public.usernames where username::text = p_username)
    and not exists (
      select 1 from public.username_reservations
      where username::text = p_username
        and expires_at > now() and user_id is distinct from auth.uid()
    );
end;
$$;
revoke all on function public.username_available(text) from public, anon, authenticated;
grant execute on function public.username_available(text) to anon, authenticated;

alter table public.serviceable_pincodes
  add column min_order_paise bigint not null default 0 check (min_order_paise >= 0);
-- Preserve the admin policy, but remove unrestricted customer/public coverage reads.
drop policy serviceable_pincodes_select_active on public.serviceable_pincodes;

create function public.check_pincode(p_pincode text)
returns table (
  serviceable boolean, mode public.delivery_mode, eta_text text,
  cod_available boolean, min_order_paise bigint
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if p_pincode is null or p_pincode !~ '^[1-9][0-9]{5}$' then
    raise exception 'Invalid pincode' using errcode = '22023';
  end if;
  return query
    select true, p.delivery_mode, p.eta_text, p.cod_allowed, p.min_order_paise
    from public.serviceable_pincodes p where p.pincode = p_pincode and p.is_active;
  if not found then
    return query select false, null::public.delivery_mode, null::text, false, 0::bigint;
  end if;
end;
$$;
revoke all on function public.check_pincode(text) from public, anon, authenticated;
grant execute on function public.check_pincode(text) to anon, authenticated;

create table public.pincode_waitlist (
  id uuid primary key default gen_random_uuid(),
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  email text check (email is null or (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  phone text check (phone is null or phone ~ '^[6-9][0-9]{9}$'),
  user_id uuid references public.profiles(id) on delete set null default auth.uid(),
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  check (num_nonnulls(email, phone) = 1)
);
create unique index pincode_waitlist_contact
  on public.pincode_waitlist (pincode, coalesce(lower(email), phone));
alter table public.pincode_waitlist enable row level security;
revoke all on public.pincode_waitlist from public, anon, authenticated;
grant insert (pincode, email, phone) on public.pincode_waitlist to anon, authenticated;
grant select on public.pincode_waitlist to authenticated;
grant all on public.pincode_waitlist to service_role;
create policy pincode_waitlist_insert on public.pincode_waitlist
  for insert to anon, authenticated with check (user_id is not distinct from auth.uid());
create policy pincode_waitlist_admin_read on public.pincode_waitlist
  for select to authenticated using (public.is_admin());

-- Keep historical requests intact; new submissions use pincode_waitlist.
revoke insert on public.serviceability_requests from anon, authenticated;

create function public.set_default_address(p_address_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  perform 1 from public.profiles where id = auth.uid() for update;
  if not exists (
    select 1 from public.addresses where id = p_address_id and user_id = auth.uid()
  ) then
    raise exception 'Address not found' using errcode = '42501';
  end if;
  update public.addresses set is_default = false where user_id = auth.uid() and is_default;
  update public.addresses set is_default = true where id = p_address_id and user_id = auth.uid();
  update public.profiles
  set default_pincode = (select pincode from public.addresses where id = p_address_id)
  where id = auth.uid();
end;
$$;
revoke all on function public.set_default_address(uuid) from public, anon, authenticated;
grant execute on function public.set_default_address(uuid) to authenticated;
