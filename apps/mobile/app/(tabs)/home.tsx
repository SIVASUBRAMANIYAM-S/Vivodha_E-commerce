import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product';
import { Text } from '@/components/ui';
import { useLocationStore } from '@/store/location-store';
import { colors, radii, spacing } from '@/theme';

/** Phase 0 home placeholder: brand header + delivery line + search stub + sample card. */
export default function HomeScreen() {
  const pincode = useLocationStore((s) => s.pincode);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text variant="display" color="textOnPrimary">
          vivodha
        </Text>
        <Text variant="small" color="tint">
          {pincode ? `Delivering to ${pincode}` : 'Fresh to your door'}
        </Text>
        <View style={styles.search} accessibilityRole="search">
          <Text color="textSecondary">Search for products</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <Text variant="h3" color="primary">
            Foundation ready
          </Text>
          <Text color="textSecondary">
            Banners, categories, shopping list and product rails arrive in Phase 5.
          </Text>
        </View>

        <Text variant="h2">Sample product card</Text>
        <View style={styles.grid}>
          <View style={styles.cell}>
            <ProductCard
              name="Sample item (placeholder)"
              variants={[{ id: 'sample', label: '1 unit', mrpPaise: 12000, pricePaise: 9900 }]}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
    backgroundColor: colors.primary,
  },
  search: {
    marginTop: spacing.sm,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  notice: {
    padding: spacing.lg,
    gap: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: colors.tint,
  },
  grid: { flexDirection: 'row' },
  cell: { width: '50%' },
});
