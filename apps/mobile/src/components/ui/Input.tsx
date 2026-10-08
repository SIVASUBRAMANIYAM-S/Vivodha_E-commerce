import type { LucideIcon } from 'lucide-react-native';
import { forwardRef, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import {
  fontFor,
  iconSize,
  maxFontSizeMultiplier,
  radius,
  spacing,
  timeTo,
  touch,
  typeScale,
  useTheme,
} from '@/theme';

import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string;
  icon?: LucideIcon;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, helper, error, icon: Icon, editable = true, onFocus, onBlur, style, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const focus = useSharedValue(0);

  useEffect(() => {
    focus.value = timeTo(focused ? 1 : 0, 'fast');
  }, [focus, focused]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.danger
      : interpolateColor(focus.value, [0, 1], [colors.border, colors.primary]),
  }));

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="small" color="textSecondary" nativeID={`${label}-label`}>
          {label}
        </Text>
      ) : null}
      <Animated.View
        style={[
          styles.field,
          { backgroundColor: editable ? colors.surface : colors.surfaceMuted },
          borderStyle,
        ]}
      >
        {Icon ? <Icon size={iconSize.md} color={colors.textSecondary} strokeWidth={2} /> : null}
        <TextInput
          ref={ref}
          editable={editable}
          accessibilityLabel={label}
          aria-invalid={!!error}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          placeholderTextColor={colors.textSecondary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontFamily: fontFor('body', 'regular'),
              fontSize: typeScale.bodyLarge.size,
            },
            style,
          ]}
          {...rest}
        />
      </Animated.View>
      {error ? (
        <Text variant="small" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="small" color="textSecondary">
          {helper}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touch.min + 4,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.input,
  },
  input: { flex: 1, paddingVertical: spacing.sm },
});
