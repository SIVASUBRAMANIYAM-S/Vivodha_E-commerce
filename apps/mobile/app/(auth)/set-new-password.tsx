import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { resetPasswordSchema } from '@vivodha/shared/schemas';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { mapAuthError } from '@/features/auth/api/errors';
import { setNewPassword } from '@/features/auth/api/password-reset';
import { PasswordStrengthMeter } from '@/features/auth/components/PasswordStrengthMeter';
import { spacing } from '@/theme';

/** Only valid once (auth)/callback.tsx has exchanged a recovery code for a session. */
export default function SetNewPasswordScreen() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);

  async function submit() {
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const next: { password?: string; confirmPassword?: string } = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as 'password' | 'confirmPassword'] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await setNewPassword(result.data.password);
      toast.show('Password updated.', 'success');
      router.replace('/(onboarding)/splash');
    } catch (error) {
      const friendly = await mapAuthError(error);
      toast.show(friendly.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.body}>
        <Text variant="h1">Set a new password</Text>
        <Input
          label="New password"
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
        <Input
          label="Confirm password"
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            setErrors((e) => ({ ...e, confirmPassword: undefined }));
          }}
          error={errors.confirmPassword}
          secureTextEntry
          autoComplete="new-password"
        />
      </View>
      <Button title="Update password" fullWidth size="lg" loading={loading} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({ body: { gap: spacing.sm, marginBottom: spacing.lg } });
