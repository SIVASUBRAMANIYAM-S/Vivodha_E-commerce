import { usePathname } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartBar } from '@/components/commerce/CartBar';
import { TAB_BAR_HEIGHT, TabBar } from '@/components/navigation/TabBar';
import { spacing } from '@/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="categories" options={{ title: 'Categories' }} />
        <Tabs.Screen name="search" options={{ title: 'Search' }} />
        <Tabs.Screen name="cart" options={{ title: 'Cart' }} />
        <Tabs.Screen name="account" options={{ title: 'Account' }} />
      </Tabs>
      {/* Sibling overlay (not inside the tab bar), so it receives touches on Android. */}
      {pathname !== '/cart' ? (
        <CartBar bottomOffset={TAB_BAR_HEIGHT + insets.bottom + spacing.sm} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
