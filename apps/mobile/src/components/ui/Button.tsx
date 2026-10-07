import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { iconSize, radius, spacing, touch, useTheme } from '@/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'md' | 'lg';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  fullWidth,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const palette = {
    primary: { bg: colors.primary, fg: colors.textOnPrimary, border: 'transparent' },
    secondary: { bg: colors.surfaceTint, fg: colors.primary, border: 'transparent' },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
    destructive: { bg: colors.surface, fg: colors.danger, border: colors.danger },
  }[variant];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      hapticEvent={isDisabled ? false : 'select'}
      style={[
        styles.base,
        {
          minHeight: size === 'lg' ? 56 : touch.min,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: isDisabled && !loading ? 0.45 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} accessibilityLabel="Loading" />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={iconSize.md} color={palette.fg} strokeWidth={2} /> : null}
          <Text variant="label" style={{ color: palette.fg }}>
            {title}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
