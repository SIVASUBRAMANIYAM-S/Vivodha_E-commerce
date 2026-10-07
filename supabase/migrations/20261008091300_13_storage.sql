-- Phase 1: storage buckets — product-images and banners (public read, admin
-- write), shopping-list-uploads (private, owner only).

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('banners', 'banners', true),
  ('shopping-list-uploads', 'shopping-list-uploads', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- product-images: public read, catalog+ write
-- ---------------------------------------------------------------------------
create policy product_images_bucket_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy product_images_bucket_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[])
  );

create policy product_images_bucket_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[])
  )
  with check (
    bucket_id = 'product-images'
    and has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[])
  );

create policy product_images_bucket_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[])
  );

-- ---------------------------------------------------------------------------
-- banners: public read, catalog+ write
-- ---------------------------------------------------------------------------
create policy banners_bucket_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'banners');

create policy banners_bucket_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'banners'
    and has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[])
  );

create policy banners_bucket_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'banners'
    and has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[])
  )
  with check (
    bucket_id = 'banners'
    and has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[])
  );

create policy banners_bucket_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'banners'
    and has_admin_role(array['catalog', 'manager', 'super_admin']::public.admin_role[])
  );

-- ---------------------------------------------------------------------------
-- shopping-list-uploads: private, owner only. Path convention:
-- shopping-list-uploads/{user_id}/{filename} — the first path segment must
-- match the caller's own uid.
-- ---------------------------------------------------------------------------
create policy shopping_list_uploads_owner_all on storage.objects
  for all to authenticated
  using (
    bucket_id = 'shopping-list-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'shopping-list-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy shopping_list_uploads_admin_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'shopping-list-uploads'
    and has_admin_role(array['support', 'manager', 'super_admin']::public.admin_role[])
  );
