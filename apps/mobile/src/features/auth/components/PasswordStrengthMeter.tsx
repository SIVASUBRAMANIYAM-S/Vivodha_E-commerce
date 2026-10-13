import { StyleSheet, View } from 'react-native';

import { scorePasswordStrength } from '@vivodha/shared/schemas';

import { Text } from '@/components/ui/Text';
import { radius, spacing, useTheme, type ThemeColorToken } from '@/theme';

const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const satisfies readonly [
  string,
  string,
  string,
  string,
  string,
];
const COLORS = ['danger', 'danger', 'warning', 'success', 'success'] as const satisfies readonly [
  ThemeColorToken,
  ThemeColorToken,
  ThemeColorToken,
  ThemeColorToken,
  ThemeColorToken,
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { colors } = useTheme();
  const score = scorePasswordStrength(password);

  if (!password) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { backgroundColor: i < score ? colors[COLORS[score]] : colors.border },
            ]}
          />
        ))}
      </View>
      <Text variant="small" color={COLORS[score]}>
        {LABELS[score]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  bars: { flexDirection: 'row', gap: spacing.xs },
  bar: { flex: 1, height: 4, borderRadius: radius.pill },
});
