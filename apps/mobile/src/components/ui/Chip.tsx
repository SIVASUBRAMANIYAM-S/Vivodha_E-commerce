import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { radius, spacing, timeTo, touch, useTheme } from '@/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
};

/** Filter/selection chip: selected state cross-fades colour; selection haptic. */
export function Chip({ label, selected = false, onPress, icon: Icon, disabled }: ChipProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = timeTo(selected ? 1 : 0, 'fast');
  }, [progress, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface, colors.surfaceTint]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.primary]),
  }));

  const fg = selected ? colors.primary : colors.textPrimary;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hapticEvent={disabled ? false : 'select'}
      hitSlop={{ top: 6, bottom: 6 }}
    >
      <Animated.View style={[styles.base, animatedStyle, disabled && styles.disabled]}>
        {Icon ? <Icon size={16} color={fg} strokeWidth={2} /> : null}
        <Text variant="label" style={{ color: fg }}>
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: touch.min - 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.chip,
    borderWidth: 1.5,
  },
  disabled: { opacity: 0.45 },
});
