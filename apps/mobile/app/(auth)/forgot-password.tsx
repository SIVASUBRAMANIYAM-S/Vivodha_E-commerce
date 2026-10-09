import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { forgotPasswordSchema } from '@vivodha/shared/schemas';

import { useTurnstile } from '@/components/auth/TurnstileGate';
import { ChevronLeft } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { mapAuthError } from '@/features/auth/api/errors';
import { requestPasswordReset } from '@/features/auth/api/password-reset';
import { spacing } from '@/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const turnstile = useTurnstile();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit() {
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const token = await turnstile.present('forgot-password');
      await requestPasswordReset(result.data.email, token);
      router.replace({ pathname: '/(auth)/check-email', params: { email: result.data.email } });
    } catch (e) {
      const friendly = await mapAuthError(e);
      if (friendly.code !== 'CAPTCHA_CANCELLED') toast.show(friendly.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <IconButton
        icon={ChevronLeft}
        accessibilityLabel="Back"
        onPress={() => router.back()}
        style={styles.back}
      />
      <View style={styles.body}>
        <Text variant="h1">Reset password</Text>
        <Text color="textSecondary">
          Enter your email and we&apos;ll send you a link to reset your password.
        </Text>
        <Input
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setError(undefined);
          }}
          error={error}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>
      <Button title="Send reset link" fullWidth size="lg" loading={loading} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start' },
  body: { gap: spacing.sm, marginBottom: spacing.lg },
});
