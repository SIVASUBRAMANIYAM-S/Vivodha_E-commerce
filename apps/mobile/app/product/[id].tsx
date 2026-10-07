import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { PlaceholderScreen } from '@/components/ui';
import { useCatalog } from '@/features/catalog/api/catalog';
import { useRecentlyViewedStore } from '@/store/session-store';

/**
 * Interim screen: the full product detail (gallery, variants, stepper, similar
 * products) is built right after the Home/Design Lab review. Already records
 * the view so Home's "Recently viewed" rail can be tested.
 */
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const push = useRecentlyViewedStore((s) => s.push);
  const { data } = useCatalog();
  const product = id ? data?.productsById.get(id) : undefined;

  useEffect(() => {
    if (id) push(id);
  }, [id, push]);

  return (
    <PlaceholderScreen
      title={product?.name ?? 'Product'}
      phase="this phase, after your Home review"
      description="Image gallery, variant selector, price, add to cart and similar products."
    />
  );
}
