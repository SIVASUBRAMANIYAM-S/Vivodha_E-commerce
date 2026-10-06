import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fontFor, radii, spacing, typeScale } from '@/theme';

import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

/** Stub: icons, password toggle and focus ring land in Phase 3. */
export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="small" color="textSecondary">
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textDisabled}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? (
        <Text variant="small" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: fontFor('body', 'regular'),
    fontSize: typeScale.body.size,
  },
  inputError: { borderColor: colors.danger },
});
