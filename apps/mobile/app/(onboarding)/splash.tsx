import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/features/auth/store';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useLocationStore } from '@/store/location-store';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { spacing, useTheme } from '@/theme';

export default function SplashRoute() {
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const session = useSession();
  const pincode = useLocationStore((s) => s.pincode);
  const { colors } = useTheme();

  if (isInitializing) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text variant="display" color="primary">
            vivodha
          </Text>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!session) return <Redirect href="/(onboarding)/welcome" />;
  if (!pincode) return <Redirect href="/(onboarding)/location" />;
  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
});
