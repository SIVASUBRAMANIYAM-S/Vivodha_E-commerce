-- pgTAP: order/invoice number generators, category return window (ADR-124/125/
-- 126/127), the order status transition guard, and inventory function grants.
begin;
select plan(9);

-- Order number: VVD + YYMM + 6-digit sequence, sequential and well-formed.
select matches(public.next_order_number(), '^VVD[0-9]{4}[0-9]{6}$', 'order number is well-formed');
select isnt(public.next_order_number(), public.next_order_number(), 'order numbers are sequential, not repeated');

-- Invoice number: VVD/<FY>/<6-digit sequence>, max 16 chars.
select matches(public.next_invoice_number(), '^VVD/[0-9]{4}/[0-9]{6}$', 'invoice number is well-formed');
select ok(length(public.next_invoice_number()) <= 16, 'invoice number is at most 16 characters');

-- category_return_window: perishable -> 48h issue-report; the owner's
-- Beverages/Home Care 7-day-sealed decision -> 7 days.
select is(
  public.category_return_window((select id from public.categories where slug = 'fruits-vegetables-fresh-fruits')),
  interval '48 hours',
  'a perishable category resolves to its 48-hour issue-report window'
);
select is(
  public.category_return_window((select id from public.categories where slug = 'beverages-soft-drinks')),
  interval '7 days',
  'beverages resolve to the 7-day sealed-return window (owner decision)'
);

-- Order status transition guard.
insert into auth.users (id, email) values ('77777777-7777-7777-7777-777777777777', 'pgtap-order@example.com');

with new_order as (
  insert into public.orders (
    user_id, seller_id, contact_name, contact_phone, contact_email, shipping_address,
    pincode, delivery_mode, payment_method, subtotal_mrp_paise, subtotal_paise, total_paise
  )
  select
    '77777777-7777-7777-7777-777777777777',
    (select id from public.sellers where slug = 'vivodha'),
    'Pgtap Order', '9876543210', 'pgtap-order@example.com', '{}'::jsonb,
    '600001', 'own_delivery', 'cod', 10000, 9000, 9000
  returning id
)
select id into temp _order_id from new_order;

update public.orders set status = 'placed' where id = (select id from _order_id);
select is(
  (select status::text from public.orders where id = (select id from _order_id)),
  'placed',
  'pending_payment -> placed is a valid transition'
);

select throws_ok(
  format('update public.orders set status = %L where id = %L', 'delivered', (select id from _order_id)),
  null, null,
  'placed -> delivered is rejected (skips packed/shipped/out_for_delivery)'
);

-- Inventory mutation functions are service_role-only.
set local role authenticated;
select throws_ok(
  format(
    'select public.reserve_inventory(%L, %L, 1)',
    (select id from public.variants limit 1),
    (select id from public.sellers where slug = 'vivodha')
  ),
  '42501', -- insufficient_privilege
  null,
  'a plain authenticated user cannot call reserve_inventory (service_role only)'
);
reset role;

select * from finish();
rollback;
