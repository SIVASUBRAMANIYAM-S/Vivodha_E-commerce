import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui';
import { useCatalog } from '@/features/catalog/api/catalog';

/** Interim screen: the category listing is built right after the Home/Design Lab review. */
export default function CategoryListingScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data } = useCatalog();
  const category = slug ? data?.categoriesBySlug.get(slug) : undefined;
  return (
    <PlaceholderScreen
      title={category?.name ?? 'Category'}
      phase="this phase, after your Home review"
      description="Subcategory tabs, product grid, filters (brand, price, discount) and sort."
    />
  );
}
