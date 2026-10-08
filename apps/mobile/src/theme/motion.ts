import {
  Easing,
  ReduceMotion,
  useReducedMotion,
  withSpring,
  withTiming,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

import {
  duration,
  easing as easingTokens,
  spring as springTokens,
  type DurationToken,
  type EasingToken,
  type SpringToken,
} from '@vivodha/shared/tokens';

/** Reanimated easing functions built from the shared bezier tokens. */
export const easings = {
  standard: Easing.bezier(...easingTokens.standard),
  decelerate: Easing.bezier(...easingTokens.decelerate),
  accelerate: Easing.bezier(...easingTokens.accelerate),
} as const;

/**
 * Spring config from a token. ReduceMotion.System makes Reanimated itself
 * collapse the spring to an instant change when the OS asks for reduced motion.
 */
export function springConfig(token: SpringToken): WithSpringConfig {
  return { ...springTokens[token], reduceMotion: ReduceMotion.System };
}

export function timingConfig(
  token: DurationToken,
  ease: EasingToken = 'standard',
): WithTimingConfig {
  return { duration: duration[token], easing: easings[ease], reduceMotion: ReduceMotion.System };
}

/** Worklet-safe helpers for animating shared values with tokens. */
export function springTo(value: number, token: SpringToken = 'snappy') {
  'worklet';
  return withSpring(value, { ...springTokens[token], reduceMotion: ReduceMotion.System });
}

export function timeTo(value: number, token: DurationToken = 'base') {
  'worklet';
  return withTiming(value, {
    duration: duration[token],
    easing: Easing.bezier(...easingTokens.standard),
    reduceMotion: ReduceMotion.System,
  });
}

/**
 * Components call this to decide between movement and a fade
 * (docs/design-language.md §5: reduced motion swaps movement for fades).
 */
export function useMotionPreference(): { reduceMotion: boolean } {
  return { reduceMotion: useReducedMotion() };
}
