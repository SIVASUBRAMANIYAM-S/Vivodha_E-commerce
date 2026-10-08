import { memo } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import {
  fontFor,
  maxFontSizeMultiplier,
  typeScale,
  useTheme,
  type ThemeColorToken,
  type TypeVariant,
} from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: ThemeColorToken;
  align?: 'left' | 'center' | 'right';
  /** Strike-through (MRP). */
  strike?: boolean;
};

/**
 * Brand text. Poppins for headings/prices/counters, Inter for body; numeric
 * variants use tabular numerals. Scales with system font size, capped.
 */
export const Text = memo(function Text({
  variant = 'body',
  color = 'textPrimary',
  align,
  strike,
  style,
  ...rest
}: TextProps) {
  const { colors } = useTheme();
  const t: (typeof typeScale)[TypeVariant] = typeScale[variant];
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        {
          fontFamily: fontFor(t.family, t.weight),
          fontSize: t.size,
          lineHeight: t.lineHeight,
          color: colors[color],
          textAlign: align,
          fontVariant: 'numeric' in t && t.numeric ? ['tabular-nums'] : undefined,
          textDecorationLine: strike ? 'line-through' : undefined,
        },
        style,
      ]}
      {...rest}
    />
  );
});
