import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/theme';
import { discountPercent, formatINR } from '@/utils/format';

import { AddStepper } from './AddStepper';

export type ProductCardVariant = {
  id: string;
  /** Generic option label from the product's attribute set, e.g. "500 g" or "M / Blue". */
  label: string;
  mrpPaise: number;
  pricePaise: number;
};

type Props = {
  name: string;
  imageUrl?: string;
  variants: ProductCardVariant[];
};

/**
 * Stub product card: image, name, variant selector, MRP struck through, price, Add/stepper.
 * Variant dropdown and cart wiring land in Phases 3 and 6.
 */
export function ProductCard({ name, imageUrl, variants }: Props) {
  const [quantity, setQuantity] = useState(0);
  const variant = variants[0];
  if (!variant) return null;

  const off = discountPercent(variant.mrpPaise, variant.pricePaise);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {imageUrl ? <Image source={imageUrl} style={styles.image} contentFit="contain" /> : null}
        {off > 0 ? (
          <View style={styles.offBadge}>
            <Text variant="caption" color="textOnPrimary">
              {off}% OFF
            </Text>
          </View>
        ) : null}
      </View>
      <Text variant="body" numberOfLines={2}>
        {name}
      </Text>
      <View style={styles.variant}>
        <Text variant="small" color="textSecondary">
          {variant.label}
        </Text>
      </View>
      <View style={styles.footer}>
        <View>
          <Text variant="price">{formatINR(variant.pricePaise)}</Text>
          {off > 0 ? (
            <Text variant="small" color="textSecondary" style={styles.mrp}>
              {formatINR(variant.mrpPaise)}
            </Text>
          ) : null}
        </View>
        <AddStepper quantity={quantity} onChange={setQuantity} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  imageWrap: {
    aspectRatio: 1,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  image: { flex: 1 },
  offBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.offer,
  },
  variant: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mrp: { textDecorationLine: 'line-through' },
});
