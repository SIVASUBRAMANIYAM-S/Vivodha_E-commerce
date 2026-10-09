begin;
set local search_path = public, extensions;
select no_plan();

select ok(
  not has_function_privilege('anon', 'public.consume_request_limit(text,text,integer,integer)', 'execute'),
  'anon cannot call backend rate limiter'
);
select ok(
  not has_function_privilege('authenticated', 'public.consume_request_limit(text,text,integer,integer)', 'execute'),
  'customers cannot call backend rate limiter'
);
select ok(
  not has_function_privilege('authenticated', 'public.sync_signup_identity()', 'execute'),
  'identity trigger is not callable by customers'
);
select ok(
  not has_table_privilege('authenticated', 'public.usernames', 'insert'),
  'clients cannot bypass confirmation to claim usernames'
);
select ok(
  not has_table_privilege('authenticated', 'public.username_reservations', 'select'),
  'pending reservations are private'
);
select ok(
  (select bool_and(relrowsecurity) from pg_class
   where oid in ('public.request_rate_limits'::regclass,
     'public.username_reservations'::regclass, 'public.pincode_waitlist'::regclass)),
  'new tables have RLS'
);

insert into auth.users (id, email, is_anonymous, raw_user_meta_data)
values ('55555555-5555-5555-5555-555555555555', 'phase3-test@example.com', false,
  '{"username":"phase3_test","full_name":"Test Customer","phone":"9876543210"}');
select is(
  (select count(*)::int from public.usernames where username = 'phase3_test'), 0,
  'unconfirmed signup does not publish username'
);
select is(
  (select count(*)::int from public.username_reservations where username = 'phase3_test'), 1,
  'unconfirmed signup reserves username'
);
update auth.users set email_confirmed_at = now()
where id = '55555555-5555-5555-5555-555555555555';
select is(
  (select user_id from public.usernames where username = 'phase3_test'),
  '55555555-5555-5555-5555-555555555555'::uuid,
  'confirmed signup claims username'
);
select is(
  (select full_name from public.profiles where id = '55555555-5555-5555-5555-555555555555'),
  'Test Customer', 'confirmation atomically sets name'
);
select is(
  (select phone from public.profiles where id = '55555555-5555-5555-5555-555555555555'),
  '9876543210', 'confirmation atomically sets delivery phone'
);
select is(
  (select count(*)::int from public.username_reservations where username = 'phase3_test'), 0,
  'confirmed reservation is removed'
);

insert into auth.users (id, is_anonymous)
values ('66666666-6666-6666-6666-666666666666', true);
insert into public.addresses (id, user_id, full_name, phone, line1, city, state, pincode)
values
  ('77777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666',
   'Guest', '9876543210', 'House 1', 'Chennai', 'Tamil Nadu', '600001'),
  ('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666',
   'Guest', '9876543210', 'House 2', 'Chennai', 'Tamil Nadu', '600002');
update auth.users set email = 'phase3-guest@example.com',
  raw_user_meta_data = '{"username":"phase3_guest","full_name":"Converted Guest","phone":"9876543210"}',
  email_confirmed_at = now(), is_anonymous = false
where id = '66666666-6666-6666-6666-666666666666';
select is(
  (select user_id from public.usernames where username = 'phase3_guest'),
  '66666666-6666-6666-6666-666666666666'::uuid,
  'conversion keeps guest identity'
);
select is(
  (select count(*)::int from public.addresses where user_id = '66666666-6666-6666-6666-666666666666'),
  2, 'conversion preserves guest addresses'
);

set local role anon;
select is(public.username_available('phase3_test'), false, 'availability exposes boolean for taken username');
select is(public.username_available('phase3_free'), true, 'availability exposes boolean for free username');
select throws_ok($$select public.username_available('INVALID')$$, '22023', 'Invalid username',
  'availability rejects invalid input');
select is((select count(*)::int from public.serviceable_pincodes), 0,
  'anon cannot enumerate coverage rows');
select is((select serviceable from public.check_pincode('999999')), false,
  'unknown pincode gives explicit unserviceable result');
select throws_ok($$select public.check_pincode('bad')$$, '22023', 'Invalid pincode',
  'serviceability rejects invalid pincode');
select lives_ok(
  $$insert into public.pincode_waitlist(pincode,email) values ('999999','notify-test@example.com')$$,
  'anon can request notification'
);
select throws_ok($$select * from public.pincode_waitlist$$, '42501', null,
  'anon cannot read waitlist contacts');
reset role;

select ok(public.consume_request_limit('test', 'test-subject', 1, 60), 'first request allowed');
select ok(not public.consume_request_limit('test', 'test-subject', 1, 60), 'second request rate limited');
select throws_ok(
  $$select public.consume_request_limit('test', 'test-subject', null, 60)$$,
  '22023', 'Invalid rate limit configuration', 'null limiter settings are rejected'
);
select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data)
    values ('99999999-9999-9999-9999-999999999999', 'duplicate-test@example.com',
      '{"username":"phase3_test","full_name":"Duplicate Test","phone":"9876543210"}')$$,
  '23505', 'Username unavailable', 'a claimed username cannot be reserved again'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '66666666-6666-6666-6666-666666666666', true);
select set_config('request.jwt.claims',
  '{"sub":"66666666-6666-6666-6666-666666666666","is_anonymous":true}', true);
select lives_ok(
  $$select public.set_default_address('77777777-7777-7777-7777-777777777777')$$,
  'guest can set own default address'
);
select lives_ok(
  $$select public.set_default_address('88888888-8888-8888-8888-888888888888')$$,
  'switching default is atomic'
);
select is((select count(*)::int from public.addresses where is_default), 1,
  'exactly one own address is default');
select is((select default_pincode from public.profiles where id = auth.uid()), '600002',
  'default address updates profile pincode');
select throws_ok(
  $$select public.set_default_address('99999999-9999-9999-9999-999999999999')$$,
  '42501', 'Address not found', 'missing or other-user address is rejected');
select is((select count(*)::int from public.pincode_waitlist), 0,
  'customer cannot read waitlist');
select * from finish();
rollback;
