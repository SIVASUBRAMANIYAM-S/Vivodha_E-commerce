-- Phase 1: identity — profiles, usernames, admin grants, and the auth.users trigger
-- that creates a profile (and resolves pending admin invites) for every new user,
-- including anonymous/guest sessions.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user (anonymous users included)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  default_pincode text,
  marketing_opt_in boolean not null default false,
  consent_at timestamptz,
  last_active_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_phone_format check (phone is null or phone ~ '^[6-9][0-9]{9}$'),
  constraint profiles_pincode_format check (default_pincode is null or default_pincode ~ '^[1-9][0-9]{5}$')
);

comment on table public.profiles is
  'One row per auth user (including anonymous/guest sessions). Email lives only in auth.users.';

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- usernames: unique, lowercase. Never readable by anon/authenticated directly —
-- resolved to an email only by the username-login Edge Function (Phase 4, service role).
-- ---------------------------------------------------------------------------
create table public.usernames (
  username extensions.citext primary key,
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- citext operators are case-insensitive, so the regex is applied to a `text` cast
  -- to actually reject uppercase characters instead of folding them away.
  constraint usernames_lowercase_format check (username::text ~ '^[a-z0-9_]{3,20}$')
);

comment on table public.usernames is
  'Unique lowercase usernames. No public SELECT policy: resolved to an email only by '
  'the username-login Edge Function (Phase 4) using the service role.';

-- ---------------------------------------------------------------------------
-- admin_invites: pending admin grants keyed by email (ADR-131).
-- admin_users needs a user_id, which does not exist until the person signs up, so
-- an invite bridges "grant this email the role X" to "grant this user_id role X".
-- ---------------------------------------------------------------------------
create table public.admin_invites (
  email extensions.citext primary key,
  role public.admin_role not null,
  invited_by uuid references public.profiles (id) on delete set null,
  consumed_at timestamptz,
  consumed_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.admin_invites is
  'Pending admin grants keyed by email. Consumed automatically by the auth.users '
  'trigger on first matching signup (handle_new_user()). See ADR-131.';

-- ---------------------------------------------------------------------------
-- admin_users: active role grants. super_admin is implicitly allowed everywhere
-- (see has_admin_role() in migration 01).
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role public.admin_role not null,
  -- Marketplace-ready (ADR-004): scopes a future seller-admin to their seller.
  -- FK to public.sellers is added in migration 03 (sellers does not exist yet).
  seller_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

comment on table public.admin_users is
  'Admin role grants. seller_id is null for the platform admin team today; '
  'reserved for scoping a marketplace seller-admin later.';

-- ---------------------------------------------------------------------------
-- Admin helper functions. Defined here (not migration 01) because a LANGUAGE
-- SQL function's body is parsed and bound to the catalog at CREATE FUNCTION
-- time, so admin_users must already exist. security definer + fixed search_path
-- so these can check admin_users (no public read policy) without granting
-- anon/authenticated direct SELECT on that table.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid() and au.is_active
  );
$$;

comment on function public.is_admin() is 'True if the current user is any active admin (any role).';

create or replace function public.has_admin_role(roles public.admin_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
      and au.is_active
      -- super_admin is implicitly allowed everywhere an admin role is required.
      and (au.role = 'super_admin' or au.role = any(roles))
  );
$$;

comment on function public.has_admin_role(public.admin_role[]) is
  'True if the current user is an active admin whose role is in the given list (super_admin always passes).';

-- Supabase grants EXECUTE on every new function directly to anon/authenticated
-- by default (ALTER DEFAULT PRIVILEGES at the project level) — a plain
-- "revoke ... from public" does NOT undo that. Both functions safely return
-- false for anon anyway (auth.uid() is null), but revoke from anon explicitly
-- too, so the grants match the stated "authenticated only" intent.
revoke all on function public.is_admin() from public, anon;
revoke all on function public.has_admin_role(public.admin_role[]) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_admin_role(public.admin_role[]) to authenticated;

-- ---------------------------------------------------------------------------
-- auth.users trigger: create the profile, and resolve any matching admin_invites.
-- This is the official Supabase pattern for reacting to auth.users changes.
-- Re-used for both INSERT (signup) and UPDATE of email (anonymous -> permanent
-- conversion, where email goes from null to a real address).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invited_role public.admin_role;
begin
  insert into public.profiles (id, created_at, updated_at, last_active_at)
  values (new.id, now(), now(), now())
  on conflict (id) do nothing;

  if new.email is not null then
    select ai.role into invited_role
    from public.admin_invites ai
    where ai.email = new.email and ai.consumed_at is null
    limit 1;

    if invited_role is not null then
      insert into public.admin_users (user_id, role, is_active)
      values (new.id, invited_role, true)
      on conflict (user_id) do nothing;

      update public.admin_invites
      set consumed_at = now(), consumed_user_id = new.id
      where email = new.email and consumed_at is null;
    end if;
  end if;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'auth.users INSERT/UPDATE(email) trigger: creates the matching profile and '
  'resolves any pending admin_invites for that email into an admin_users row.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger on_auth_user_email_confirmed
  after update of email on auth.users
  for each row
  when (new.email is distinct from old.email)
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Keep profiles.last_active_at fresh on every sign-in (drives Vivo Points expiry,
-- Phase 9 / docs/user-flows.md §8).
-- ---------------------------------------------------------------------------
create or replace function public.touch_last_active()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set last_active_at = now() where id = new.id;
  return new;
end;
$$;

comment on function public.touch_last_active() is
  'auth.users UPDATE(last_sign_in_at) trigger: refreshes profiles.last_active_at.';

create trigger on_auth_user_sign_in
  after update of last_sign_in_at on auth.users
  for each row
  when (new.last_sign_in_at is distinct from old.last_sign_in_at)
  execute function public.touch_last_active();
