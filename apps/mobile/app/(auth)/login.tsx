import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { loginSchema, type LoginInput } from '@vivodha/shared/schemas';

import { useTurnstile } from '@/components/auth/TurnstileGate';
import { ChevronLeft } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { login } from '@/features/auth/api/login';
import { mapAuthError } from '@/features/auth/api/errors';
import { spacing } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const turnstile = useTurnstile();
  const toast = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [loading, setLoading] = useState(false);

  async function submit() {
    const result = loginSchema.safeParse({ identifier, password });
    if (!result.success) {
      const next: Partial<Record<keyof LoginInput, string>> = {};
      for (const issue of result.error.issues)
        next[issue.path[0] as keyof LoginInput] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const token = await turnstile.present('login');
      await login(result.data, token);
      router.replace('/(onboarding)/splash');
    } catch (error) {
      const friendly = await mapAuthError(error);
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
      <Text variant="h1">Log in</Text>
      <View style={styles.fields}>
        <Input
          label="Username or email"
          value={identifier}
          onChangeText={(t) => {
            setIdentifier(t);
            setErrors((e) => ({ ...e, identifier: undefined }));
          }}
          error={errors.identifier}
          autoCapitalize="none"
          autoComplete="username"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setErrors((e) => ({ ...e, password: undefined }));
          }}
          error={errors.password}
          secureTextEntry
          autoComplete="current-password"
        />
        <Button
          title="Forgot password?"
          variant="ghost"
          onPress={() => router.push('/(auth)/forgot-password')}
        />
      </View>
      <Button title="Log in" fullWidth size="lg" loading={loading} onPress={submit} />
      <View style={styles.footer}>
        <Text color="textSecondary">New here? </Text>
        <Button
          title="Create account"
          variant="ghost"
          onPress={() => router.push('/(auth)/signup')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start' },
  fields: { gap: spacing.sm },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
