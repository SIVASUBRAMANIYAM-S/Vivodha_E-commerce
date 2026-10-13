import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/features/auth/components/AuthProvider';
import { AuthScreen } from '@/features/auth/components/AuthScreen';

export default function AuthCallbackScreen() {
  const { error, retry, loading, dismissError } = useAuth();
  return (
    <AuthScreen title="Opening your email link">
      {error ? (
        <>
          <Text color="danger" accessibilityRole="alert">
            {error}
          </Text>
          <Button title="Try opening the link again" onPress={retry} />
          <Button
            title="Request a new password reset"
            variant="secondary"
            onPress={() => {
              dismissError();
              router.replace('/forgot-password');
            }}
          />
          <Button
            title="Back to welcome"
            variant="ghost"
            onPress={() => {
              dismissError();
              router.replace('/welcome');
            }}
          />
        </>
      ) : loading ? (
        <Skeleton height={64} />
      ) : (
        <>
          <Text color="textSecondary">
            Open the full confirmation or reset link from your email.
          </Text>
          <Button title="Continue" onPress={() => router.replace('/')} />
          <Button
            title="Request a new reset link"
            variant="ghost"
            onPress={() => router.replace('/forgot-password')}
          />
        </>
      )}
    </AuthScreen>
  );
}
