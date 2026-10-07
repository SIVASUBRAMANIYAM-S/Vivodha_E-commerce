import { ChevronRight } from '@/components/icons';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { spacing, touch, useTheme } from '@/theme';

type Props = { title: string; actionLabel?: string; onAction?: () => void };

export function SectionHeader({ title, actionLabel = 'See all', onAction }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="h2" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {onAction ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}: ${title}`}
          onPress={onAction}
          style={styles.action}
        >
          <Text variant="label" color="primary">
            {actionLabel}
          </Text>
          <ChevronRight size={16} color={colors.primary} strokeWidth={2.5} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: touch.min,
  },
  title: { flexShrink: 1 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touch.min,
    paddingLeft: spacing.md,
  },
});
