import { Search, X } from '@/components/icons';
import { StyleSheet, TextInput, View } from 'react-native';

import {
  fontFor,
  iconSize,
  maxFontSizeMultiplier,
  radius,
  shadow,
  spacing,
  touch,
  typeScale,
  useTheme,
} from '@/theme';

import { IconButton } from './IconButton';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Props = {
  placeholder?: string;
  /** Tappable launcher (Home): no keyboard, navigates to the search screen. */
  onPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
  elevated?: boolean;
};

export function SearchBar({
  placeholder = 'Search for products',
  onPress,
  value,
  onChangeText,
  autoFocus,
  elevated = true,
}: Props) {
  const { colors } = useTheme();
  const containerStyle = [
    styles.base,
    { backgroundColor: colors.surface, borderColor: colors.border },
    elevated && { boxShadow: shadow.sm },
  ];

  if (onPress) {
    return (
      <PressableScale
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        accessibilityHint="Opens product search"
        onPress={onPress}
        pressedScale={0.985}
        style={containerStyle}
      >
        <Search size={iconSize.md} color={colors.textSecondary} strokeWidth={2} />
        <Text color="textSecondary" numberOfLines={1} style={styles.flex}>
          {placeholder}
        </Text>
      </PressableScale>
    );
  }

  return (
    <View style={containerStyle}>
      <Search size={iconSize.md} color={colors.textSecondary} strokeWidth={2} />
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        returnKeyType="search"
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[
          styles.flex,
          styles.input,
          {
            color: colors.textPrimary,
            fontFamily: fontFor('body', 'regular'),
            fontSize: typeScale.body.size,
          },
        ]}
      />
      {value ? (
        <IconButton
          icon={X}
          size={iconSize.md}
          accessibilityLabel="Clear search"
          onPress={() => onChangeText?.('')}
          style={styles.clear}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touch.min,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    borderWidth: 1,
  },
  flex: { flex: 1 },
  input: { paddingVertical: spacing.sm },
  clear: { marginRight: -spacing.md },
});
