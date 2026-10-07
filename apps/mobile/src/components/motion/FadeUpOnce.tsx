import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, ReduceMotion } from 'react-native-reanimated';

import { duration, stagger, useMotionPreference } from '@/theme';

/** List keys whose first-load entrance has already played (per app session). */
const played = new Set<string>();

/**
 * Marks a list's entrance as played shortly after its first data render, so
 * later re-renders, refetches and FlashList cell mounts never re-animate.
 */
export function useFirstLoadEntrance(listKey: string, ready: boolean) {
  useEffect(() => {
    if (!ready || played.has(listKey)) return;
    const t = setTimeout(
      () => played.add(listKey),
      stagger.interval * stagger.maxItems + duration.base,
    );
    return () => clearTimeout(t);
  }, [listKey, ready]);
}

type Props = {
  listKey: string;
  index: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Staggered fade-up entrance (signature interaction 9): first load only, first
 * `stagger.maxItems` items only. Reduced motion: a plain fade, no movement.
 */
export function FadeUpOnce({ listKey, index, children, style }: Props) {
  const { reduceMotion } = useMotionPreference();
  const animate = !played.has(listKey) && index < stagger.maxItems;
  if (!animate) return <Animated.View style={style}>{children}</Animated.View>;

  const delay = index * stagger.interval;
  const entering = reduceMotion
    ? FadeIn.duration(duration.fast).delay(delay).reduceMotion(ReduceMotion.Never)
    : FadeInDown.duration(duration.base)
        .delay(delay)
        .withInitialValues({ transform: [{ translateY: 14 }] });

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
