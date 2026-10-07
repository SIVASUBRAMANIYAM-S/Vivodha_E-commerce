import { StyleSheet, View } from 'react-native';

import { spacing, useTheme } from '@/theme';

export function Divider({ inset = false }: { inset?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
        inset && { marginHorizontal: spacing.lg },
      ]}
    />
  );
}
