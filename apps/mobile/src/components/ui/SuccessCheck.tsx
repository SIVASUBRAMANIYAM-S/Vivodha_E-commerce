import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { duration, useMotionPreference, useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const SIZE = 96;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;
/** Approximate length of the check path below. */
const CHECK_LENGTH = 48;

type Props = { size?: number; replayKey?: number };

/**
 * Animated success mark: the ring draws, then the check strokes in (SVG
 * strokeDashoffset on the UI thread). Used later for order confirmation.
 * Reduced motion: both appear fully drawn after a short fade.
 */
export function SuccessCheck({ size = SIZE, replayKey = 0 }: Props) {
  const { colors } = useTheme();
  const { reduceMotion } = useMotionPreference();
  const ring = useSharedValue(reduceMotion ? 1 : 0);
  const check = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      ring.value = 1;
      check.value = 1;
      return;
    }
    ring.value = 0;
    check.value = 0;
    ring.value = withTiming(1, { duration: duration.slow, easing: Easing.out(Easing.cubic) });
    check.value = withDelay(
      duration.slow - 80,
      withTiming(1, { duration: duration.base, easing: Easing.out(Easing.cubic) }),
    );
  }, [check, reduceMotion, replayKey, ring]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - ring.value),
  }));
  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - check.value),
  }));

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      accessibilityRole="image"
      accessibilityLabel="Success"
    >
      <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill={colors.surfaceTint} />
      <AnimatedCircle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        stroke={colors.primary}
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        animatedProps={ringProps}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
      />
      <AnimatedPath
        d="M30 50 L43 62 L67 36"
        stroke={colors.primary}
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={CHECK_LENGTH}
        animatedProps={checkProps}
      />
    </Svg>
  );
}
