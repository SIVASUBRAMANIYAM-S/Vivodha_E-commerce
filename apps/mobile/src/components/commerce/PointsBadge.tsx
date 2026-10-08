import { LinearGradient } from 'expo-linear-gradient';
import { Coins } from '@/components/icons';
import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { RollingNumber } from '@/components/ui/RollingNumber';
import { Text } from '@/components/ui/Text';
import { radius, spacing, useMotionPreference, useTheme } from '@/theme';

/**
 * Vivo Points balance (points purple: loyalty only). Signature interaction 12:
 * a one-time sheen sweeps across when the balance changes (not on first
 * render). Reduced motion: no sheen; digits still update.
 */
export const PointsBadge = memo(function PointsBadge({ points }: { points: number }) {
  const { colors } = useTheme();
  const { reduceMotion } = useMotionPreference();
  const prev = useRef(points);
  const sheen = useSharedValue(0);
  const [w, setW] = useState(0);

  useEffect(() => {
    if (prev.current !== points && !reduceMotion && w > 0) {
      sheen.value = 0;
      sheen.value = withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) });
    }
    prev.current = points;
  }, [points, reduceMotion, sheen, w]);

  const sheenStyle = useAnimatedStyle(() => ({
    opacity: sheen.value > 0 && sheen.value < 1 ? 1 : 0,
    transform: [{ translateX: -w + sheen.value * w * 2 }],
  }));

  return (
    <View
      accessible
      accessibilityLabel={`${points} Vivo Points`}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[styles.badge, { backgroundColor: colors.pointsSoft }]}
    >
      <Coins size={16} color={colors.points} strokeWidth={2} />
      <RollingNumber value={points} color="points" />
      <Text variant="small" color="points">
        Vivo Points
      </Text>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, sheenStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.75)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
