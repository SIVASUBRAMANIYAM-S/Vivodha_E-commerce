-- Seed data for local development and the DEV Supabase project.
-- Idempotent: every insert uses ON CONFLICT on a natural key, so this file is
-- safe to run multiple times (supabase db reset / db push --include-seed).
-- Generic invented product/brand names only — no real brands or competitor assets.

-- ---------------------------------------------------------------------------
-- Categories (return policy per ADR-126; Beverages and Home Care are 7-day
-- sealed-only per the owner's Phase 1 decision)
-- ---------------------------------------------------------------------------
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('food-grocery', 'Food & Grocery', 0, true, 7, null, true, true)
on conflict (slug) do nothing;
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('fruits-vegetables', 'Fruits & Vegetables', 1, false, null, 48, null, true)
on conflict (slug) do nothing;
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('dairy-bakery', 'Dairy & Bakery', 2, false, null, 48, null, true)
on conflict (slug) do nothing;
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('beverages', 'Beverages', 3, true, 7, null, true, true)
on conflict (slug) do nothing;
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('snacks-packaged-food', 'Snacks & Packaged Food', 4, true, 7, null, true, true)
on conflict (slug) do nothing;
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('non-veg', 'Non-Veg', 5, false, null, 48, null, true)
on conflict (slug) do nothing;
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('frozen', 'Frozen', 6, false, null, 48, null, true)
on conflict (slug) do nothing;
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('home-care', 'Home Care', 7, true, 7, null, true, true)
on conflict (slug) do nothing;
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('personal-care-beauty', 'Personal Care & Beauty', 8, true, 7, null, true, true)
on conflict (slug) do nothing;
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('home-kitchen', 'Home & Kitchen', 9, true, 7, null, false, true)
on conflict (slug) do nothing;
insert into public.categories
  (slug, name, sort_order, is_returnable, return_days, issue_report_hours, sealed_return_only, is_active)
values
  ('lifestyle', 'Lifestyle', 10, true, 7, null, false, true)
on conflict (slug) do nothing;

-- Subcategories (inherit the parent's return policy — left null here).
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'food-grocery-atta-rice-and-dal', 'Atta, Rice & Dal', 0, true
from public.categories where slug = 'food-grocery'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'food-grocery-oils-and-ghee', 'Oils & Ghee', 1, true
from public.categories where slug = 'food-grocery'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'food-grocery-masalas-and-spices', 'Masalas & Spices', 2, true
from public.categories where slug = 'food-grocery'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'food-grocery-dry-fruits-and-nuts', 'Dry Fruits & Nuts', 3, true
from public.categories where slug = 'food-grocery'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'fruits-vegetables-fresh-fruits', 'Fresh Fruits', 0, true
from public.categories where slug = 'fruits-vegetables'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'fruits-vegetables-fresh-vegetables', 'Fresh Vegetables', 1, true
from public.categories where slug = 'fruits-vegetables'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'fruits-vegetables-exotic-vegetables', 'Exotic Vegetables', 2, true
from public.categories where slug = 'fruits-vegetables'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'fruits-vegetables-herbs-and-seasonings', 'Herbs & Seasonings', 3, true
from public.categories where slug = 'fruits-vegetables'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'dairy-bakery-milk-and-curd', 'Milk & Curd', 0, true
from public.categories where slug = 'dairy-bakery'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'dairy-bakery-paneer-and-cheese', 'Paneer & Cheese', 1, true
from public.categories where slug = 'dairy-bakery'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'dairy-bakery-bread-and-buns', 'Bread & Buns', 2, true
from public.categories where slug = 'dairy-bakery'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'dairy-bakery-eggs', 'Eggs', 3, true
from public.categories where slug = 'dairy-bakery'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'beverages-soft-drinks', 'Soft Drinks', 0, true
from public.categories where slug = 'beverages'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'beverages-juices', 'Juices', 1, true
from public.categories where slug = 'beverages'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'beverages-tea-and-coffee', 'Tea & Coffee', 2, true
from public.categories where slug = 'beverages'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'beverages-water', 'Water', 3, true
from public.categories where slug = 'beverages'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'snacks-packaged-food-chips-and-namkeen', 'Chips & Namkeen', 0, true
from public.categories where slug = 'snacks-packaged-food'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'snacks-packaged-food-biscuits-and-cookies', 'Biscuits & Cookies', 1, true
from public.categories where slug = 'snacks-packaged-food'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'snacks-packaged-food-ready-to-eat', 'Ready to Eat', 2, true
from public.categories where slug = 'snacks-packaged-food'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'snacks-packaged-food-chocolates', 'Chocolates', 3, true
from public.categories where slug = 'snacks-packaged-food'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'non-veg-chicken', 'Chicken', 0, true
from public.categories where slug = 'non-veg'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'non-veg-mutton', 'Mutton', 1, true
from public.categories where slug = 'non-veg'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'non-veg-fish-and-seafood', 'Fish & Seafood', 2, true
from public.categories where slug = 'non-veg'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'non-veg-frozen-non-veg', 'Frozen Non-Veg', 3, true
from public.categories where slug = 'non-veg'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'frozen-frozen-vegetables', 'Frozen Vegetables', 0, true
from public.categories where slug = 'frozen'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'frozen-frozen-snacks', 'Frozen Snacks', 1, true
from public.categories where slug = 'frozen'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'frozen-ice-cream', 'Ice Cream', 2, true
from public.categories where slug = 'frozen'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'home-care-detergents', 'Detergents', 0, true
from public.categories where slug = 'home-care'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'home-care-cleaners', 'Cleaners', 1, true
from public.categories where slug = 'home-care'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'home-care-air-fresheners', 'Air Fresheners', 2, true
from public.categories where slug = 'home-care'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'home-care-pest-control', 'Pest Control', 3, true
from public.categories where slug = 'home-care'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'personal-care-beauty-bath-and-body', 'Bath & Body', 0, true
from public.categories where slug = 'personal-care-beauty'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'personal-care-beauty-hair-care', 'Hair Care', 1, true
from public.categories where slug = 'personal-care-beauty'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'personal-care-beauty-skin-care', 'Skin Care', 2, true
from public.categories where slug = 'personal-care-beauty'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'personal-care-beauty-oral-care', 'Oral Care', 3, true
from public.categories where slug = 'personal-care-beauty'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'home-kitchen-cookware', 'Cookware', 0, true
from public.categories where slug = 'home-kitchen'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'home-kitchen-storage-and-containers', 'Storage & Containers', 1, true
from public.categories where slug = 'home-kitchen'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'home-kitchen-kitchen-tools', 'Kitchen Tools', 2, true
from public.categories where slug = 'home-kitchen'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'home-kitchen-appliances', 'Appliances', 3, true
from public.categories where slug = 'home-kitchen'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'lifestyle-fashion-accessories', 'Fashion Accessories', 0, true
from public.categories where slug = 'lifestyle'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'lifestyle-footwear', 'Footwear', 1, true
from public.categories where slug = 'lifestyle'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'lifestyle-bags', 'Bags', 2, true
from public.categories where slug = 'lifestyle'
on conflict (slug) do nothing;
insert into public.categories (parent_id, slug, name, sort_order, is_active)
select id, 'lifestyle-stationery', 'Stationery', 3, true
from public.categories where slug = 'lifestyle'
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Attribute sets (generic variant option types — never hardcode weight as the
-- only variant type; fashion items here use size or colour instead)
-- ---------------------------------------------------------------------------
insert into public.attribute_sets (code, name, option_types, spec_fields)
values ('weight', 'Weight',
  '[{"code":"weight","label":"Weight"}]'::jsonb,
  '[]'::jsonb)
on conflict (code) do nothing;
insert into public.attribute_sets (code, name, option_types, spec_fields)
values ('volume', 'Volume',
  '[{"code":"volume","label":"Volume"}]'::jsonb,
  '[]'::jsonb)
on conflict (code) do nothing;
insert into public.attribute_sets (code, name, option_types, spec_fields)
values ('pack_count', 'Pack count',
  '[{"code":"pack_count","label":"Pack of"}]'::jsonb,
  '[]'::jsonb)
on conflict (code) do nothing;
insert into public.attribute_sets (code, name, option_types, spec_fields)
values ('size', 'Size',
  '[{"code":"size","label":"Size"}]'::jsonb,
  '[]'::jsonb)
on conflict (code) do nothing;
insert into public.attribute_sets (code, name, option_types, spec_fields)
values ('colour', 'Colour',
  '[{"code":"colour","label":"Colour"}]'::jsonb,
  '[]'::jsonb)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Platform seller (ADR-004: single seller now, marketplace-ready later)
-- ---------------------------------------------------------------------------
insert into public.sellers (slug, display_name, legal_name, is_platform, status)
values ('vivodha', 'Vivodha', 'Vivodha', true, 'active')
on conflict (slug) do nothing;


-- ---------------------------------------------------------------------------
-- Brands (invented names)
-- ---------------------------------------------------------------------------
insert into public.brands (slug, name) values ('harvestoria', 'Harvestoria') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('puredrop', 'PureDrop') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('spiceroute', 'SpiceRoute') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('nutgrove', 'NutGrove') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('farmfresh', 'FarmFresh') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('meadowgold', 'MeadowGold') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('bakehouse', 'BakeHouse') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('bubblify', 'Bubblify') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('leafbrew', 'LeafBrew') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('clearspring', 'Clearspring') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('crispee', 'Crispee') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('quickbite', 'QuickBite') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('cocoabliss', 'Cocoabliss') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('coastalcatch', 'CoastalCatch') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('coldcrate', 'ColdCrate') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('creamloop', 'Creamloop') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('cleanova', 'Cleanova') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('freshaire', 'Freshaire') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('purebloom', 'Purebloom') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('smilewell', 'Smilewell') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('kitchloom', 'Kitchloom') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('carryall', 'Carryall') on conflict (slug) do nothing;
insert into public.brands (slug, name) values ('penmark', 'Penmark') on conflict (slug) do nothing;
-- ---------------------------------------------------------------------------
-- Products (40, invented names and brands — no real brands)
-- ---------------------------------------------------------------------------

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'food-grocery-atta-rice-and-dal'),
    (select id from public.brands where slug = 'harvestoria'),
    (select id from public.attribute_sets where code = 'weight'),
    'daily-basmati-rice-harvestoria', 'Daily Basmati Rice', '6901', 5, true, 'active'
  where not exists (select 1 from public.products where slug = 'daily-basmati-rice-harvestoria')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('daily-basmati-rice-harvestoria-v1', '{"weight":"1 kg"}', '1 kg', 12000, 9900, 0),
    ('daily-basmati-rice-harvestoria-v2', '{"weight":"5 kg"}', '5 kg', 56000, 47900, 1)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'food-grocery-atta-rice-and-dal'),
    (select id from public.brands where slug = 'harvestoria'),
    (select id from public.attribute_sets where code = 'weight'),
    'stoneground-whole-wheat-atta-harvestoria', 'Stoneground Whole Wheat Atta', '1101', 5, true, 'active'
  where not exists (select 1 from public.products where slug = 'stoneground-whole-wheat-atta-harvestoria')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('stoneground-whole-wheat-atta-harvestoria-v1', '{"weight":"1 kg"}', '1 kg', 6500, 5800, 0),
    ('stoneground-whole-wheat-atta-harvestoria-v2', '{"weight":"5 kg"}', '5 kg', 31000, 27900, 1)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'food-grocery-atta-rice-and-dal'),
    (select id from public.brands where slug = 'harvestoria'),
    (select id from public.attribute_sets where code = 'weight'),
    'toor-dal-harvestoria', 'Toor Dal', '0713', 5, true, 'active'
  where not exists (select 1 from public.products where slug = 'toor-dal-harvestoria')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('toor-dal-harvestoria-v1', '{"weight":"500 g"}', '500 g', 9500, 8500, 0),
    ('toor-dal-harvestoria-v2', '{"weight":"1 kg"}', '1 kg', 18500, 16500, 1)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'food-grocery-oils-and-ghee'),
    (select id from public.brands where slug = 'puredrop'),
    (select id from public.attribute_sets where code = 'volume'),
    'cold-pressed-groundnut-oil-puredrop', 'Cold Pressed Groundnut Oil', '1508', 5, true, 'active'
  where not exists (select 1 from public.products where slug = 'cold-pressed-groundnut-oil-puredrop')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('cold-pressed-groundnut-oil-puredrop-v1', '{"volume":"1 L"}', '1 L', 22000, 19900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'food-grocery-oils-and-ghee'),
    (select id from public.brands where slug = 'puredrop'),
    (select id from public.attribute_sets where code = 'weight'),
    'pure-cow-ghee-puredrop', 'Pure Cow Ghee', '0405', 12, true, 'active'
  where not exists (select 1 from public.products where slug = 'pure-cow-ghee-puredrop')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('pure-cow-ghee-puredrop-v1', '{"weight":"500 g"}', '500 g', 32000, 28900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'food-grocery-masalas-and-spices'),
    (select id from public.brands where slug = 'spiceroute'),
    (select id from public.attribute_sets where code = 'weight'),
    'garam-masala-powder-spiceroute', 'Garam Masala Powder', '0910', 5, true, 'active'
  where not exists (select 1 from public.products where slug = 'garam-masala-powder-spiceroute')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('garam-masala-powder-spiceroute-v1', '{"weight":"100 g"}', '100 g', 8500, 7500, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'food-grocery-masalas-and-spices'),
    (select id from public.brands where slug = 'spiceroute'),
    (select id from public.attribute_sets where code = 'weight'),
    'turmeric-powder-spiceroute', 'Turmeric Powder', '0910', 5, true, 'active'
  where not exists (select 1 from public.products where slug = 'turmeric-powder-spiceroute')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('turmeric-powder-spiceroute-v1', '{"weight":"200 g"}', '200 g', 6000, 5200, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'food-grocery-dry-fruits-and-nuts'),
    (select id from public.brands where slug = 'nutgrove'),
    (select id from public.attribute_sets where code = 'weight'),
    'roasted-almonds-nutgrove', 'Roasted Almonds', '0802', 12, true, 'active'
  where not exists (select 1 from public.products where slug = 'roasted-almonds-nutgrove')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('roasted-almonds-nutgrove-v1', '{"weight":"250 g"}', '250 g', 28000, 24900, 0),
    ('roasted-almonds-nutgrove-v2', '{"weight":"500 g"}', '500 g', 54000, 47900, 1)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'fruits-vegetables-fresh-fruits'),
    (select id from public.brands where slug = 'farmfresh'),
    (select id from public.attribute_sets where code = 'weight'),
    'fresh-royal-gala-apples-farmfresh', 'Fresh Royal Gala Apples', '0808', 0, true, 'active'
  where not exists (select 1 from public.products where slug = 'fresh-royal-gala-apples-farmfresh')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('fresh-royal-gala-apples-farmfresh-v1', '{"weight":"1 kg"}', '1 kg', 18000, 15900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'fruits-vegetables-fresh-fruits'),
    (select id from public.brands where slug = 'farmfresh'),
    (select id from public.attribute_sets where code = 'weight'),
    'ripe-robusta-bananas-farmfresh', 'Ripe Robusta Bananas', '0803', 0, true, 'active'
  where not exists (select 1 from public.products where slug = 'ripe-robusta-bananas-farmfresh')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('ripe-robusta-bananas-farmfresh-v1', '{"weight":"1 kg"}', '1 kg', 6000, 4900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'fruits-vegetables-fresh-vegetables'),
    (select id from public.brands where slug = 'farmfresh'),
    (select id from public.attribute_sets where code = 'weight'),
    'farm-tomatoes-farmfresh', 'Farm Tomatoes', '0702', 0, true, 'active'
  where not exists (select 1 from public.products where slug = 'farm-tomatoes-farmfresh')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('farm-tomatoes-farmfresh-v1', '{"weight":"1 kg"}', '1 kg', 5000, 3900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'fruits-vegetables-fresh-vegetables'),
    (select id from public.brands where slug = 'farmfresh'),
    (select id from public.attribute_sets where code = 'weight'),
    'baby-potatoes-farmfresh', 'Baby Potatoes', '0701', 0, true, 'active'
  where not exists (select 1 from public.products where slug = 'baby-potatoes-farmfresh')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('baby-potatoes-farmfresh-v1', '{"weight":"1 kg"}', '1 kg', 4500, 3500, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'fruits-vegetables-exotic-vegetables'),
    (select id from public.brands where slug = 'farmfresh'),
    (select id from public.attribute_sets where code = 'weight'),
    'broccoli-farmfresh', 'Broccoli', '0704', 0, true, 'active'
  where not exists (select 1 from public.products where slug = 'broccoli-farmfresh')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('broccoli-farmfresh-v1', '{"weight":"250 g"}', '250 g', 7000, 5900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'fruits-vegetables-herbs-and-seasonings'),
    (select id from public.brands where slug = 'farmfresh'),
    (select id from public.attribute_sets where code = 'weight'),
    'fresh-coriander-leaves-farmfresh', 'Fresh Coriander Leaves', '0709', 0, true, 'active'
  where not exists (select 1 from public.products where slug = 'fresh-coriander-leaves-farmfresh')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('fresh-coriander-leaves-farmfresh-v1', '{"weight":"100 g"}', '100 g', 1500, 1200, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'dairy-bakery-milk-and-curd'),
    (select id from public.brands where slug = 'meadowgold'),
    (select id from public.attribute_sets where code = 'volume'),
    'toned-milk-meadowgold', 'Toned Milk', '0401', 0, true, 'active'
  where not exists (select 1 from public.products where slug = 'toned-milk-meadowgold')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('toned-milk-meadowgold-v1', '{"volume":"500 ml"}', '500 ml', 2800, 2700, 0),
    ('toned-milk-meadowgold-v2', '{"volume":"1 L"}', '1 L', 5400, 5200, 1)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'dairy-bakery-milk-and-curd'),
    (select id from public.brands where slug = 'meadowgold'),
    (select id from public.attribute_sets where code = 'weight'),
    'fresh-curd-meadowgold', 'Fresh Curd', '0403', 0, true, 'active'
  where not exists (select 1 from public.products where slug = 'fresh-curd-meadowgold')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('fresh-curd-meadowgold-v1', '{"weight":"400 g"}', '400 g', 4200, 3900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'dairy-bakery-paneer-and-cheese'),
    (select id from public.brands where slug = 'meadowgold'),
    (select id from public.attribute_sets where code = 'weight'),
    'malai-paneer-meadowgold', 'Malai Paneer', '0406', 0, true, 'active'
  where not exists (select 1 from public.products where slug = 'malai-paneer-meadowgold')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('malai-paneer-meadowgold-v1', '{"weight":"200 g"}', '200 g', 9000, 8500, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'dairy-bakery-bread-and-buns'),
    (select id from public.brands where slug = 'bakehouse'),
    (select id from public.attribute_sets where code = 'weight'),
    'multigrain-bread-bakehouse', 'Multigrain Bread', '1905', 0, true, 'active'
  where not exists (select 1 from public.products where slug = 'multigrain-bread-bakehouse')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('multigrain-bread-bakehouse-v1', '{"weight":"400 g"}', '400 g', 5500, 4900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'dairy-bakery-eggs'),
    (select id from public.brands where slug = 'meadowgold'),
    (select id from public.attribute_sets where code = 'pack_count'),
    'farm-eggs-meadowgold', 'Farm Eggs', '0407', 0, false, 'active'
  where not exists (select 1 from public.products where slug = 'farm-eggs-meadowgold')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('farm-eggs-meadowgold-v1', '{"pack_count":"6"}', 'Pack of 6', 4800, 4200, 0),
    ('farm-eggs-meadowgold-v2', '{"pack_count":"12"}', 'Pack of 12', 9000, 7900, 1)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'beverages-soft-drinks'),
    (select id from public.brands where slug = 'bubblify'),
    (select id from public.attribute_sets where code = 'volume'),
    'lemon-fizz-soft-drink-bubblify', 'Lemon Fizz Soft Drink', '2202', 12, true, 'active'
  where not exists (select 1 from public.products where slug = 'lemon-fizz-soft-drink-bubblify')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('lemon-fizz-soft-drink-bubblify-v1', '{"volume":"750 ml"}', '750 ml', 4500, 4000, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'beverages-tea-and-coffee'),
    (select id from public.brands where slug = 'leafbrew'),
    (select id from public.attribute_sets where code = 'weight'),
    'assam-black-tea-leafbrew', 'Assam Black Tea', '0902', 5, true, 'active'
  where not exists (select 1 from public.products where slug = 'assam-black-tea-leafbrew')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('assam-black-tea-leafbrew-v1', '{"weight":"250 g"}', '250 g', 14000, 12500, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'beverages-tea-and-coffee'),
    (select id from public.brands where slug = 'leafbrew'),
    (select id from public.attribute_sets where code = 'weight'),
    'instant-coffee-granules-leafbrew', 'Instant Coffee Granules', '2101', 18, true, 'active'
  where not exists (select 1 from public.products where slug = 'instant-coffee-granules-leafbrew')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('instant-coffee-granules-leafbrew-v1', '{"weight":"100 g"}', '100 g', 21000, 18900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'beverages-water'),
    (select id from public.brands where slug = 'clearspring'),
    (select id from public.attribute_sets where code = 'volume'),
    'packaged-drinking-water-clearspring', 'Packaged Drinking Water', '2201', 18, true, 'active'
  where not exists (select 1 from public.products where slug = 'packaged-drinking-water-clearspring')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('packaged-drinking-water-clearspring-v1', '{"volume":"12 L"}', '1 L (Pack of 12)', 14400, 12000, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'snacks-packaged-food-chips-and-namkeen'),
    (select id from public.brands where slug = 'crispee'),
    (select id from public.attribute_sets where code = 'weight'),
    'classic-salted-potato-chips-crispee', 'Classic Salted Potato Chips', '2005', 12, true, 'active'
  where not exists (select 1 from public.products where slug = 'classic-salted-potato-chips-crispee')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('classic-salted-potato-chips-crispee-v1', '{"weight":"150 g"}', '150 g', 5000, 4500, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'snacks-packaged-food-biscuits-and-cookies'),
    (select id from public.brands where slug = 'bakehouse'),
    (select id from public.attribute_sets where code = 'pack_count'),
    'glucose-biscuits-bakehouse', 'Glucose Biscuits', '1905', 18, true, 'active'
  where not exists (select 1 from public.products where slug = 'glucose-biscuits-bakehouse')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('glucose-biscuits-bakehouse-v1', '{"pack_count":"4"}', 'Pack of 4', 4000, 3600, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'snacks-packaged-food-ready-to-eat'),
    (select id from public.brands where slug = 'quickbite'),
    (select id from public.attribute_sets where code = 'pack_count'),
    'instant-veg-noodles-quickbite', 'Instant Veg Noodles', '1902', 12, true, 'active'
  where not exists (select 1 from public.products where slug = 'instant-veg-noodles-quickbite')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('instant-veg-noodles-quickbite-v1', '{"pack_count":"4"}', 'Pack of 4', 5600, 4800, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'snacks-packaged-food-chocolates'),
    (select id from public.brands where slug = 'cocoabliss'),
    (select id from public.attribute_sets where code = 'weight'),
    'dark-chocolate-bar-cocoabliss', 'Dark Chocolate Bar', '1806', 18, true, 'active'
  where not exists (select 1 from public.products where slug = 'dark-chocolate-bar-cocoabliss')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('dark-chocolate-bar-cocoabliss-v1', '{"weight":"100 g"}', '100 g', 11000, 9900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'non-veg-chicken'),
    (select id from public.brands where slug = 'coastalcatch'),
    (select id from public.attribute_sets where code = 'weight'),
    'fresh-chicken-curry-cut-coastalcatch', 'Fresh Chicken Curry Cut', '0207', 0, false, 'active'
  where not exists (select 1 from public.products where slug = 'fresh-chicken-curry-cut-coastalcatch')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('fresh-chicken-curry-cut-coastalcatch-v1', '{"weight":"500 g"}', '500 g', 15000, 13900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'non-veg-fish-and-seafood'),
    (select id from public.brands where slug = 'coastalcatch'),
    (select id from public.attribute_sets where code = 'weight'),
    'rohu-fish-cleaned-coastalcatch', 'Rohu Fish Cleaned', '0302', 0, false, 'active'
  where not exists (select 1 from public.products where slug = 'rohu-fish-cleaned-coastalcatch')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('rohu-fish-cleaned-coastalcatch-v1', '{"weight":"500 g"}', '500 g', 18000, 16500, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'frozen-frozen-vegetables'),
    (select id from public.brands where slug = 'coldcrate'),
    (select id from public.attribute_sets where code = 'weight'),
    'frozen-mixed-vegetables-coldcrate', 'Frozen Mixed Vegetables', '0710', 5, true, 'active'
  where not exists (select 1 from public.products where slug = 'frozen-mixed-vegetables-coldcrate')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('frozen-mixed-vegetables-coldcrate-v1', '{"weight":"500 g"}', '500 g', 9500, 8500, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'frozen-ice-cream'),
    (select id from public.brands where slug = 'creamloop'),
    (select id from public.attribute_sets where code = 'volume'),
    'vanilla-ice-cream-tub-creamloop', 'Vanilla Ice Cream Tub', '2105', 18, true, 'active'
  where not exists (select 1 from public.products where slug = 'vanilla-ice-cream-tub-creamloop')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('vanilla-ice-cream-tub-creamloop-v1', '{"volume":"700 ml"}', '700 ml', 18000, 15900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'home-care-detergents'),
    (select id from public.brands where slug = 'cleanova'),
    (select id from public.attribute_sets where code = 'volume'),
    'concentrated-liquid-detergent-cleanova', 'Concentrated Liquid Detergent', '3402', 18, false, 'active'
  where not exists (select 1 from public.products where slug = 'concentrated-liquid-detergent-cleanova')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('concentrated-liquid-detergent-cleanova-v1', '{"volume":"1 L"}', '1 L', 21000, 18500, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'home-care-air-fresheners'),
    (select id from public.brands where slug = 'freshaire'),
    (select id from public.attribute_sets where code = 'volume'),
    'lavender-air-freshener-freshaire', 'Lavender Air Freshener', '3307', 18, false, 'active'
  where not exists (select 1 from public.products where slug = 'lavender-air-freshener-freshaire')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('lavender-air-freshener-freshaire-v1', '{"volume":"250 ml"}', '250 ml', 15000, 12900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'personal-care-beauty-bath-and-body'),
    (select id from public.brands where slug = 'purebloom'),
    (select id from public.attribute_sets where code = 'volume'),
    'gentle-moisturising-body-wash-purebloom', 'Gentle Moisturising Body Wash', '3401', 18, false, 'active'
  where not exists (select 1 from public.products where slug = 'gentle-moisturising-body-wash-purebloom')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('gentle-moisturising-body-wash-purebloom-v1', '{"volume":"250 ml"}', '250 ml', 16500, 14900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'personal-care-beauty-hair-care'),
    (select id from public.brands where slug = 'purebloom'),
    (select id from public.attribute_sets where code = 'volume'),
    'nourishing-shampoo-purebloom', 'Nourishing Shampoo', '3305', 18, false, 'active'
  where not exists (select 1 from public.products where slug = 'nourishing-shampoo-purebloom')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('nourishing-shampoo-purebloom-v1', '{"volume":"340 ml"}', '340 ml', 21000, 18900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'personal-care-beauty-oral-care'),
    (select id from public.brands where slug = 'smilewell'),
    (select id from public.attribute_sets where code = 'weight'),
    'herbal-toothpaste-smilewell', 'Herbal Toothpaste', '3306', 18, false, 'active'
  where not exists (select 1 from public.products where slug = 'herbal-toothpaste-smilewell')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('herbal-toothpaste-smilewell-v1', '{"weight":"150 g"}', '150 g', 9500, 8500, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'home-kitchen-cookware'),
    (select id from public.brands where slug = 'kitchloom'),
    (select id from public.attribute_sets where code = 'size'),
    'non-stick-frying-pan-kitchloom', 'Non-stick Frying Pan', '7323', 18, false, 'active'
  where not exists (select 1 from public.products where slug = 'non-stick-frying-pan-kitchloom')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('non-stick-frying-pan-kitchloom-v1', '{"size":"24 cm"}', '24 cm', 65000, 54900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'home-kitchen-storage-and-containers'),
    (select id from public.brands where slug = 'kitchloom'),
    (select id from public.attribute_sets where code = 'pack_count'),
    'airtight-storage-container-set-kitchloom', 'Airtight Storage Container Set', '3924', 18, false, 'active'
  where not exists (select 1 from public.products where slug = 'airtight-storage-container-set-kitchloom')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('airtight-storage-container-set-kitchloom-v1', '{"pack_count":"3"}', 'Set of 3', 42000, 35900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'lifestyle-bags'),
    (select id from public.brands where slug = 'carryall'),
    (select id from public.attribute_sets where code = 'colour'),
    'everyday-tote-bag-carryall', 'Everyday Tote Bag', '4202', 18, false, 'active'
  where not exists (select 1 from public.products where slug = 'everyday-tote-bag-carryall')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('everyday-tote-bag-carryall-v1', '{"colour":"Beige"}', 'Beige', 85000, 69900, 0),
    ('everyday-tote-bag-carryall-v2', '{"colour":"Charcoal"}', 'Charcoal', 85000, 69900, 1)
) as v(sku, option_values, label, mrp_paise, price_paise, position);

with prod as (
  insert into public.products
    (seller_id, category_id, brand_id, attribute_set_id, slug, name, hsn_code, gst_rate, is_veg, status)
  select
    (select id from public.sellers where slug = 'vivodha'),
    (select id from public.categories where slug = 'lifestyle-stationery'),
    (select id from public.brands where slug = 'penmark'),
    (select id from public.attribute_sets where code = 'pack_count'),
    'ruled-notebook-penmark', 'Ruled Notebook', '4820', 12, false, 'active'
  where not exists (select 1 from public.products where slug = 'ruled-notebook-penmark')
  returning id
)
insert into public.variants (product_id, seller_id, sku, option_values, label, mrp_paise, price_paise, position)
select
  prod.id,
  (select id from public.sellers where slug = 'vivodha'),
  v.sku, v.option_values::jsonb, v.label, v.mrp_paise, v.price_paise, v.position
from prod
cross join (values
    ('ruled-notebook-penmark-v1', '{"pack_count":"3"}', 'Pack of 3', 15000, 12900, 0)
) as v(sku, option_values, label, mrp_paise, price_paise, position);
-- ---------------------------------------------------------------------------
-- store_config defaults
-- ---------------------------------------------------------------------------
insert into public.store_config (id, store_name, theme, features, business, legal, support)
values (
  'default',
  'Vivodha',
  '{"primary":"#0B7A55","tint":"#E3F4EC","saffron":"#FF9F1C","offer":"#E5484D","points":"#6B4BC4","ink":"#13261F"}'::jsonb,
  '{"shoppingList":true,"vivoPoints":true,"cod":true,"courierDelivery":false}'::jsonb,
  '{"points":{"earnRupeesPerPoint":100,"pointValueRupees":1,"minRedeemPoints":50,"maxRedeemPercentOfOrder":20,"categoryBoosterMultiplier":2,"inactivityExpiryMonths":12},"delivery":{"freeDeliveryThresholdPaise":49900,"defaultDeliveryFeePaise":2500},"returns":{"defaultReturnDays":7,"defaultIssueReportHours":48},"orderTimeoutMinutes":30}'::jsonb,
  '{"legalName":"TBD - owner decision","gstin":"TBD - owner decision","fssaiLicenseNo":"TBD - owner decision"}'::jsonb,
  '{"email":"support@vivodha.example","phone":"TBD - owner decision"}'::jsonb
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Feature flags
-- ---------------------------------------------------------------------------
insert into public.feature_flags (key, enabled, description) values
  ('shopping_list', true, 'AI shopping list (write/photo/upload)'),
  ('vivo_points', true, 'Vivo Points loyalty programme'),
  ('cod', true, 'Cash on delivery'),
  ('courier_delivery', false, 'Third-party courier aggregator delivery (later phase)'),
  ('google_sign_in', false, 'Google sign-in (later phase)')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Banners (placeholder artwork paths — replace with real assets).
-- No natural-key unique constraint on this table, so idempotency is via
-- WHERE NOT EXISTS (title) rather than ON CONFLICT.
-- ---------------------------------------------------------------------------
insert into public.banners (title, image_path, placement, sort_order, is_active)
select v.title, v.image_path, v.placement, v.sort_order, v.is_active
from (values
  ('Fresh fruits & vegetables', 'banners/placeholder-fruits-veg.png', 'home_carousel', 0, true),
  ('Everyday grocery essentials', 'banners/placeholder-grocery.png', 'home_carousel', 1, true),
  ('Welcome offer', 'banners/placeholder-welcome.png', 'home_carousel', 2, true)
) as v(title, image_path, placement, sort_order, is_active)
where not exists (select 1 from public.banners b where b.title = v.title);

-- ---------------------------------------------------------------------------
-- Home sections (admin-configurable layout, ADR-005). Idempotency via
-- WHERE NOT EXISTS (type) — assumes one row per type for this seed set.
-- ---------------------------------------------------------------------------
insert into public.home_sections (type, title, sort_order, is_active)
select v.type, v.title, v.sort_order, v.is_active
from (values
  ('banner_carousel', null, 0, true),
  ('category_grid', 'Shop by category', 1, true),
  ('shopping_list_entry', 'Shopping list', 2, true),
  ('rail_deals', 'Deals', 3, true),
  ('rail_best_sellers', 'Best sellers', 4, true),
  ('rail_top_picks', 'Top picks for you', 5, true),
  ('rail_recently_viewed', 'Recently viewed', 6, true)
) as v(type, title, sort_order, is_active)
where not exists (select 1 from public.home_sections h where h.type = v.type);

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------
insert into public.coupons (code, description, type, value, max_discount_paise, min_order_paise, is_active) values
  ('WELCOME10', '10% off on your first order', 'percent', 1000, 15000, 29900, true),
  ('FREESHIP', 'Free delivery on orders above ₹399', 'free_delivery', 0, null, 39900, true)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Serviceable pincodes (ADR-130: placeholders — owner supplies the real area)
-- ---------------------------------------------------------------------------
insert into public.serviceable_pincodes
  (pincode, city, state, delivery_mode, delivery_fee_paise, free_delivery_threshold_paise, eta_text, cod_allowed, is_placeholder)
values
  ('600001', 'Chennai', 'Tamil Nadu', 'own_delivery', 2500, 49900, 'Today, 2-4 hours', true, true),
  ('600002', 'Chennai', 'Tamil Nadu', 'own_delivery', 2500, 49900, 'Today, 2-4 hours', true, true),
  ('560001', 'Bengaluru', 'Karnataka', 'courier', 4000, 59900, '2-3 days', true, true),
  ('400001', 'Mumbai', 'Maharashtra', 'courier', 4000, 59900, '2-3 days', false, true)
on conflict (pincode) do nothing;

-- ---------------------------------------------------------------------------
-- First super_admin (ADR-131) — resolved to admin_users on first signup with
-- this email by the auth.users trigger (handle_new_user(), migration 02).
-- ---------------------------------------------------------------------------
insert into public.admin_invites (email, role)
values ('sivasaravanan492@gmail.com', 'super_admin')
on conflict (email) do nothing;
