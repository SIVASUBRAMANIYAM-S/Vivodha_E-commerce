import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Screen } from './Screen';
import { Text } from './Text';

type Props = {
  title: string;
  phase: string;
  description?: string;
};

/** Phase 0 placeholder used by every route until its feature phase ships. */
export function PlaceholderScreen({ title, phase, description }: Props) {
  return (
    <Screen>
      <Text variant="h1">{title}</Text>
      <View style={styles.card}>
        <Text variant="bodyStrong" color="primary">
          Coming in {phase}
        </Text>
        {description ? <Text color="textSecondary">{description}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: colors.tint,
  },
});
