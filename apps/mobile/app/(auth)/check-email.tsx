import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTurnstile } from '@/components/auth/TurnstileGate';
import { CircleCheck } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { mapAuthError } from '@/features/auth/api/errors';
import { login } from '@/features/auth/api/login';
import { iconSize, spacing, useTheme } from '@/theme';

const isExpoGo = Constants.appOwnership === 'expo';

/**
 * Expo Go can't reopen the app from the email's deep link (its exp:// URL is
 * unstable per network/port — see docs/decisions.md). Confirmation still
 * succeeds the instant the link is opened anywhere; this screen's "Continue"
 * button (Expo Go only) just re-attempts login, which now succeeds. A dev
 * client or production build gets the real deep link via (auth)/callback.
 */
export default function CheckEmailScreen() {
  const router = useRouter();
  const turnstile = useTurnstile();
  const toast = useToast();
  const { colors } = useTheme();
  const { email, password } = useLocalSearchParams<{ email: string; password?: string }>();
  const [loading, setLoading] = useState(false);

  async function continueAfterConfirming() {
    if (!password) return;
    setLoading(true);
    try {
      const token = await turnstile.present('login');
      await login({ identifier: email, password }, token);
      router.replace('/(onboarding)/splash');
    } catch (error) {
      const friendly = await mapAuthError(error);
      if (friendly.code === 'CAPTCHA_CANCELLED') return;
      toast.show(
        friendly.code === 'EMAIL_NOT_CONFIRMED'
          ? 'Not confirmed yet — open the link in the email we sent you.'
          : friendly.message,
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.body}>
        <CircleCheck size={iconSize.xl} color={colors.primary} strokeWidth={1.75} />
        <Text variant="h1" align="center">
          Check your email
        </Text>
        <Text color="textSecondary" align="center">
          We sent a confirmation link to {email}. Open it to continue.
        </Text>
      </View>
      {isExpoGo && password ? (
        <Button
          title="I've confirmed — continue"
          fullWidth
          size="lg"
          loading={loading}
          onPress={continueAfterConfirming}
          style={styles.action}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  action: { marginBottom: spacing.lg },
});
