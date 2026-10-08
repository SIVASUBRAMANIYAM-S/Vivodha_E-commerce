-- pgTAP: anon and guest (anonymous authenticated) access, assuming seed.sql
-- has been applied (supabase test db resets + seeds before running tests).
begin;
select plan(9);

set local role anon;

select is((select count(*) from erp.carts)::int, 0, 'anon reads 0 rows from carts');
select is((select count(*) from erp.orders)::int, 0, 'anon reads 0 rows from orders');
select is((select count(*) from erp.variants)::int, 0, 'anon reads 0 rows from the variants base table');
select ok((select count(*) from erp.products) > 0, 'anon reads active products');
select ok((select count(*) from erp.variants_public) > 0, 'anon reads variants_public');
select is(
  (select count(*) from erp.variants_public where member_price_paise is not null)::int,
  0,
  'anon never sees member_price_paise'
);
select is((select count(*) from erp.coupons)::int, 0, 'anon cannot browse the coupons table');
select is(
  (select code::text from erp.lookup_coupon('WELCOME10')),
  'WELCOME10',
  'anon can look up a coupon by its exact code'
);

reset role;

-- Guest: anonymous Supabase Auth session (authenticated role, is_anonymous = true).
insert into auth.users (id) values ('33333333-3333-3333-3333-333333333333');

set local role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","is_anonymous":true}',
  true
);

select throws_ok(
  $$ insert into erp.wishlists (user_id, product_id)
     values ('33333333-3333-3333-3333-333333333333', (select id from erp.products limit 1)) $$,
  null, null,
  'a guest (anonymous) session cannot insert into wishlists (registered only)'
);

select * from finish();
rollback;
