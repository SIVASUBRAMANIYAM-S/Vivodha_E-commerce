import { StyleSheet, View, type ViewProps } from 'react-native';

import { radius, shadow, spacing, useTheme, type ShadowToken } from '@/theme';

export type SurfaceProps = ViewProps & {
  elevation?: ShadowToken;
  tone?: 'surface' | 'tint' | 'muted';
  padded?: boolean;
  rounded?: 'card' | 'button' | 'sheet' | 'none';
};

/** Card/surface with soft layered depth (radius.card, shadow tokens). */
export function Surface({
  elevation = 'sm',
  tone = 'surface',
  padded = true,
  rounded = 'card',
  style,
  ...rest
}: SurfaceProps) {
  const { colors } = useTheme();
  const bg = {
    surface: colors.surfaceElevated,
    tint: colors.surfaceTint,
    muted: colors.surfaceMuted,
  }[tone];
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: rounded === 'none' ? 0 : radius[rounded],
          boxShadow: tone === 'surface' ? shadow[elevation] : undefined,
        },
        padded && styles.padded,
        style,
      ]}
      {...rest}
    />
  );
}

export const Card = Surface;

const styles = StyleSheet.create({
  base: {},
  padded: { padding: spacing.lg },
});
