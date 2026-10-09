import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/ui/States';
import { Screen } from '@/components/ui/Screen';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme';

/**
 * Deep-link target for every email-confirmation/recovery link
 * (Linking.createURL('/callback'), PKCE `?code=`). Only reachable in a dev
 * client or production build — Expo Go's exp:// URL is unstable, so its
 * flows fall back to check-email.tsx's "Continue" button instead.
 */
export default function CallbackScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { code, type } = useLocalSearchParams<{ code?: string; type?: string }>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!code) return;
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setFailed(true);
          return;
        }
        if (type === 'recovery') {
          router.replace('/(auth)/set-new-password');
        } else {
          router.replace('/(onboarding)/splash');
        }
      })
      .catch(() => setFailed(true));
  }, [code, type, router]);

  if (failed || !code) {
    return (
      <Screen>
        <ErrorState
          title="This link didn't work"
          message="It may have expired. Please try again from the app."
          onRetry={() => router.replace('/(onboarding)/welcome')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
