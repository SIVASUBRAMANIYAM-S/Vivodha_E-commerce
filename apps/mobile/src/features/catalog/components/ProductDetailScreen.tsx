import { Image } from 'expo-image';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { ChevronLeft } from '@/components/icons';
import { AddStepper } from '@/components/commerce/AddStepper';
import { PriceTag } from '@/components/commerce/PriceTag';
import { ProductRail } from '@/components/commerce/ProductRail';
import { useVariantSelector } from '@/components/commerce/VariantSelector';
import { useFlyToCart } from '@/components/motion/FlyToCart';
import { EmptyState, ErrorState, OfflineBanner, useIsOffline } from '@/components/ui/States';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { similarProducts, useCatalog, type CatalogVariant } from '@/features/catalog/api/catalog';
import { useCartStore, useLineQuantity } from '@/features/cart/store/cart-store';
import { haptic } from '@/lib/haptics';
import { duration, radius, spacing, touch, useTheme } from '@/theme';
import { formatINR } from '@/utils/format';
import { useRecentlyViewedStore } from '@/store/session-store';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return <ProductDetailContent key={id ?? 'missing'} id={id} />;
}

function ProductDetailContent({ id }: { id?: string }) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const catalog = useCatalog();
  const offline = useIsOffline();
  const product = id ? catalog.data?.productsById.get(id) : undefined;
  const category = product
    ? catalog.data?.categories.find((item) => item.id === product.categoryId)
    : undefined;
  const pushRecentlyViewed = useRecentlyViewedStore((s) => s.push);
  const [variantId, setVariantId] = useState('');
  const imageRef = useRef<View>(null);
  const galleryRef = useRef<FlatList<string>>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const { open } = useVariantSelector();
  const { fly } = useFlyToCart();
  const add = useCartStore((s) => s.add);
  useEffect(() => {
    if (!id || !product) return;
    pushRecentlyViewed(id);
    galleryRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [id, product, pushRecentlyViewed]);

  const selected =
    product?.variants.find((variant) => variant.id === variantId) ?? product?.variants[0];
  const quantity = useLineQuantity(selected?.id);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const related = useMemo(
    () => (product && catalog.data ? similarProducts(catalog.data, product, 10) : []),
    [catalog.data, product],
  );
  const imageWidth = Math.min(windowWidth - spacing.lg * 2, 520);
  const imageHeight = Math.min(imageWidth, 380);

  const onGalleryScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / imageWidth);
      setImageIndex((current) => (current === index ? current : index));
    },
    [imageWidth],
  );

  const onAdd = useCallback(() => {
    if (!product || !selected) return;
    const next = add({
      variantId: selected.id,
      productId: product.id,
      name: product.name,
      variantLabel: selected.label,
      imageUrl: product.images[0] ?? null,
      pricePaise: selected.pricePaise,
      mrpPaise: selected.mrpPaise,
      maxPerOrder: selected.maxPerOrder,
    });
    if (next === 1) fly(imageRef, product.images[0] ?? null);
  }, [add, fly, product, selected]);

  const onRefresh = useCallback(() => {
    void catalog.refetch();
  }, [catalog]);

  if (catalog.isPending) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.surface }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader onBack={() => router.back()} />
        <ProductSkeleton />
      </SafeAreaView>
    );
  }

  if (catalog.isError && !catalog.data) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.surface }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader onBack={() => router.back()} />
        <ErrorState
          title="Couldn't load this product"
          message="Check your connection and try again."
          onRetry={onRefresh}
        />
        <OfflineBanner />
      </SafeAreaView>
    );
  }

  if (!product || !selected) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.surface }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader onBack={() => router.back()} />
        <EmptyState
          title="Product not found"
          message="This item may no longer be available in the catalog."
          actionLabel="Back to shopping"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader onBack={() => router.back()} />
      {offline ? <OfflineBanner /> : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View
          ref={imageRef}
          collapsable={false}
          entering={ZoomIn.duration(duration.fast)}
          style={[
            styles.galleryFrame,
            {
              width: imageWidth,
              height: imageHeight,
              backgroundColor: colors.surfaceTint,
            },
          ]}
        >
          <FlatList
            ref={galleryRef}
            data={product.images.length ? product.images : ['']}
            horizontal
            pagingEnabled
            keyExtractor={(image, index) => image || `placeholder-${index}`}
            renderItem={({ item }) => (
              <View style={{ width: imageWidth, height: imageHeight }}>
                {item ? (
                  <Image
                    source={item}
                    recyclingKey={`${product.id}-${item}`}
                    cachePolicy="memory-disk"
                    transition={160}
                    contentFit="contain"
                    style={StyleSheet.absoluteFill}
                    accessibilityLabel={product.name}
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text variant="small" color="textSecondary">
                      Image coming soon
                    </Text>
                  </View>
                )}
              </View>
            )}
            onMomentumScrollEnd={onGalleryScroll}
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, index) => ({
              length: imageWidth,
              offset: imageWidth * index,
              index,
            })}
          />
          {product.images.length > 1 ? (
            <View style={[styles.imageCounter, { backgroundColor: colors.overlay }]}>
              <Text variant="caption" style={{ color: colors.textOnPrimary }}>
                {imageIndex + 1} / {product.images.length}
              </Text>
            </View>
          ) : null}
        </Animated.View>

        <View style={styles.productInfo}>
          {category ? (
            <Text variant="small" color="textSecondary">
              {category.name}
            </Text>
          ) : null}
          {product.brandName ? (
            <Text variant="small" color="textSecondary">
              {product.brandName}
            </Text>
          ) : null}
          <Text variant="h1" accessibilityRole="header">
            {product.name}
          </Text>

          {product.variants.length > 1 ? (
            <View style={styles.variantSection}>
              <View style={styles.sectionTitle}>
                <Text variant="bodyStrong">Choose an option</Text>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel="See all product options"
                  onPress={() => open({ product, selectedId: selected.id, onSelect: setVariantId })}
                  hapticEvent="select"
                >
                  <Text variant="small" color="primary">
                    See options
                  </Text>
                </PressableScale>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.variants}
              >
                {product.variants.map((variant) => (
                  <VariantPill
                    key={variant.id}
                    variant={variant}
                    selected={variant.id === selected.id}
                    onPress={() => {
                      haptic('select');
                      setVariantId(variant.id);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          ) : (
            <Text variant="body" color="textSecondary">
              {selected.label}
            </Text>
          )}

          <View style={styles.purchaseRow}>
            <PriceTag
              pricePaise={selected.pricePaise}
              mrpPaise={selected.mrpPaise}
              memberPricePaise={selected.memberPricePaise}
              size="lg"
            />
            <AddStepper
              size="lg"
              quantity={quantity}
              max={selected.maxPerOrder}
              itemLabel={`${product.name} ${selected.label}`}
              onAdd={onAdd}
              onIncrement={onAdd}
              onDecrement={() => setQuantity(selected.id, quantity - 1)}
            />
          </View>

          {product.description ? (
            <View style={[styles.description, { borderTopColor: colors.border }]}>
              <Text variant="h3">About this product</Text>
              <Text variant="body" color="textSecondary">
                {product.description}
              </Text>
            </View>
          ) : null}
        </View>

        <ProductRail
          railKey={`similar-${product.id}`}
          title="Similar products"
          products={related}
          loading={false}
          emptyMessage="More picks will appear here soon."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ScreenHeader({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        hapticEvent={false}
        style={styles.backButton}
      >
        <ChevronLeft size={24} color={colors.textPrimary} />
      </PressableScale>
      <Text variant="bodyStrong" color="textSecondary">
        Product details
      </Text>
      <View style={styles.backButton} />
    </View>
  );
}

function VariantPill({
  variant,
  selected,
  onPress,
}: {
  variant: CatalogVariant;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${variant.label}, ${formatINR(variant.pricePaise)}`}
      onPress={onPress}
      hapticEvent={false}
      style={[
        styles.variantPill,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.surfaceTint : colors.surface,
        },
      ]}
    >
      <Text variant="small" style={{ color: selected ? colors.primary : colors.textPrimary }}>
        {variant.label}
      </Text>
      <Text variant="priceSmall">{formatINR(variant.pricePaise)}</Text>
    </PressableScale>
  );
}

function ProductSkeleton() {
  return (
    <ScrollView contentContainerStyle={styles.skeletonContent}>
      <Skeleton width="100%" height={320} radius={radius.card} />
      <Skeleton width="32%" height={14} />
      <Skeleton width="75%" height={28} />
      <Skeleton width="55%" height={20} />
      <Skeleton width="100%" height={52} radius={radius.button} />
      <Skeleton width="100%" height={64} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  content: { paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xl },
  galleryFrame: {
    maxWidth: '100%',
    alignSelf: 'center',
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageCounter: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  productInfo: { paddingHorizontal: spacing.lg, gap: spacing.md },
  variantSection: { gap: spacing.sm },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  variants: { gap: spacing.sm, paddingRight: spacing.lg },
  variantPill: {
    minHeight: touch.min,
    minWidth: 92,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.button,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  purchaseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  description: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  skeletonContent: { padding: spacing.lg, gap: spacing.lg },
});
