-- Phase 1: search indexes — full-text on products, trigram for typo tolerance.

create index products_search_idx on public.products using gin (search);

create index products_name_trgm_idx
  on public.products using gin (name extensions.gin_trgm_ops);

create index brands_name_trgm_idx
  on public.brands using gin (name extensions.gin_trgm_ops);
