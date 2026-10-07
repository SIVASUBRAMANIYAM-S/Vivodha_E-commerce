import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight } from '@/components/icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';

import { useFlyToCart } from '@/components/motion/FlyToCart';
import { useScrollChrome } from '@/components/motion/ScrollChrome';
import { AnimatedPrice } from '@/components/ui/AnimatedPrice';
import { PressableScale } from '@/components/ui/PressableScale';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { Text } from '@/components/ui/Text';
import { useStoreSettings } from '@/features/catalog/api/home';
import { useCartItemCount, useCartSubtotal } from '@/features/cart/store/cart-store';
import { radius, shadow, spacing, springTo, useTheme } from '@/theme';

import { FreeDeliveryProgress } from './FreeDeliveryProgress';

/** Height used by screens to pad their list bottom when the bar is visible. */
export const CART_BAR_HEIGHT = 112;

/**
 * Signature interaction 3: springs up from the bottom on the first item; count
 * and total animate; hides on scroll down and returns on scroll up (shared
 * value from ScrollChrome, UI thread). Also pulses on fly-to-cart arrival.
 */
export function CartBar({ bottomOffset = 0 }: { bottomOffset?: number }) {
  const { colors } = useTheme();
  const count = useCartItemCount();
  const subtotal = useCartSubtotal();
  const { freeDeliveryThresholdPaise } = useStoreSettings();
  const { hidden } = useScrollChrome();
  const { arrivals } = useFlyToCart();
  const shown = useSharedValue(count > 0 ? 1 : 0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    shown.value = springTo(count > 0 ? 1 : 0, 'gentle');
  }, [count, shown]);

  useAnimatedReaction(
    () => arrivals.value,
    (now, prev) => {
      if (prev !== null && now !== prev) {
        pulse.set(withSequence(springTo(1.04, 'bouncy'), springTo(1, 'bouncy')));
      }
    },
  );

  const style = useAnimatedStyle(() => {
    const visible = shown.value * (1 - hidden.value);
    return {
      opacity: interpolate(visible, [0, 0.4, 1], [0, 1, 1]),
      transform: [
        { translateY: interpolate(visible, [0, 1], [CART_BAR_HEIGHT + 24, 0]) },
        { scale: pulse.value },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents={count > 0 ? 'box-none' : 'none'}
      style={[styles.host, { bottom: bottomOffset }, style]}
    >
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${count} ${count === 1 ? 'item' : 'items'}`}
        onPress={() => router.navigate('/cart')}
        pressedScale={0.985}
        style={[styles.bar, { boxShadow: shadow.lg }]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.gradient]}
        />
        <FreeDeliveryProgress
          subtotalPaise={subtotal}
          thresholdPaise={freeDeliveryThresholdPaise}
          tone="onDark"
          celebrate
        />
        <View style={styles.row}>
          <View style={styles.summary}>
            <View style={styles.countRow}>
              <RollingNumber value={count} color="textOnPrimary" />
              <Text variant="small" style={{ color: colors.textOnPrimary }}>
                {count === 1 ? ' item' : ' items'}
              </Text>
            </View>
            <AnimatedPrice paise={subtotal} color="textOnPrimary" />
          </View>
          <View style={styles.cta}>
            <Text variant="label" style={{ color: colors.textOnPrimary }}>
              View cart
            </Text>
            <ChevronRight size={18} color={colors.textOnPrimary} strokeWidth={2.5} />
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: spacing.md, right: spacing.md },
  bar: {
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  // The gradient rounds itself so the bar does not clip (the celebration burst
  // from FreeDeliveryProgress must be able to escape the bar bounds).
  gradient: { borderRadius: radius.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summary: { gap: 0 },
  countRow: { flexDirection: 'row', alignItems: 'center' },
  cta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, minHeight: 44 },
});
