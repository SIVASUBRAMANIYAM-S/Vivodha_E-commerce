-- pgTAP: every table in `erp` has RLS enabled (CLAUDE.md: "RLS on every
-- table", no exceptions). Run with `pnpm supabase test db` (needs Docker).
begin;
select plan(1);

select is(
  (
    select count(*)::int
    from pg_tables t
    where t.schemaname = 'erp'
      and not exists (
        select 1 from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = t.schemaname and c.relname = t.tablename and c.relrowsecurity
      )
  ),
  0,
  'every table in erp has row level security enabled'
);

select * from finish();
rollback;
