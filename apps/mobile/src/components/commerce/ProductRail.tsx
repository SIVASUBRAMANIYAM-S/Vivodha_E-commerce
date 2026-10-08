import { FlashList } from '@shopify/flash-list';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { FadeUpOnce, useFirstLoadEntrance } from '@/components/motion/FadeUpOnce';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import type { CatalogProduct } from '@/features/catalog/api/catalog';
import { radius, spacing } from '@/theme';

import { ProductCard, RAIL_CARD_WIDTH } from './ProductCard';
import { SectionHeader } from './SectionHeader';

type Props = {
  railKey: string;
  title: string;
  products: CatalogProduct[] | undefined;
  loading?: boolean;
  /** Shown when there are no products (e.g. recently viewed before any views). */
  emptyMessage?: string;
  onSeeAll?: () => void;
};

/** Horizontal rail of product cards (FlashList), with skeleton and first-load stagger. */
export const ProductRail = memo(function ProductRail({
  railKey,
  title,
  products,
  loading,
  emptyMessage,
  onSeeAll,
}: Props) {
  useFirstLoadEntrance(railKey, !!products && products.length > 0);

  const renderItem = useCallback(
    ({ item, index }: { item: CatalogProduct; index: number }) => (
      <FadeUpOnce listKey={railKey} index={index}>
        <ProductCard product={item} variant="rail" />
      </FadeUpOnce>
    ),
    [railKey],
  );

  if (!loading && (!products || products.length === 0) && !emptyMessage) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} onAction={products?.length ? onSeeAll : undefined} />
      {loading ? (
        <RailSkeleton />
      ) : products && products.length > 0 ? (
        <FlashList
          horizontal
          data={products}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={Separator}
        />
      ) : (
        <View style={styles.empty}>
          <Text color="textSecondary">{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
});

function Separator() {
  return <View style={styles.separator} />;
}

/** Matches ProductCard's rail dimensions so nothing jumps when data arrives. */
export function RailSkeleton() {
  return (
    <View style={[styles.content, styles.skeletonRow]}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width="100%" height={RAIL_CARD_WIDTH - spacing.lg} radius={radius.image} />
          <Skeleton width="85%" height={14} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="100%" height={36} radius={radius.button} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.xs },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  separator: { width: spacing.md },
  empty: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  skeletonRow: { flexDirection: 'row', gap: spacing.md },
  skeletonCard: { width: RAIL_CARD_WIDTH, gap: spacing.sm, padding: spacing.sm },
});
