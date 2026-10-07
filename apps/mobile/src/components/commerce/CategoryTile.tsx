import {
  Apple,
  CookingPot,
  Cookie,
  CupSoda,
  Droplets,
  Drumstick,
  Milk,
  ShoppingBag,
  Snowflake,
  SprayCan,
  Wheat,
  type LucideIcon,
} from '@/components/icons';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { radius, spacing, useTheme } from '@/theme';

/** Icon per top-level category slug (matches the generated product artwork). */
const ICONS: Record<string, LucideIcon> = {
  'food-grocery': Wheat,
  'fruits-vegetables': Apple,
  'dairy-bakery': Milk,
  beverages: CupSoda,
  'snacks-packaged-food': Cookie,
  'non-veg': Drumstick,
  frozen: Snowflake,
  'home-care': SprayCan,
  'personal-care-beauty': Droplets,
  'home-kitchen': CookingPot,
  lifestyle: ShoppingBag,
};

export function categoryIcon(slug: string): LucideIcon {
  const key = Object.keys(ICONS).find((k) => slug === k || slug.startsWith(`${k}-`));
  return key ? ICONS[key]! : ShoppingBag;
}

type Props = { name: string; slug: string; onPress: () => void };

export const CategoryTile = memo(function CategoryTile({ name, slug, onPress }: Props) {
  const { colors } = useTheme();
  const Icon = categoryIcon(slug);
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      pressedScale={0.95}
      style={styles.tile}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceTint }]}>
        <Icon size={30} color={colors.primary} strokeWidth={1.75} />
      </View>
      <Text variant="caption" align="center" numberOfLines={2}>
        {name}
      </Text>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  tile: { alignItems: 'center', gap: spacing.xs },
  iconWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
