import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <PlaceholderScreen
      title={`Product ${id}`}
      phase="Phase 5"
      description="Images, variants, price, offers, details and similar products."
    />
  );
}
