import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';

import { Text } from './Text';

/**
 * Colour rules (docs/design-language.md §2):
 * - discount: offer red, discounts only (accessible offerStrong fill, white text 5.52:1)
 * - points: loyalty only
 * - accent: saffron fill with INK text (white on saffron fails at 2.05:1)
 */
type Tone = 'discount' | 'points' | 'accent' | 'primary' | 'neutral';

export type BadgeProps = {
  label: string;
  tone?: Tone;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Badge({
  label,
  tone = 'neutral',
  icon: Icon,
  style,
  accessibilityLabel,
}: BadgeProps) {
  const { colors } = useTheme();
  const palette = {
    discount: { bg: colors.discount, fg: colors.textOnPrimary },
    points: { bg: colors.points, fg: colors.textOnPrimary },
    accent: { bg: colors.warning, fg: colors.textOnAccent },
    primary: { bg: colors.primary, fg: colors.textOnPrimary },
    neutral: { bg: colors.surfaceTint, fg: colors.primary },
  }[tone];

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.base, { backgroundColor: palette.bg }, style]}
    >
      {Icon ? <Icon size={12} color={palette.fg} strokeWidth={2.5} /> : null}
      <Text variant="caption" style={{ color: palette.fg }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.badge,
  },
});
