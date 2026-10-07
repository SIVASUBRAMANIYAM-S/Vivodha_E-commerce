import { Minus, Plus } from '@/components/icons';
import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { RollingNumber } from '@/components/ui/RollingNumber';
import { Text } from '@/components/ui/Text';
import { haptic } from '@/lib/haptics';
import { radius, springTo, useTheme } from '@/theme';

type Size = 'sm' | 'lg';

type Props = {
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  max?: number;
  size?: Size;
  disabled?: boolean;
  /** Used in labels, e.g. "Toned Milk 500 ml". */
  itemLabel?: string;
};

const DIMS = {
  sm: { addW: 76, stepW: 104, h: 36, icon: 16 },
  lg: { addW: 132, stepW: 156, h: 48, icon: 20 },
} as const;

/**
 * Signature interaction 1: "Add" springs into a −/+ stepper (width + colour
 * morph on the UI thread) and the quantity digits roll vertically. Light
 * haptic on every tap; error haptic when the per-order max blocks an increment.
 */
export const AddStepper = memo(function AddStepper({
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  max = 10,
  size = 'sm',
  disabled = false,
  itemLabel = 'item',
}: Props) {
  const { colors } = useTheme();
  const d = DIMS[size];
  const active = quantity > 0;
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = springTo(active ? 1 : 0, 'snappy');
  }, [active, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [d.addW, d.stepW]),
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface, colors.primary]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.primary, colors.primary]),
  }));
  const addStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.8]) }],
  }));
  const stepperStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.8, 1]) }],
  }));

  if (disabled) {
    return (
      <View
        accessible
        accessibilityLabel={`${itemLabel} is out of stock`}
        style={[styles.base, { width: d.addW, height: d.h, borderColor: colors.border }]}
      >
        <Text variant="small" color="textSecondary">
          Sold out
        </Text>
      </View>
    );
  }

  const atMax = quantity >= max;

  return (
    <Animated.View style={[styles.base, { height: d.h }, containerStyle]}>
      {/* Add (visible at quantity 0) */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.center, addStyle]}
        pointerEvents={active ? 'none' : 'auto'}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${itemLabel} to cart`}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          onPress={() => {
            haptic('add');
            onAdd();
          }}
          style={[StyleSheet.absoluteFill, styles.center]}
        >
          <Text variant="label" color="primary">
            Add
          </Text>
        </Pressable>
      </Animated.View>

      {/* Stepper (visible at quantity >= 1) */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.stepper, stepperStyle]}
        pointerEvents={active ? 'auto' : 'none'}
        accessibilityElementsHidden={!active}
        importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={quantity === 1 ? `Remove ${itemLabel}` : `Decrease ${itemLabel}`}
          hitSlop={8}
          onPress={() => {
            haptic('decrement');
            onDecrement();
          }}
          style={[styles.step, { height: d.h }]}
        >
          <Minus size={d.icon} color={colors.textOnPrimary} strokeWidth={2.5} />
        </Pressable>
        <View
          accessible
          accessibilityRole="text"
          accessibilityLabel={`Quantity ${quantity}`}
          accessibilityLiveRegion="polite"
        >
          <RollingNumber value={quantity} variant="counter" color="textOnPrimary" />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${itemLabel}`}
          accessibilityState={{ disabled: atMax }}
          accessibilityHint={atMax ? `Maximum ${max} per order` : undefined}
          hitSlop={8}
          onPress={() => {
            if (atMax) {
              haptic('error');
              return;
            }
            haptic('increment');
            onIncrement();
          }}
          style={[styles.step, { height: d.h, opacity: atMax ? 0.5 : 1 }]}
        >
          <Plus size={d.icon} color={colors.textOnPrimary} strokeWidth={2.5} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { width: 36, alignItems: 'center', justifyContent: 'center' },
});
