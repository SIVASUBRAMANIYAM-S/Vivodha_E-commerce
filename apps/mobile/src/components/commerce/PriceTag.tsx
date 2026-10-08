import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/theme';
import { discountPercent, formatINR } from '@/utils/format';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  pricePaise: number;
  mrpPaise: number;
  size?: Size;
  /** Show the "% OFF" badge (discount colour: discounts only). */
  showBadge?: boolean;
  /** Vivo price for registered members (null for anon/guest). */
  memberPricePaise?: number | null;
};

const VARIANT = { sm: 'priceSmall', md: 'price', lg: 'priceLarge' } as const;

/** Selling price, struck-through MRP and discount badge, read as one phrase. */
export const PriceTag = memo(function PriceTag({
  pricePaise,
  mrpPaise,
  size = 'md',
  showBadge = true,
  memberPricePaise,
}: Props) {
  const off = discountPercent(mrpPaise, pricePaise);
  const label = [
    `Price ${formatINR(pricePaise)}`,
    off > 0 ? `MRP ${formatINR(mrpPaise)}, ${off}% off` : null,
    memberPricePaise ? `Vivo price ${formatINR(memberPricePaise)}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View accessible accessibilityLabel={label} style={styles.wrap}>
      <View style={styles.row}>
        <Text variant={VARIANT[size]}>{formatINR(pricePaise)}</Text>
        {off > 0 ? (
          <Text variant="mrp" color="textSecondary" strike>
            {formatINR(mrpPaise)}
          </Text>
        ) : null}
        {off > 0 && showBadge && size !== 'sm' ? (
          <Badge tone="discount" label={`${off}% OFF`} />
        ) : null}
      </View>
      {memberPricePaise ? (
        <Text variant="small" color="points">
          Vivo price {formatINR(memberPricePaise)}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: spacing.xxs },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: spacing.xs },
});
