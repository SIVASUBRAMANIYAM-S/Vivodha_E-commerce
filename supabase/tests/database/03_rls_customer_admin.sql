-- pgTAP: registered customers and admins, assuming seed.sql has been applied.
begin;
select plan(8);

insert into auth.users (id, email) values
  ('44444444-4444-4444-4444-444444444444', 'pgtap-customer-a@example.com'),
  ('55555555-5555-5555-5555-555555555555', 'pgtap-customer-b@example.com'),
  ('66666666-6666-6666-6666-666666666666', 'pgtap-catalog@example.com');

insert into erp.admin_users (user_id, role) values ('66666666-6666-6666-6666-666666666666', 'catalog');

-- Customer A places an order directly (RLS: own insert allowed).
set local role authenticated;
select set_config('request.jwt.claim.sub', '44444444-4444-4444-4444-444444444444', true);
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-4444-444444444444"}', true);

with new_order as (
  insert into erp.orders (
    user_id, seller_id, contact_name, contact_phone, contact_email, shipping_address,
    pincode, delivery_mode, payment_method, subtotal_mrp_paise, subtotal_paise, total_paise
  )
  select
    '44444444-4444-4444-4444-444444444444',
    (select id from erp.sellers where slug = 'vivodha'),
    'Pgtap Customer', '9876543210', 'pgtap-customer-a@example.com', '{}'::jsonb,
    '600001', 'own_delivery', 'cod', 10000, 9000, 9000
  returning id
)
insert into erp.payments (order_id, provider, method, amount_paise, status)
select id, 'cod', 'cod', 9000, 'created' from new_order;

select is((select count(*) from erp.orders)::int, 1, 'customer A sees exactly their own order');
select is(
  (select count(*) from erp.payments_customer)::int, 1,
  'customer A reads their own payment via payments_customer'
);
select is((select count(*) from erp.payments)::int, 0, 'customer A reads 0 rows on the admin-only payments table');

select results_eq(
  $$ update erp.orders set status = 'placed'
     where user_id = '44444444-4444-4444-4444-444444444444'
     returning 1 $$,
  $$ select 1 where false $$,
  'customer A cannot change their own order status (no matching UPDATE policy)'
);

reset role;

-- Customer B must never see customer A's order.
set local role authenticated;
select set_config('request.jwt.claim.sub', '55555555-5555-5555-5555-555555555555', true);
select set_config('request.jwt.claims', '{"sub":"55555555-5555-5555-5555-555555555555"}', true);
select is((select count(*) from erp.orders)::int, 0, 'customer B cannot see customer A''s order');
reset role;

-- points_ledger: append-only even for a user inserting their own row.
insert into erp.points_ledger (user_id, delta, reason)
values ('44444444-4444-4444-4444-444444444444', 50, 'earn_order');

select throws_ok(
  $$ update erp.points_ledger set delta = 999 where user_id = '44444444-4444-4444-4444-444444444444' $$,
  null, null,
  'points_ledger UPDATE is rejected by the append-only trigger'
);

-- catalog admin can manage products, but cannot grant admin roles.
set local role authenticated;
select set_config('request.jwt.claim.sub', '66666666-6666-6666-6666-666666666666', true);
select set_config('request.jwt.claims', '{"sub":"66666666-6666-6666-6666-666666666666"}', true);

select lives_ok(
  $$ insert into erp.products (seller_id, category_id, attribute_set_id, slug, name, status)
     select (select id from erp.sellers where slug = 'vivodha'),
            (select id from erp.categories where slug = 'food-grocery'),
            (select id from erp.attribute_sets where code = 'weight'),
            'pgtap-test-product', 'Pgtap Test Product', 'active' $$,
  'a catalog admin can insert a product'
);

select throws_ok(
  $$ insert into erp.admin_users (user_id, role)
     values ('55555555-5555-5555-5555-555555555555', 'manager') $$,
  null, null,
  'a catalog admin cannot grant admin roles (super_admin only)'
);

select * from finish();
rollback;
