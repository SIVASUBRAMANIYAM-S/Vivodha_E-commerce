import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { brand, duration, useMotionPreference } from '@/theme';

const PARTICLES = 12;
const COLORS = [brand.primary, brand.saffron, brand.tint, brand.primaryDeep];

type Props = {
  /** Change this value to fire the burst once. 0 = idle. */
  trigger: number;
  size?: number;
};

/**
 * Short celebratory burst (free delivery reached). 12 particles fly outward
 * and fade on the UI thread, ~600ms total, then nothing remains on screen.
 * Reduced motion: a single soft ring fade instead of moving particles.
 */
export function Celebration({ trigger, size = 120 }: Props) {
  const { reduceMotion } = useMotionPreference();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: duration.slow + 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, trigger]);

  if (trigger === 0) return null;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.host,
        { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 },
      ]}
    >
      {reduceMotion ? (
        <Ring progress={progress} size={size} />
      ) : (
        Array.from({ length: PARTICLES }, (_, i) => (
          <Particle key={i} index={i} progress={progress} radius={size / 2} />
        ))
      )}
    </View>
  );
}

function Particle({
  index,
  progress,
  radius,
}: {
  index: number;
  progress: SharedValue<number>;
  radius: number;
}) {
  const angle = (index / PARTICLES) * Math.PI * 2;
  const dist = radius * (0.7 + (index % 3) * 0.15);
  const dot = 6 + (index % 3) * 2;
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p === 0 ? 0 : 1 - p,
      transform: [
        { translateX: Math.cos(angle) * dist * p },
        { translateY: Math.sin(angle) * dist * p },
        { scale: 1 - p * 0.4 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: COLORS[index % COLORS.length],
        },
        style,
      ]}
    />
  );
}

function Ring({ progress, size }: { progress: SharedValue<number>; size: number }) {
  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : 0.5 * (1 - progress.value),
  }));
  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: brand.primary,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: { position: 'absolute' },
});
