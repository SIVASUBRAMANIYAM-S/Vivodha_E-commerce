import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, fontFor, typeScale, type ColorToken, type TypeVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: ColorToken;
};

/** Brand text. Poppins for display/h*, Inter for everything else, via typeScale. */
export function Text({ variant = 'body', color = 'text', style, ...rest }: TextProps) {
  const t = typeScale[variant];
  return (
    <RNText
      style={[
        {
          fontFamily: fontFor(t.family, t.weight),
          fontSize: t.size,
          lineHeight: t.lineHeight,
          color: colors[color],
        },
        style,
      ]}
      {...rest}
    />
  );
}
