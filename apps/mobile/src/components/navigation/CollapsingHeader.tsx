import { BlurView } from 'expo-blur';
import { MapPin } from '@/components/icons';
import { useState, type RefObject } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { LogoMark } from '@/components/brand/LogoMark';
import { SearchBar } from '@/components/ui/SearchBar';
import { Text } from '@/components/ui/Text';
import { spacing, useTheme } from '@/theme';

export const LOGO_ROW = 56;
export const SEARCH_ROW = 64;

export function headerHeight(topInset: number): number {
  return topInset + LOGO_ROW + SEARCH_ROW;
}

type Props = {
  scrollY: SharedValue<number>;
  deliveryLabel: string;
  onSearchPress: () => void;
  /** Android: the BlurTargetView wrapping the scroll content (what gets blurred). */
  blurTarget?: RefObject<View | null>;
};

/**
 * Signature interaction 5: the logo row shrinks and fades as you scroll while
 * the search bar pins to the top. The blur appears only after scrolling (and
 * is only mounted then, so it costs nothing at rest). All motion is driven by
 * the scroll shared value on the UI thread.
 */
export function CollapsingHeader({ scrollY, deliveryLabel, onSearchPress, blurTarget }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [blurOn, setBlurOn] = useState(false);

  useAnimatedReaction(
    () => scrollY.value > LOGO_ROW - 8,
    (on, prev) => {
      if (on !== prev) scheduleOnRN(setBlurOn, on);
    },
  );

  const collapse = (y: number) => {
    'worklet';
    return interpolate(y, [0, LOGO_ROW], [0, LOGO_ROW], Extrapolation.CLAMP);
  };

  const bgStyle = useAnimatedStyle(() => ({
    height: insets.top + LOGO_ROW + SEARCH_ROW - collapse(scrollY.value),
  }));
  const chromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [LOGO_ROW - 12, LOGO_ROW + 16],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const clipStyle = useAnimatedStyle(() => ({
    height: LOGO_ROW + SEARCH_ROW - collapse(scrollY.value),
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -collapse(scrollY.value) }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, LOGO_ROW * 0.7], [1, 0], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(scrollY.value, [0, LOGO_ROW], [1, 0.92], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {/* Background: solid at rest; frosted blur + hairline fade in after scrolling. */}
      <Animated.View style={[styles.bg, { backgroundColor: colors.surface }, bgStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, chromeStyle]}>
          {blurOn ? (
            <BlurView
              tint="light"
              intensity={60}
              blurMethod="dimezisBlurViewSdk31Plus"
              blurTarget={Platform.OS === 'android' ? blurTarget : undefined}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View style={[styles.hairline, { backgroundColor: colors.border }]} />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.clip, { top: insets.top }, clipStyle]} pointerEvents="box-none">
        <Animated.View style={contentStyle} pointerEvents="box-none">
          <Animated.View style={[styles.logoRow, logoStyle]}>
            <LogoMark size={32} />
            <View style={styles.brandText}>
              <Text variant="h2" color="primary" style={styles.wordmark}>
                vivodha
              </Text>
              <View style={styles.delivery} accessible accessibilityLabel={deliveryLabel}>
                <MapPin size={12} color={colors.textSecondary} strokeWidth={2} />
                <Text variant="small" color="textSecondary" numberOfLines={1}>
                  {deliveryLabel}
                </Text>
              </View>
            </View>
          </Animated.View>
          <View style={styles.searchRow}>
            <SearchBar onPress={onSearchPress} />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
  clip: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  logoRow: {
    height: LOGO_ROW,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  brandText: { flex: 1 },
  wordmark: { lineHeight: 22, letterSpacing: -0.3 },
  delivery: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  searchRow: { height: SEARCH_ROW, paddingHorizontal: spacing.lg, justifyContent: 'center' },
});
