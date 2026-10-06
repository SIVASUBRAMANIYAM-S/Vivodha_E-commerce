import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/theme';

type Props = {
  quantity: number;
  onChange: (next: number) => void;
  max?: number;
};

/** "Add" button that turns into a -/+ stepper once quantity > 0. Stub: cart wiring in Phase 6. */
export function AddStepper({ quantity, onChange, max = 99 }: Props) {
  if (quantity <= 0) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add to cart"
        onPress={() => onChange(1)}
        style={[styles.box, styles.add]}
      >
        <Text variant="bodyStrong" color="primary">
          Add
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.box, styles.stepper]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        onPress={() => onChange(quantity - 1)}
        hitSlop={8}
        style={styles.step}
      >
        <Text variant="h3" color="textOnPrimary">
          −
        </Text>
      </Pressable>
      <Text variant="bodyStrong" color="textOnPrimary" accessibilityLabel={`Quantity ${quantity}`}>
        {quantity}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        disabled={quantity >= max}
        onPress={() => onChange(quantity + 1)}
        hitSlop={8}
        style={styles.step}
      >
        <Text variant="h3" color="textOnPrimary">
          +
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 36,
    minWidth: 88,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.primary,
  },
  step: { paddingHorizontal: spacing.sm },
});
