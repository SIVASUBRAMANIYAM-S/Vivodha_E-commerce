import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { LEAF_LEFT, LEAF_RIGHT } from '@/components/brand/LogoMark';
import { brand, timeTo, useMotionPreference } from '@/theme';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  refreshing: boolean;
  /** 0..1 pull progress (iOS overscroll). Android lists don't overscroll, so this stays 0 there. */
  pull?: SharedValue<number>;
  size?: number;
};

/**
 * Signature interaction 10: the two-leaf mark. While pulling (iOS) it grows
 * with the pull; while refreshing the leaves sway and the saffron seed bobs.
 * The loop runs only while a refresh is in flight (it communicates "loading").
 * Reduced motion: a static mark that fades in/out.
 */
export function LeafRefresh({ refreshing, pull, size = 36 }: Props) {
  const { reduceMotion } = useMotionPreference();
  const sway = useSharedValue(0);
  const shown = useSharedValue(refreshing ? 1 : 0);

  useEffect(() => {
    shown.value = timeTo(refreshing ? 1 : 0, 'fast');
    if (refreshing && !reduceMotion) {
      sway.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 420, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(sway);
      sway.value = timeTo(0, 'fast');
    }
  }, [reduceMotion, refreshing, shown, sway]);

  const wrapStyle = useAnimatedStyle(() => {
    const p = Math.max(shown.value, pull?.value ?? 0);
    return {
      opacity: p,
      transform: [{ scale: reduceMotion ? 1 : interpolate(p, [0, 1], [0.6, 1]) }],
    };
  });

  // react-native-svg rotates a group via rotation + originX/originY (the leaves' shared base).
  const leftProps = useAnimatedProps(() => ({
    rotation: -sway.value * 10,
    originX: 50,
    originY: 78,
  }));
  const rightProps = useAnimatedProps(() => ({
    rotation: sway.value * 10,
    originX: 50,
    originY: 78,
  }));
  const seedProps = useAnimatedProps(() => ({ cy: 12 - Math.abs(sway.value) * 6 }));

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden={!refreshing}
      accessibilityLabel={refreshing ? 'Refreshing' : undefined}
      style={[styles.wrap, wrapStyle]}
    >
      <View style={[styles.disc, { width: size + 12, height: size + 12 }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <AnimatedG animatedProps={leftProps}>
            <Path d={LEAF_LEFT} fill={brand.primary} />
          </AnimatedG>
          <AnimatedG animatedProps={rightProps}>
            <Path d={LEAF_RIGHT} fill={brand.primary} fillOpacity={0.75} />
          </AnimatedG>
          <AnimatedCircle cx={50} r={7} fill={brand.saffron} animatedProps={seedProps} />
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  disc: {
    borderRadius: 999,
    backgroundColor: brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
