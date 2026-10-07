import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { iconSize, radius, shadow, touch, useTheme } from '@/theme';

import { PressableScale } from './PressableScale';

type Variant = 'ghost' | 'tonal' | 'filled' | 'surface';

export type IconButtonProps = {
  icon: LucideIcon;
  /** Required: icon-only controls must be labelled for screen readers. */
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** 48dp icon control (touch.min) regardless of the icon's visual size. */
export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  variant = 'ghost',
  disabled,
  size = iconSize.lg,
  style,
}: IconButtonProps) {
  const { colors } = useTheme();
  const palette = {
    ghost: { bg: 'transparent', fg: colors.textPrimary },
    tonal: { bg: colors.surfaceTint, fg: colors.primary },
    filled: { bg: colors.primary, fg: colors.textOnPrimary },
    surface: { bg: colors.surface, fg: colors.textPrimary },
  }[variant];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      pressedScale={0.92}
      hapticEvent={disabled ? false : 'select'}
      style={[
        styles.base,
        { backgroundColor: palette.bg, opacity: disabled ? 0.45 : 1 },
        variant === 'surface' && { boxShadow: shadow.sm },
        style,
      ]}
    >
      <Icon size={size} color={palette.fg} strokeWidth={2} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: touch.min,
    height: touch.min,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
