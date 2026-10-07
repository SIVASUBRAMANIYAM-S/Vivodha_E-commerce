import { FlashList } from '@shopify/flash-list';
import { BlurTargetView } from 'expo-blur';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { Platform, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BannerCarousel } from '@/components/commerce/BannerCarousel';
import { CART_BAR_HEIGHT } from '@/components/commerce/CartBar';
import { CategoryTile } from '@/components/commerce/CategoryTile';
import { ProductRail } from '@/components/commerce/ProductRail';
import { SectionHeader } from '@/components/commerce/SectionHeader';
import { ShoppingListCard } from '@/components/commerce/ShoppingListCard';
import { LeafRefresh } from '@/components/motion/LeafRefresh';
import { useChromeScrollHandler, useResetChromeOnFocus } from '@/components/motion/ScrollChrome';
import { CollapsingHeader, headerHeight } from '@/components/navigation/CollapsingHeader';
import { TAB_BAR_HEIGHT } from '@/components/navigation/TabBar';
import { ErrorState, OfflineBanner } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  bestSellersRail,
  dealsRail,
  topLevelCategories,
  useCatalog,
  type Catalog,
} from '@/features/catalog/api/catalog';
import { useHome, type HomeSectionType } from '@/features/catalog/api/home';
import { useLocationStore } from '@/store/location-store';
import { useRecentlyViewedStore } from '@/store/session-store';
import { radius, spacing, useTheme } from '@/theme';

// Reanimated-driven FlashList so the scroll offset reaches the UI thread directly.
const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList,
) as unknown as typeof FlashList;

type Row = { key: string; type: HomeSectionType; title: string | null };

/** Section order used for skeletons before home_sections has loaded. */
const SKELETON_ROWS: Row[] = [
  { key: 's-banner', type: 'banner_carousel', title: null },
  { key: 's-grid', type: 'category_grid', title: 'Shop by category' },
  { key: 's-deals', type: 'rail_deals', title: 'Deals' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const home = useHome();
  const catalog = useCatalog();
  const pincode = useLocationStore((s) => s.pincode);
  const recentIds = useRecentlyViewedStore((s) => s.productIds);
  const scrollY = useSharedValue(0);
  const onScroll = useChromeScrollHandler(scrollY);
  const blurTarget = useRef<View>(null);
  useResetChromeOnFocus();

  const top = headerHeight(insets.top);
  // iOS overscroll gives continuous pull feedback for the leaf; Android lists don't overscroll.
  const pull = useDerivedValue(() => Math.min(Math.max(-scrollY.value / 80, 0), 1));

  const loading = home.isPending || catalog.isPending;
  const failed = home.isError || catalog.isError;
  const refreshing = (home.isRefetching || catalog.isRefetching) && !loading;

  const rows: Row[] = useMemo(() => {
    if (!home.data) return SKELETON_ROWS;
    return home.data.sections.map((s) => ({ key: s.id, type: s.type, title: s.title }));
  }, [home.data]);

  const onRefresh = useCallback(() => {
    void home.refetch();
    void catalog.refetch();
  }, [catalog, home]);

  const renderItem = useCallback(
    ({ item }: { item: Row }) => (
      <HomeSection
        row={item}
        catalog={catalog.data}
        banners={home.data?.banners}
        recentIds={recentIds}
        loading={loading}
      />
    ),
    [catalog.data, home.data?.banners, loading, recentIds],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <BlurTargetView ref={blurTarget} style={styles.root}>
        {failed && !loading ? (
          <View style={[styles.center, { paddingTop: top }]}>
            <ErrorState
              message="We couldn't load the store. Check your connection and try again."
              onRetry={onRefresh}
            />
          </View>
        ) : (
          <AnimatedFlashList
            data={rows}
            keyExtractor={(r) => r.key}
            getItemType={(r) => r.type}
            renderItem={renderItem}
            onScroll={onScroll as never}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: top + spacing.xs,
              paddingBottom: TAB_BAR_HEIGHT + CART_BAR_HEIGHT + insets.bottom + spacing.xl,
            }}
            ItemSeparatorComponent={SectionGap}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                progressViewOffset={top}
                // The custom leaf below is the visible indicator; hide the native spinner.
                tintColor="transparent"
                colors={['transparent']}
                progressBackgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
              />
            }
          />
        )}
      </BlurTargetView>

      <View pointerEvents="none" style={[styles.leaf, { top: top + spacing.sm }]}>
        <LeafRefresh refreshing={refreshing} pull={pull} />
      </View>

      <CollapsingHeader
        scrollY={scrollY}
        blurTarget={blurTarget}
        deliveryLabel={pincode ? `Delivering to ${pincode}` : 'Set your delivery location'}
        onSearchPress={() => router.navigate('/search')}
      />
      <View style={[styles.offline, { top }]}>
        <OfflineBanner />
      </View>
    </View>
  );
}

function SectionGap() {
  return <View style={styles.gap} />;
}

type SectionProps = {
  row: Row;
  catalog: Catalog | undefined;
  banners: Parameters<typeof BannerCarousel>[0]['banners'];
  recentIds: string[];
  loading: boolean;
};

function HomeSection({ row, catalog, banners, recentIds, loading }: SectionProps) {
  switch (row.type) {
    case 'banner_carousel':
      return <BannerCarousel banners={banners} loading={loading} />;
    case 'category_grid':
      return (
        <CategoryGrid title={row.title ?? 'Shop by category'} catalog={catalog} loading={loading} />
      );
    case 'shopping_list_entry':
      return <ShoppingListCard />;
    case 'rail_deals':
      return (
        <ProductRail
          railKey="home-deals"
          title={row.title ?? 'Deals'}
          products={catalog ? dealsRail(catalog) : undefined}
          loading={loading}
        />
      );
    case 'rail_best_sellers':
      return (
        <ProductRail
          railKey="home-best-sellers"
          title={row.title ?? 'Best sellers'}
          products={catalog ? bestSellersRail(catalog) : undefined}
          loading={loading}
        />
      );
    case 'rail_top_picks':
      return (
        <ProductRail
          railKey="home-top-picks"
          title={row.title ?? 'Top picks for you'}
          products={[]}
          loading={false}
          emptyMessage="Personal picks appear here once you start shopping."
        />
      );
    case 'rail_recently_viewed': {
      const products = catalog
        ? recentIds.map((id) => catalog.productsById.get(id)).filter((p) => p !== undefined)
        : undefined;
      return (
        <ProductRail
          railKey="home-recently-viewed"
          title={row.title ?? 'Recently viewed'}
          products={products}
          loading={loading}
          emptyMessage="Products you look at will show up here."
        />
      );
    }
    default:
      return null;
  }
}

const GRID_COLUMNS = 4;

function CategoryGrid({
  title,
  catalog,
  loading,
}: {
  title: string;
  catalog: Catalog | undefined;
  loading: boolean;
}) {
  const categories = catalog ? topLevelCategories(catalog) : [];
  return (
    <View style={styles.gridSection}>
      <SectionHeader title={title} />
      <View style={styles.grid}>
        {loading || !catalog
          ? Array.from({ length: 8 }, (_, i) => (
              <View key={i} style={styles.cell}>
                <Skeleton width="100%" height={72} radius={radius.card} />
                <Skeleton width="70%" height={10} style={styles.centerSelf} />
              </View>
            ))
          : categories.map((c) => (
              <View key={c.id} style={styles.cell}>
                <CategoryTile
                  name={c.name}
                  slug={c.slug}
                  onPress={() =>
                    router.push({ pathname: '/category/[slug]', params: { slug: c.slug } })
                  }
                />
              </View>
            ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center' },
  gap: { height: spacing.xl },
  leaf: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 5 },
  offline: { position: 'absolute', left: 0, right: 0, zIndex: 11 },
  gridSection: { gap: spacing.xs },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg - spacing.xs,
    rowGap: spacing.md,
  },
  cell: { width: `${100 / GRID_COLUMNS}%`, paddingHorizontal: spacing.xs, gap: spacing.xs },
  centerSelf: { alignSelf: 'center' },
});
