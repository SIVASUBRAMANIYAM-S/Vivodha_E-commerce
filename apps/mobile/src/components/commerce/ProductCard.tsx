import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronDown } from '@/components/icons';
import { memo, useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useFlyToCart } from '@/components/motion/FlyToCart';
import type { CatalogProduct } from '@/features/catalog/api/catalog';
import { useCartStore, useLineQuantity } from '@/features/cart/store/cart-store';
import { radius, shadow, spacing, useTheme } from '@/theme';
import { discountPercent } from '@/utils/format';

import { AddStepper } from './AddStepper';
import { PriceTag } from './PriceTag';
import { useVariantSelector } from './VariantSelector';

export const RAIL_CARD_WIDTH = 156;

type Props = {
  product: CatalogProduct;
  variant?: 'grid' | 'rail';
};

/**
 * Product card: image, name, variant selector, price (MRP struck, % OFF),
 * Add → stepper. Memoised; only re-renders when its own cart line changes
 * (narrow Zustand selector). First add flies the image into the cart.
 */
export const ProductCard = memo(function ProductCard({ product, variant = 'grid' }: Props) {
  const { colors } = useTheme();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '');
  const selected = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const quantity = useLineQuantity(selected?.id);
  const add = useCartStore((s) => s.add);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const { fly } = useFlyToCart();
  const { open } = useVariantSelector();
  const imageRef = useRef<View>(null);
  const imageUrl = product.images[0] ?? null;

  const onAdd = useCallback(() => {
    if (!selected) return;
    const next = add({
      variantId: selected.id,
      productId: product.id,
      name: product.name,
      variantLabel: selected.label,
      imageUrl,
      pricePaise: selected.pricePaise,
      mrpPaise: selected.mrpPaise,
      maxPerOrder: selected.maxPerOrder,
    });
    if (next === 1) fly(imageRef, imageUrl);
  }, [add, fly, imageUrl, product.id, product.name, selected]);

  if (!selected) return null;
  const off = discountPercent(selected.mrpPaise, selected.pricePaise);
  const multi = product.variants.length > 1;
  const itemLabel = `${product.name} ${selected.label}`;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={product.name}
      accessibilityHint="Opens product details"
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      pressedScale={0.98}
      style={[
        styles.card,
        variant === 'rail' && { width: RAIL_CARD_WIDTH },
        { backgroundColor: colors.surfaceElevated, boxShadow: shadow.sm },
      ]}
    >
      <View
        ref={imageRef}
        collapsable={false}
        style={[styles.imageWrap, { backgroundColor: colors.surfaceTint }]}
      >
        {imageUrl ? (
          <Image
            source={imageUrl}
            recyclingKey={product.id}
            cachePolicy="memory-disk"
            transition={160}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
            accessibilityIgnoresInvertColors
          />
        ) : null}
        {off > 0 ? <Badge tone="discount" label={`${off}% OFF`} style={styles.badge} /> : null}
      </View>

      <View style={styles.body}>
        <Text variant="body" numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            multi ? `Option ${selected.label}. Change option` : `Option ${selected.label}`
          }
          disabled={!multi}
          hitSlop={8}
          onPress={() => open({ product, selectedId: selected.id, onSelect: setVariantId })}
          style={[styles.variant, { borderColor: colors.border }]}
        >
          <Text variant="small" color="textSecondary" numberOfLines={1} style={styles.flexShrink}>
            {selected.label}
          </Text>
          {multi ? <ChevronDown size={14} color={colors.textSecondary} strokeWidth={2} /> : null}
        </Pressable>

        <View style={styles.footer}>
          <View style={styles.flexShrink}>
            <PriceTag pricePaise={selected.pricePaise} mrpPaise={selected.mrpPaise} size="sm" />
          </View>
          <AddStepper
            quantity={quantity}
            max={selected.maxPerOrder}
            itemLabel={itemLabel}
            onAdd={onAdd}
            onIncrement={onAdd}
            onDecrement={() => setQuantity(selected.id, quantity - 1)}
          />
        </View>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.card, padding: spacing.sm, gap: spacing.sm },
  imageWrap: { aspectRatio: 1, borderRadius: radius.image, overflow: 'hidden' },
  badge: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  body: { gap: spacing.xs, flex: 1 },
  name: { minHeight: 40 },
  variant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.badge,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: 'auto',
  },
  flexShrink: { flexShrink: 1 },
});
