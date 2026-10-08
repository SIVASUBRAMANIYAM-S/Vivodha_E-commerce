import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ArrowUpDown, Check, ChevronLeft, SlidersHorizontal } from '@/components/icons';
import { ProductCard } from '@/components/commerce/ProductCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState, ErrorState, OfflineBanner, useIsOffline } from '@/components/ui/States';
import { PressableScale } from '@/components/ui/PressableScale';
import { Sheet, type SheetRef } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import {
  bestDiscountPercent,
  childCategories,
  productsInCategory,
  useCatalog,
  type CatalogProduct,
} from '@/features/catalog/api/catalog';
import { haptic } from '@/lib/haptics';
import { radius, spacing, springConfig, touch, useTheme } from '@/theme';

type PriceRangeId = 'under-100' | '100-300' | '300-500' | '500-plus';
type PriceRange = { id: PriceRangeId; label: string; min: number; max: number | null };
type Filters = { brands: string[]; priceRange: PriceRangeId | null; discount: number | null };
type SortMode = 'relevance' | 'price-asc' | 'price-desc' | 'discount';

const PRICE_RANGES: PriceRange[] = [
  { id: 'under-100', label: 'Under ₹100', min: 0, max: 10_000 },
  { id: '100-300', label: '₹100–₹300', min: 10_000, max: 30_000 },
  { id: '300-500', label: '₹300–₹500', min: 30_000, max: 50_000 },
  { id: '500-plus', label: '₹500+', min: 50_000, max: null },
];

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'discount', label: 'Discount' },
];

const EMPTY_FILTERS: Filters = { brands: [], priceRange: null, discount: null };

function lowestPrice(product: CatalogProduct): number {
  return Math.min(...product.variants.map((variant) => variant.pricePaise));
}

function highestPrice(product: CatalogProduct): number {
  return Math.max(...product.variants.map((variant) => variant.pricePaise));
}

function inPriceRange(product: CatalogProduct, range: PriceRange): boolean {
  return product.variants.some(
    (variant) =>
      variant.pricePaise >= range.min && (range.max === null || variant.pricePaise < range.max),
  );
}

export default function CategoryListingScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  return <CategoryListingContent key={slug ?? 'missing'} slug={slug} />;
}

function CategoryListingContent({ slug }: { slug?: string }) {
  const { colors } = useTheme();
  const catalog = useCatalog();
  const offline = useIsOffline();
  const filterRef = useRef<SheetRef>(null);
  const sortRef = useRef<SheetRef>(null);
  const category = slug ? catalog.data?.categoriesBySlug.get(slug) : undefined;
  const subcategories = useMemo(
    () => (catalog.data && category ? childCategories(catalog.data, category.id) : []),
    [catalog.data, category],
  );
  const [subcategoryId, setSubcategoryId] = useState('all');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);

  const baseProducts = useMemo(
    () =>
      catalog.data && category
        ? productsInCategory(catalog.data, subcategoryId === 'all' ? category.id : subcategoryId)
        : [],
    [catalog.data, category, subcategoryId],
  );

  const brands = useMemo(
    () =>
      [...new Set(baseProducts.map((product) => product.brandName).filter((brand) => !!brand))]
        .sort((a, b) => a!.localeCompare(b!))
        .filter((brand): brand is string => brand !== null),
    [baseProducts],
  );

  const visibleProducts = useMemo(() => {
    const selectedRange = PRICE_RANGES.find((range) => range.id === filters.priceRange);
    const result = baseProducts.filter((product) => {
      if (filters.brands.length > 0 && !filters.brands.includes(product.brandName ?? '')) {
        return false;
      }
      if (selectedRange && !inPriceRange(product, selectedRange)) return false;
      if (filters.discount !== null && bestDiscountPercent(product) < filters.discount)
        return false;
      return true;
    });

    if (sortMode === 'price-asc') result.sort((a, b) => lowestPrice(a) - lowestPrice(b));
    else if (sortMode === 'price-desc') result.sort((a, b) => highestPrice(b) - highestPrice(a));
    else if (sortMode === 'discount')
      result.sort((a, b) => bestDiscountPercent(b) - bestDiscountPercent(a));
    return result;
  }, [baseProducts, filters, sortMode]);

  const activeFilterCount =
    filters.brands.length + Number(filters.priceRange !== null) + Number(filters.discount !== null);

  const openFilters = useCallback(() => {
    setDraftFilters(filters);
    requestAnimationFrame(() => filterRef.current?.present());
  }, [filters]);

  const openSort = useCallback(() => {
    requestAnimationFrame(() => sortRef.current?.present());
  }, []);

  const onRefresh = useCallback(() => {
    void catalog.refetch();
  }, [catalog]);

  const renderProduct = useCallback(
    ({ item, index }: { item: CatalogProduct; index: number }) => (
      <View
        style={{
          flex: 1,
          paddingRight: index % 2 === 0 ? spacing.xs : 0,
          paddingLeft: index % 2 === 1 ? spacing.xs : 0,
        }}
      >
        <ProductCard product={item} />
      </View>
    ),
    [],
  );

  if (catalog.isPending) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.surface }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Category" onBack={() => router.back()} />
        <LoadingGrid />
      </SafeAreaView>
    );
  }

  if (catalog.isError && !catalog.data) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.surface }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Category" onBack={() => router.back()} />
        <ErrorState
          title="Couldn't load this category"
          message="Check your connection and try again."
          onRetry={onRefresh}
        />
        <OfflineBanner />
      </SafeAreaView>
    );
  }

  if (!category) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.surface }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Category" onBack={() => router.back()} />
        <EmptyState
          title="Category not found"
          message="This category may have moved. Browse the catalog to find it."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title={category.name} onBack={() => router.back()} />
      {offline ? <OfflineBanner /> : null}

      <View style={[styles.tabsWrap, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          <SubcategoryTab
            id="all"
            label="All"
            selected={subcategoryId === 'all'}
            onPress={() => {
              haptic('select');
              setSubcategoryId('all');
            }}
          />
          {subcategories.map((subcategory) => (
            <SubcategoryTab
              key={subcategory.id}
              id={subcategory.id}
              label={subcategory.name}
              selected={subcategoryId === subcategory.id}
              onPress={() => {
                haptic('select');
                setSubcategoryId(subcategory.id);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.toolbar}>
        <Text variant="small" color="textSecondary">
          {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
        </Text>
        <View style={styles.toolbarActions}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Filter${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
            onPress={openFilters}
            hapticEvent="select"
            style={[styles.toolbarButton, { borderColor: colors.border }]}
          >
            <SlidersHorizontal size={17} color={colors.textPrimary} />
            <Text variant="small">Filter{activeFilterCount ? ` · ${activeFilterCount}` : ''}</Text>
          </PressableScale>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Sort: ${SORT_OPTIONS.find((option) => option.id === sortMode)?.label}`}
            onPress={openSort}
            hapticEvent="select"
            style={[styles.toolbarButton, { borderColor: colors.border }]}
          >
            <ArrowUpDown size={17} color={colors.textPrimary} />
            <Text variant="small">Sort</Text>
          </PressableScale>
        </View>
      </View>

      <FlashList
        data={visibleProducts}
        numColumns={2}
        keyExtractor={(product) => product.id}
        getItemType={() => 'product'}
        renderItem={renderProduct}
        ItemSeparatorComponent={GridSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        refreshControl={<RefreshControl refreshing={catalog.isRefetching} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            title="No products match"
            message="Try changing or clearing your filters."
            actionLabel={activeFilterCount ? 'Clear filters' : undefined}
            onAction={
              activeFilterCount
                ? () => {
                    setFilters(EMPTY_FILTERS);
                    setSubcategoryId('all');
                  }
                : undefined
            }
          />
        }
      />

      <Sheet ref={filterRef} title="Filter products">
        <FilterOptions
          brands={brands}
          value={draftFilters}
          onChange={setDraftFilters}
          onClear={() => setDraftFilters(EMPTY_FILTERS)}
          onApply={() => {
            setFilters(draftFilters);
            filterRef.current?.dismiss();
          }}
        />
      </Sheet>

      <Sheet ref={sortRef} title="Sort by">
        <View style={styles.sortOptions}>
          {SORT_OPTIONS.map((option) => {
            const selected = sortMode === option.id;
            return (
              <PressableScale
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
                onPress={() => {
                  setSortMode(option.id);
                  sortRef.current?.dismiss();
                }}
                style={[
                  styles.sortOption,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.surfaceTint : colors.surface,
                  },
                ]}
              >
                <Text variant="bodyStrong">{option.label}</Text>
                {selected ? <Check size={18} color={colors.primary} /> : null}
              </PressableScale>
            );
          })}
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.screenHeader, { borderBottomColor: colors.border }]}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        hapticEvent={false}
        style={styles.backButton}
      >
        <ChevronLeft size={24} color={colors.textPrimary} />
      </PressableScale>
      <Text variant="h2" numberOfLines={1} style={styles.headerTitle}>
        {title}
      </Text>
      <View style={styles.backButton} />
    </View>
  );
}

function SubcategoryTab({
  id,
  label,
  selected,
  onPress,
}: {
  id: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const progress = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, springConfig('snappy'));
  }, [progress, selected]);
  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
    opacity: progress.value,
  }));

  return (
    <PressableScale
      key={id}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      hapticEvent={false}
      style={styles.tab}
    >
      <Text
        variant="bodyStrong"
        style={{ color: selected ? colors.primary : colors.textSecondary }}
      >
        {label}
      </Text>
      <Animated.View
        style={[styles.tabIndicator, { backgroundColor: colors.primary }, underlineStyle]}
      />
    </PressableScale>
  );
}

function FilterOptions({
  brands,
  value,
  onChange,
  onClear,
  onApply,
}: {
  brands: string[];
  value: Filters;
  onChange: (next: Filters) => void;
  onClear: () => void;
  onApply: () => void;
}) {
  const toggleBrand = (brand: string) => {
    const next = value.brands.includes(brand)
      ? value.brands.filter((selected) => selected !== brand)
      : [...value.brands, brand];
    onChange({ ...value, brands: next });
  };

  return (
    <View style={styles.filterContent}>
      <View style={styles.filterGroup}>
        <Text variant="bodyStrong">Brand</Text>
        {brands.length ? (
          <View style={styles.chips}>
            {brands.map((brand) => (
              <Chip
                key={brand}
                label={brand}
                selected={value.brands.includes(brand)}
                onPress={() => toggleBrand(brand)}
              />
            ))}
          </View>
        ) : (
          <Text variant="small" color="textSecondary">
            No brand filters are available in this category.
          </Text>
        )}
      </View>

      <View style={styles.filterGroup}>
        <Text variant="bodyStrong">Price</Text>
        <View style={styles.chips}>
          {PRICE_RANGES.map((range) => (
            <Chip
              key={range.id}
              label={range.label}
              selected={value.priceRange === range.id}
              onPress={() =>
                onChange({
                  ...value,
                  priceRange: value.priceRange === range.id ? null : range.id,
                })
              }
            />
          ))}
        </View>
      </View>

      <View style={styles.filterGroup}>
        <Text variant="bodyStrong">Discount</Text>
        <View style={styles.chips}>
          {[10, 20, 30].map((discount) => (
            <Chip
              key={discount}
              label={`${discount}% or more`}
              selected={value.discount === discount}
              onPress={() =>
                onChange({
                  ...value,
                  discount: value.discount === discount ? null : discount,
                })
              }
            />
          ))}
        </View>
      </View>

      <View style={styles.filterActions}>
        <Button title="Clear" variant="secondary" onPress={onClear} />
        <Button title="Show products" onPress={onApply} style={styles.applyButton} />
      </View>
    </View>
  );
}

function GridSeparator() {
  return <View style={styles.gridSeparator} />;
}

function LoadingGrid() {
  return (
    <View style={styles.loadingGrid}>
      <View style={styles.loadingTabs}>
        {[100, 78, 96].map((width, index) => (
          <Skeleton key={index} width={width} height={40} radius={radius.pill} />
        ))}
      </View>
      <View style={styles.loadingToolbar}>
        <Skeleton width={88} height={16} />
        <View style={styles.toolbarActions}>
          <Skeleton width={88} height={40} radius={radius.button} />
          <Skeleton width={78} height={40} radius={radius.button} />
        </View>
      </View>
      <View style={styles.loadingCards}>
        {Array.from({ length: 6 }, (_, index) => (
          <View key={index} style={styles.loadingCard}>
            <Skeleton width="100%" height={156} radius={radius.image} />
            <Skeleton width="90%" height={18} />
            <Skeleton width="58%" height={16} />
            <Skeleton width="100%" height={40} radius={radius.button} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  screenHeader: {
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center' },
  tabsWrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  tabsContent: { paddingHorizontal: spacing.lg, gap: spacing.xl },
  tab: {
    minHeight: 48,
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  tabIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
  toolbar: {
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  toolbarActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toolbarButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
  },
  gridContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  gridSeparator: { height: spacing.md },
  sortOptions: { gap: spacing.sm },
  sortOption: {
    minHeight: touch.min,
    borderWidth: 1,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterContent: { gap: spacing.lg },
  filterGroup: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterActions: { flexDirection: 'row', gap: spacing.sm },
  applyButton: { flex: 1 },
  loadingGrid: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  loadingTabs: { flexDirection: 'row', gap: spacing.md },
  loadingToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingCards: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  loadingCard: { width: '48%', gap: spacing.sm },
});
