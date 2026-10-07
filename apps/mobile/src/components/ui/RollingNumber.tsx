import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { fontFor, springTo, typeScale, useTheme, type ThemeColorToken } from '@/theme';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

type Props = {
  value: number;
  variant?: 'counter' | 'price' | 'priceSmall';
  color?: ThemeColorToken;
  /** Fixed cell width per digit (dp) so the number never jitters. */
  digitWidth?: number;
};

/**
 * Integer whose digits roll vertically when they change (stepper quantity,
 * badge counts). Each digit is a fixed-width cell. Reduced motion: the spring
 * collapses to an instant change (ReduceMotion.System).
 */
export const RollingNumber = memo(function RollingNumber({
  value,
  variant = 'counter',
  color = 'textPrimary',
  digitWidth,
}: Props) {
  const t = typeScale[variant];
  const width = digitWidth ?? Math.round(t.size * 0.66);
  const digits = String(Math.max(0, Math.floor(value))).split('');
  return (
    <View
      accessible
      accessibilityLabel={String(value)}
      style={[styles.row, { height: t.lineHeight }]}
    >
      {digits.map((d, i) => (
        // Key from the right so units stay the same cell when the length changes.
        <Digit
          key={digits.length - i}
          digit={Number(d)}
          height={t.lineHeight}
          width={width}
          variant={variant}
          color={color}
        />
      ))}
    </View>
  );
});

function Digit({
  digit,
  height,
  width,
  variant,
  color,
}: {
  digit: number;
  height: number;
  width: number;
  variant: 'counter' | 'price' | 'priceSmall';
  color: ThemeColorToken;
}) {
  const { colors } = useTheme();
  const t = typeScale[variant];
  const y = useSharedValue(-digit * height);

  useEffect(() => {
    y.value = springTo(-digit * height, 'snappy');
  }, [digit, height, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <View
      style={{ width, height, overflow: 'hidden' }}
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={style}>
        {DIGITS.map((d) => (
          <Animated.Text
            key={d}
            allowFontScaling={false}
            style={{
              height,
              lineHeight: height,
              width,
              textAlign: 'center',
              fontFamily: fontFor(t.family, t.weight),
              fontSize: t.size,
              color: colors[color],
              fontVariant: ['tabular-nums'],
            }}
          >
            {d}
          </Animated.Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row' } });
