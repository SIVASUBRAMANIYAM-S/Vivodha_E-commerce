import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui';

export default function CategoryListingScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return (
    <PlaceholderScreen
      title={`Category: ${slug}`}
      phase="Phase 5"
      description="Subcategory tabs, filters (brand, price, discount) and sort."
    />
  );
}
