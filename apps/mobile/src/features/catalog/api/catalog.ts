import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

/**
 * Read-only catalog queries (anon session). Uses the RLS-safe surfaces only:
 * products/categories/product_images (active rows) and variants_public (member
 * price hidden from anon/guest, see docs/rls-policies.md).
 */

export type CatalogVariant = {
  id: string;
  productId: string;
  label: string;
  mrpPaise: number;
  pricePaise: number;
  memberPricePaise: number | null;
  maxPerOrder: number;
  position: number;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categoryId: string;
  brandName: string | null;
  isVeg: boolean | null;
  images: string[];
  variants: CatalogVariant[];
};

export type CatalogCategory = {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  sortOrder: number;
};

export type Catalog = {
  products: CatalogProduct[];
  productsById: Map<string, CatalogProduct>;
  categories: CatalogCategory[];
  categoriesBySlug: Map<string, CatalogCategory>;
};

export function publicImageUrl(bucket: 'product-images' | 'banners', path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function fetchCatalog(): Promise<Catalog> {
  const [productsRes, variantsRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, slug, name, description, category_id, is_veg, brands(name), product_images(storage_path, position)',
      )
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('name'),
    supabase
      .from('variants_public')
      .select(
        'id, product_id, label, mrp_paise, price_paise, member_price_paise, max_per_order, position',
      ),
    supabase.from('categories').select('id, parent_id, slug, name, sort_order').order('sort_order'),
  ]);

  if (productsRes.error) throw productsRes.error;
  if (variantsRes.error) throw variantsRes.error;
  if (categoriesRes.error) throw categoriesRes.error;

  const variantsByProduct = new Map<string, CatalogVariant[]>();
  for (const v of variantsRes.data) {
    // View columns are nullable in the generated types; skip incomplete rows.
    if (!v.id || !v.product_id || v.mrp_paise == null || v.price_paise == null) continue;
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push({
      id: v.id,
      productId: v.product_id,
      label: v.label ?? '',
      mrpPaise: v.mrp_paise,
      pricePaise: v.price_paise,
      memberPricePaise: v.member_price_paise,
      maxPerOrder: v.max_per_order ?? 10,
      position: v.position ?? 0,
    });
    variantsByProduct.set(v.product_id, list);
  }

  const products: CatalogProduct[] = [];
  for (const p of productsRes.data) {
    const variants = (variantsByProduct.get(p.id) ?? []).sort((a, b) => a.position - b.position);
    if (variants.length === 0) continue; // nothing purchasable
    const images = [...(p.product_images ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((img) => publicImageUrl('product-images', img.storage_path));
    products.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      categoryId: p.category_id,
      brandName: p.brands?.name ?? null,
      isVeg: p.is_veg,
      images,
      variants,
    });
  }

  const categories: CatalogCategory[] = categoriesRes.data.map((c) => ({
    id: c.id,
    parentId: c.parent_id,
    slug: c.slug,
    name: c.name,
    sortOrder: c.sort_order,
  }));

  return {
    products,
    productsById: new Map(products.map((p) => [p.id, p])),
    categories,
    categoriesBySlug: new Map(categories.map((c) => [c.slug, c])),
  };
}

export const catalogQueryKey = ['catalog'] as const;

export function useCatalog() {
  return useQuery({ queryKey: catalogQueryKey, queryFn: fetchCatalog, staleTime: 5 * 60_000 });
}

// ---------------------------------------------------------------------------
// Pure selectors (memoise at the call site with useMemo).
// ---------------------------------------------------------------------------

export function topLevelCategories(catalog: Catalog): CatalogCategory[] {
  return catalog.categories.filter((c) => c.parentId === null);
}

export function childCategories(catalog: Catalog, parentId: string): CatalogCategory[] {
  return catalog.categories.filter((c) => c.parentId === parentId);
}

/** Products in a category or any of its descendants. */
export function productsInCategory(catalog: Catalog, categoryId: string): CatalogProduct[] {
  const ids = new Set<string>([categoryId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of catalog.categories) {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        grew = true;
      }
    }
  }
  return catalog.products.filter((p) => ids.has(p.categoryId));
}

export function bestDiscountPercent(p: CatalogProduct): number {
  return Math.max(
    ...p.variants.map((v) =>
      v.mrpPaise > 0 ? Math.round(((v.mrpPaise - v.pricePaise) / v.mrpPaise) * 100) : 0,
    ),
  );
}

/** Deals rail: biggest discount first. */
export function dealsRail(catalog: Catalog, limit = 10): CatalogProduct[] {
  return [...catalog.products]
    .filter((p) => bestDiscountPercent(p) > 0)
    .sort((a, b) => bestDiscountPercent(b) - bestDiscountPercent(a))
    .slice(0, limit);
}

/**
 * Best sellers rail. There are no orders yet, so this is a deterministic
 * stand-in (one product per top-level category, in category order) until
 * Phase 7 can rank by real sales.
 */
export function bestSellersRail(catalog: Catalog, limit = 10): CatalogProduct[] {
  const picked: CatalogProduct[] = [];
  for (const top of topLevelCategories(catalog)) {
    const first = productsInCategory(catalog, top.id)[0];
    if (first) picked.push(first);
    if (picked.length >= limit) break;
  }
  return picked;
}

export function similarProducts(catalog: Catalog, product: CatalogProduct, limit = 10) {
  const category = catalog.categories.find((c) => c.id === product.categoryId);
  const scopeId = category?.parentId ?? product.categoryId;
  return productsInCategory(catalog, scopeId)
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}
