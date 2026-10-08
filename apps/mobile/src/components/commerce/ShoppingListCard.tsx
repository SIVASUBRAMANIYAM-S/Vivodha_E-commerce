import { router } from 'expo-router';
import { Camera, PenLine, Upload, type LucideIcon } from '@/components/icons';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { radius, spacing, touch, useTheme } from '@/theme';

const MODES: { label: string; icon: LucideIcon }[] = [
  { label: 'Write', icon: PenLine },
  { label: 'Photo', icon: Camera },
  { label: 'Upload', icon: Upload },
];

/** Home entry to the AI shopping list (UI only until Phase 10). */
export function ShoppingListCard() {
  const { colors } = useTheme();
  return (
    <View style={styles.pad}>
      <Surface tone="tint" style={styles.card}>
        <View style={styles.text}>
          <Text variant="h3">Have a shopping list?</Text>
          <Text color="textSecondary">
            Write it, snap it or upload it. We&apos;ll fill your cart.
          </Text>
        </View>
        <View style={styles.modes}>
          {MODES.map(({ label, icon: Icon }) => (
            <PressableScale
              key={label}
              accessibilityRole="button"
              accessibilityLabel={`${label} a shopping list`}
              onPress={() => router.push('/shopping-list')}
              hapticEvent="select"
              style={[styles.mode, { backgroundColor: colors.surface }]}
            >
              <Icon size={20} color={colors.primary} strokeWidth={2} />
              <Text variant="caption" color="primary">
                {label}
              </Text>
            </PressableScale>
          ))}
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: spacing.lg },
  card: { gap: spacing.md },
  text: { gap: spacing.xxs },
  modes: { flexDirection: 'row', gap: spacing.sm },
  mode: {
    flex: 1,
    minHeight: touch.min + 16,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
});
