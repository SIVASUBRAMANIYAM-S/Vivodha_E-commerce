import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTurnstile } from '@/components/auth/TurnstileGate';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { mapAuthError } from '@/features/auth/api/errors';
import { ensureGuestSession } from '@/lib/supabase';
import { spacing } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const turnstile = useTurnstile();
  const toast = useToast();
  const [guestLoading, setGuestLoading] = useState(false);

  async function continueAsGuest() {
    setGuestLoading(true);
    try {
      const token = await turnstile.present('guest');
      await ensureGuestSession(token);
      router.replace('/(onboarding)/location');
    } catch (error) {
      const friendly = await mapAuthError(error);
      if (friendly.code !== 'CAPTCHA_CANCELLED') toast.show(friendly.message, 'error');
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text variant="display" color="primary" align="center">
          vivodha
        </Text>
        <Text color="textSecondary" align="center">
          Groceries, essentials, and more — delivered fast.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          title="Create account"
          fullWidth
          size="lg"
          onPress={() => router.push('/(auth)/signup')}
        />
        <Button
          title="Log in"
          variant="secondary"
          fullWidth
          size="lg"
          onPress={() => router.push('/(auth)/login')}
        />
        <Button
          title="Continue as guest"
          variant="ghost"
          fullWidth
          loading={guestLoading}
          onPress={continueAsGuest}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  actions: { gap: spacing.md, paddingBottom: spacing.lg },
});
