-- pgTAP: profiles/usernames/admin_invites/admin_users (migration 02).
begin;
select plan(6);

-- Signup creates a profile automatically.
insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'pgtap-a@example.com');
select isnt(
  (select id from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  null,
  'handle_new_user() creates a profile on auth.users insert'
);

-- admin_invites resolves to admin_users on matching signup (ADR-131).
insert into public.admin_invites (email, role) values ('pgtap-invite@example.com', 'manager');
insert into auth.users (id, email) values ('22222222-2222-2222-2222-222222222222', 'pgtap-invite@example.com');

select is(
  (select role::text from public.admin_users where user_id = '22222222-2222-2222-2222-222222222222'),
  'manager',
  'admin_invites resolves to an admin_users grant on matching signup'
);

select isnt(
  (select consumed_at from public.admin_invites where email = 'pgtap-invite@example.com'),
  null,
  'the matching admin_invites row is marked consumed'
);

-- usernames: lowercase enforced even though the column is citext (whose
-- operators are case-insensitive and would otherwise let a regex through).
select throws_ok(
  $$ insert into public.usernames (username, user_id)
     values ('Invalid', '11111111-1111-1111-1111-111111111111') $$,
  23514, -- check_violation
  null,
  'uppercase usernames are rejected despite citext case-insensitive matching'
);

select lives_ok(
  $$ insert into public.usernames (username, user_id)
     values ('valid_name', '11111111-1111-1111-1111-111111111111') $$,
  'a valid lowercase username is accepted'
);

-- is_admin() / has_admin_role()
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222"}', true);

select ok(public.has_admin_role(array['manager']::public.admin_role[]), 'has_admin_role matches the granted role');

select * from finish();
rollback;
