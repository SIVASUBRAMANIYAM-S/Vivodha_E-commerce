import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { springTo } from '@/theme';

import type { HapticEvent } from '@vivodha/shared/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed (instant tactile feedback). */
  pressedScale?: number;
  /** Haptic fired on press-in, so feedback is instant. false = none. */
  hapticEvent?: HapticEvent | false;
};

/**
 * Shared press feedback: a snappy spring scale on the UI thread plus an
 * optional haptic on press-in. Reduced motion: Reanimated's ReduceMotion.System
 * makes the scale change instant, so no movement plays.
 */
export function PressableScale({
  children,
  style,
  pressedScale = 0.97,
  hapticEvent = false,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        scale.set(springTo(pressedScale, 'snappy'));
        if (hapticEvent) haptic(hapticEvent);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(springTo(1, 'snappy'));
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
