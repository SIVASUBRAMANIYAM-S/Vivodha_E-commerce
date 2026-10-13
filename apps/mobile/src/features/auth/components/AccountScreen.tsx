import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ErrorState, useIsOffline } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Palette } from '@/components/icons';
import { useCartStore } from '@/features/cart/store/cart-store';
import { queryClient } from '@/lib/query-client';
import { logOut } from '../api/auth-api';
import { authErrorMessage } from '../api/auth-errors';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from './AuthProvider';

export function AccountScreen() {
  const { session } = useAuth();
  const profile = useProfile();
  const offline = useIsOffline();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletion, setDeletion] = useState(false);
  async function logout() {
    setBusy(true);
    setError(null);
    try {
      await logOut();
      useCartStore.getState().clear();
      queryClient.clear();
      router.replace('/welcome');
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen scroll edges={['top', 'bottom']}>
      <Text variant="h1" accessibilityRole="header">
        Account
      </Text>
      {offline ? (
        <Text color="danger" accessibilityRole="alert">
          You&apos;re offline. Account changes are unavailable.
        </Text>
      ) : null}
      {session?.user.is_anonymous ? (
        <>
          <Text variant="h2">You&apos;re browsing as a guest</Text>
          <Text color="textSecondary">
            Create account to save your orders. Your cart and addresses stay with you.
          </Text>
          <Button title="Create account" disabled={busy} onPress={() => router.push('/signup')} />
          <Button
            title="Log in"
            variant="secondary"
            disabled={busy}
            onPress={() => router.push('/login')}
          />
        </>
      ) : (
        <>
          {profile.isPending ? (
            <Skeleton height={100} />
          ) : profile.isError ? (
            <ErrorState
              message={authErrorMessage(profile.error)}
              onRetry={() => void profile.refetch()}
            />
          ) : (
            <>
              <Text variant="h2">{profile.data.full_name ?? 'Your profile'}</Text>
              {profile.data.username ? <Text>@{profile.data.username}</Text> : null}
              <Text>{session?.user.email}</Text>
              <Text>{profile.data.phone ?? 'No delivery phone saved'}</Text>
            </>
          )}
        </>
      )}
      <Button
        title="Delivery location"
        variant="secondary"
        onPress={() => router.push('/location')}
      />
      <Button
        title="Delete account"
        variant="ghost"
        onPress={() => setDeletion((value) => !value)}
      />
      {deletion ? (
        <Text color="textSecondary">
          The complete account-deletion request flow is not available in this development build. It
          must ship before launch; this entry does not delete your account.
        </Text>
      ) : null}
      {error ? (
        <Text color="danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Button
        title="Log out and clear local cart"
        variant="destructive"
        loading={busy}
        disabled={offline}
        onPress={() => void logout()}
      />
      {__DEV__ ? (
        <Button
          title="Open Design Lab"
          variant="secondary"
          icon={Palette}
          onPress={() => router.push('/design-lab')}
        />
      ) : null}
    </Screen>
  );
}
