import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ShoppingBasket } from '@/components/icons';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddStepper } from '@/components/commerce/AddStepper';
import { FreeDeliveryProgress } from '@/components/commerce/FreeDeliveryProgress';
import { TAB_BAR_HEIGHT } from '@/components/navigation/TabBar';
import { AnimatedPrice } from '@/components/ui/AnimatedPrice';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/States';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useStoreSettings } from '@/features/catalog/api/home';
import { computeTotals, useCartStore, type CartLine } from '@/features/cart/store/cart-store';
import { radius, spacing, useTheme } from '@/theme';
import { formatINR } from '@/utils/format';

/**
 * Local cart (ADR-139). Coupons, Vivo Points and checkout land in Phase 6;
 * this screen exists so the stepper, CartBar and free-delivery progress work
 * end to end.
 */
export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const linesMap = useCartStore((s) => s.lines);
  const lines = useMemo(() => Object.values(linesMap), [linesMap]);
  const totals = useMemo(() => computeTotals(linesMap), [linesMap]);
  const { freeDeliveryThresholdPaise, deliveryFeePaise } = useStoreSettings();
  const toast = useToast();
  const deliveryPaise = totals.subtotalPaise >= freeDeliveryThresholdPaise ? 0 : deliveryFeePaise;

  const renderItem = useCallback(({ item }: { item: CartLine }) => <CartRow line={item} />, []);

  if (lines.length === 0) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <EmptyState
          icon={ShoppingBasket}
          title="Your cart is empty"
          message="Fresh groceries are a tap away."
          actionLabel="Start shopping"
          onAction={() => router.navigate('/home')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceMuted, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text variant="h1" accessibilityRole="header">
          Cart
        </Text>
        <FreeDeliveryProgress
          subtotalPaise={totals.subtotalPaise}
          thresholdPaise={freeDeliveryThresholdPaise}
        />
      </View>
      <FlashList
        data={lines}
        keyExtractor={(l) => l.variantId}
        renderItem={renderItem}
        ItemSeparatorComponent={RowGap}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
        ListFooterComponent={
          <Surface style={styles.summary} elevation="sm">
            <SummaryRow label="Item total (MRP)" value={formatINR(totals.mrpTotalPaise)} />
            {totals.savingsPaise > 0 ? (
              <SummaryRow
                label="Discount"
                value={`− ${formatINR(totals.savingsPaise)}`}
                tone="discount"
              />
            ) : null}
            <SummaryRow
              label="Delivery"
              value={deliveryPaise === 0 ? 'Free' : formatINR(deliveryPaise)}
            />
            <Divider />
            <View style={styles.summaryRow}>
              <Text variant="h3">To pay</Text>
              <AnimatedPrice paise={totals.subtotalPaise + deliveryPaise} variant="priceLarge" />
            </View>
            {totals.savingsPaise > 0 ? (
              <Text variant="small" color="discount">
                You save {formatINR(totals.savingsPaise)} on this order
              </Text>
            ) : null}
          </Surface>
        }
      />
      <View
        style={[
          styles.checkout,
          {
            backgroundColor: colors.surface,
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.md,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Button
          title="Proceed to checkout"
          size="lg"
          fullWidth
          onPress={() => toast.show('Checkout arrives in Phase 6')}
        />
      </View>
    </View>
  );
}

function RowGap() {
  return <View style={styles.rowGap} />;
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: 'discount' }) {
  return (
    <View style={styles.summaryRow}>
      <Text color="textSecondary">{label}</Text>
      <Text variant="bodyStrong" color={tone === 'discount' ? 'discount' : 'textPrimary'}>
        {value}
      </Text>
    </View>
  );
}

const CartRow = memo(function CartRow({ line }: { line: CartLine }) {
  const { colors } = useTheme();
  const setQuantity = useCartStore((s) => s.setQuantity);
  return (
    <Surface style={styles.row} elevation="sm">
      <View style={[styles.thumb, { backgroundColor: colors.surfaceTint }]}>
        {line.imageUrl ? (
          <Image
            source={line.imageUrl}
            recyclingKey={line.variantId}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : null}
      </View>
      <View style={styles.rowBody}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {line.name}
        </Text>
        <Text variant="small" color="textSecondary">
          {line.variantLabel}
        </Text>
        <View style={styles.rowFooter}>
          <View>
            <Text variant="price">{formatINR(line.pricePaise * line.quantity)}</Text>
            {line.mrpPaise > line.pricePaise ? (
              <Text variant="mrp" color="textSecondary" strike>
                {formatINR(line.mrpPaise * line.quantity)}
              </Text>
            ) : null}
          </View>
          <AddStepper
            quantity={line.quantity}
            max={line.maxPerOrder}
            itemLabel={`${line.name} ${line.variantLabel}`}
            onAdd={() => setQuantity(line.variantId, 1)}
            onIncrement={() => setQuantity(line.variantId, line.quantity + 1)}
            onDecrement={() => setQuantity(line.variantId, line.quantity - 1)}
          />
        </View>
      </View>
    </Surface>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center' },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  rowGap: { height: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  thumb: { width: 76, height: 76, borderRadius: radius.image, overflow: 'hidden' },
  rowBody: { flex: 1, gap: spacing.xxs },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  summary: { marginTop: spacing.lg, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkout: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
