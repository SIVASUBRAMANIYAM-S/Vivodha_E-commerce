import { memo, useEffect } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

import {
  easings,
  fontFor,
  maxFontSizeMultiplier,
  typeScale,
  useTheme,
  type ThemeColorToken,
} from '@/theme';
import { formatINR } from '@/utils/format';

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/** INR with Indian digit grouping, runnable on the UI thread (no Intl in worklets). */
export function formatINRWorklet(paise: number): string {
  'worklet';
  const rounded = Math.round(paise);
  const rupees = Math.floor(rounded / 100);
  const fraction = rounded % 100;
  const s = String(rupees);
  let grouped = s;
  if (s.length > 3) {
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    const parts: string[] = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest.length) parts.unshift(rest);
    grouped = `${parts.join(',')},${last3}`;
  }
  return fraction === 0 ? `₹${grouped}` : `₹${grouped}.${fraction < 10 ? '0' : ''}${fraction}`;
}

type Props = {
  paise: number;
  variant?: 'price' | 'priceLarge' | 'priceSmall';
  color?: ThemeColorToken;
};

/**
 * Currency that counts up/down to its new value on the UI thread (cart totals).
 * Text is pushed through a read-only TextInput's native `text` prop, so no JS
 * re-render happens per frame. Screen readers get the final formatted value.
 */
export const AnimatedPrice = memo(function AnimatedPrice({
  paise,
  variant = 'price',
  color = 'textPrimary',
}: Props) {
  const { colors } = useTheme();
  const t = typeScale[variant];
  const value = useSharedValue(paise);

  useEffect(() => {
    value.value = withTiming(paise, { duration: 380, easing: easings.decelerate });
  }, [paise, value]);

  const animatedProps = useAnimatedProps(() => {
    const text = formatINRWorklet(value.value);
    return { text, defaultValue: text } as object;
  });

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      accessibilityLabel={formatINR(paise)}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      defaultValue={formatINR(paise)}
      animatedProps={animatedProps}
      style={[
        styles.input,
        {
          color: colors[color],
          fontFamily: fontFor(t.family, t.weight),
          fontSize: t.size,
          lineHeight: t.lineHeight,
          fontVariant: ['tabular-nums'],
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({ input: { padding: 0, margin: 0 } });
