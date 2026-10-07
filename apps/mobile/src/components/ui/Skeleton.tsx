import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { radius as radii, useMotionPreference, useTheme } from '@/theme';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

const SHIMMER_MS = 1200;

/**
 * Loading placeholder with a shimmer band (UI thread). Size it like the real
 * content so nothing jumps when data arrives. Reduced motion: static block.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = radii.badge,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const { reduceMotion } = useMotionPreference();
  const [w, setW] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || w === 0) return;
    progress.value = withRepeat(
      withTiming(1, { duration: SHIMMER_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [progress, reduceMotion, w]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -w + progress.value * w * 2 }],
  }));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.skeleton },
        styles.clip,
        style,
      ]}
    >
      {!reduceMotion && w > 0 ? (
        <Animated.View style={[StyleSheet.absoluteFill, bandStyle]}>
          <LinearGradient
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            colors={['transparent', colors.skeletonHighlight, 'transparent']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ clip: { overflow: 'hidden' } });
