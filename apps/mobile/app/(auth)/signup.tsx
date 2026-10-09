import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { signUpSchema, type SignUpInput } from '@vivodha/shared/schemas';

import { useTurnstile } from '@/components/auth/TurnstileGate';
import { ChevronLeft } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { mapAuthError } from '@/features/auth/api/errors';
import { convertGuestToAccount } from '@/features/auth/api/guest-conversion';
import { signUp } from '@/features/auth/api/signup';
import { useUsernameAvailable } from '@/features/auth/api/username-availability';
import { useIsGuest } from '@/features/auth/store';
import { PasswordStrengthMeter } from '@/features/auth/components/PasswordStrengthMeter';
import { spacing } from '@/theme';

export default function SignupScreen() {
  const router = useRouter();
  const turnstile = useTurnstile();
  const toast = useToast();
  const isGuest = useIsGuest();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpInput, string>>>({});
  const [loading, setLoading] = useState(false);

  const availability = useUsernameAvailable(username);

  async function submit() {
    const result = signUpSchema.safeParse({ fullName, username, email, password, phone });
    if (!result.success) {
      const next: Partial<Record<keyof SignUpInput, string>> = {};
      for (const issue of result.error.issues)
        next[issue.path[0] as keyof SignUpInput] = issue.message;
      setErrors(next);
      return;
    }
    if (availability.isTaken) {
      setErrors((e) => ({ ...e, username: 'That username is already taken.' }));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      // Converting an existing guest session preserves its cart/addresses
      // (same user id); a fresh visitor with no session just signs up.
      if (isGuest) {
        await convertGuestToAccount(result.data);
      } else {
        const token = await turnstile.present('signup');
        await signUp(result.data, token);
      }
      router.replace({
        pathname: '/(auth)/check-email',
        params: { email: result.data.email, password: result.data.password },
      });
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
      <Text variant="h1">Create account</Text>
      <View style={styles.fields}>
        <Input
          label="Full name"
          value={fullName}
          onChangeText={(t) => {
            setFullName(t);
            setErrors((e) => ({ ...e, fullName: undefined }));
          }}
          error={errors.fullName}
          autoCapitalize="words"
        />
        <Input
          label="Username"
          value={username}
          onChangeText={(t) => {
            setUsername(t);
            setErrors((e) => ({ ...e, username: undefined }));
          }}
          error={
            errors.username ??
            (availability.isTaken ? 'That username is already taken.' : undefined)
          }
          helper={availability.isAvailable ? 'Username is available' : undefined}
          autoCapitalize="none"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setErrors((e) => ({ ...e, email: undefined }));
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Input
          label="Phone number"
          value={phone}
          onChangeText={(t) => {
            setPhone(t);
            setErrors((e) => ({ ...e, phone: undefined }));
          }}
          error={errors.phone}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <View style={styles.passwordField}>
          <Input
            label="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setErrors((e) => ({ ...e, password: undefined }));
            }}
            error={errors.password}
            secureTextEntry
            autoComplete="new-password"
          />
          <PasswordStrengthMeter password={password} />
        </View>
      </View>
      <Button title="Create account" fullWidth size="lg" loading={loading} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start' },
  fields: { gap: spacing.sm },
  passwordField: { gap: spacing.xs },
});
