import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { House, LayoutGrid, Search, ShoppingCart, User, type LucideIcon } from '@/components/icons';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCartTarget, useFlyToCart } from '@/components/motion/FlyToCart';
import { Text } from '@/components/ui/Text';
import { useCartItemCount } from '@/features/cart/store/cart-store';
import { haptic } from '@/lib/haptics';
import { radius, spacing, springTo, useTheme } from '@/theme';

export const TAB_BAR_HEIGHT = 64;

const ICONS: Record<string, LucideIcon> = {
  home: House,
  categories: LayoutGrid,
  search: Search,
  cart: ShoppingCart,
  account: User,
};

const PILL_W = 56;
const PILL_H = 32;

/**
 * Custom bottom tab bar: animated active pill (snappy spring), selection
 * haptic on tab change, cart badge whose count bounces on change and pulses
 * when a fly-to-cart thumbnail arrives.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tabW = width / state.routes.length;
  const x = useSharedValue(state.index * tabW + (tabW - PILL_W) / 2);

  useEffect(() => {
    x.value = springTo(state.index * tabW + (tabW - PILL_W) / 2, 'snappy');
  }, [state.index, tabW, x]);

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={[
        styles.bar,
        {
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.pill, { backgroundColor: colors.surfaceTint }, pillStyle]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]!;
        const focused = state.index === index;
        const Icon = ICONS[route.name] ?? House;
        const label = typeof options.title === 'string' ? options.title : route.name;
        const color = focused ? colors.primary : colors.textSecondary;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            haptic('select');
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            style={styles.tab}
          >
            {route.name === 'cart' ? (
              <CartIcon color={color} />
            ) : (
              <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 2} />
            )}
            <Text variant="caption" style={{ color }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function CartIcon({ color }: { color: string }) {
  const { colors } = useTheme();
  const count = useCartItemCount();
  const ref = useRef<View>(null);
  const scale = useSharedValue(1);
  const { arrivals } = useFlyToCart();
  useCartTarget(ref);

  // Count change: bouncy pop.
  useEffect(() => {
    if (count > 0) scale.set(withSequence(springTo(1.25, 'bouncy'), springTo(1, 'bouncy')));
  }, [count, scale]);

  // Fly-to-cart arrival: pulse.
  useAnimatedReaction(
    () => arrivals.value,
    (now, prev) => {
      if (prev !== null && now !== prev) {
        scale.set(withSequence(springTo(1.3, 'bouncy'), springTo(1, 'bouncy')));
      }
    },
  );

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View ref={ref} collapsable={false} style={styles.cartIcon}>
      <ShoppingCart size={22} color={color} strokeWidth={2} />
      {count > 0 ? (
        <Animated.View
          accessibilityLabel={`${count} in cart`}
          style={[
            styles.badge,
            { backgroundColor: colors.warning, borderColor: colors.surface },
            badgeStyle,
          ]}
        >
          {/* Saffron fill with ink text (white on saffron fails contrast). */}
          <Text variant="caption" color="textOnAccent" style={styles.badgeText}>
            {count > 99 ? '99+' : count}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  pill: {
    position: 'absolute',
    top: (TAB_BAR_HEIGHT - PILL_H) / 2 - 9,
    left: 0,
    width: PILL_W,
    height: PILL_H,
    borderRadius: radius.pill,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xxs },
  cartIcon: { width: 32, height: 26, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, lineHeight: 12 },
});
