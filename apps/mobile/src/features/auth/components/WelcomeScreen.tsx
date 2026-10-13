import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useIsOffline } from '@/components/ui/States';
import { ensureGuestSession } from '@/lib/supabase';
import { captchaRequired } from '@/lib/captcha-policy';
import { authErrorMessage } from '../api/auth-errors';
import { useAuth } from './AuthProvider';
import { AuthScreen } from './AuthScreen';
import { Captcha } from './Captcha';

export function WelcomeScreen() {
  const { session } = useAuth();
  const offline = useIsOffline();
  const [guest, setGuest] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function continueGuest() {
    setBusy(true);
    setError(null);
    try {
      await ensureGuestSession(token ?? '');
      router.replace('/');
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setBusy(false);
      setToken(null);
      setNonce((value) => value + 1);
    }
  }
  return (
    <AuthScreen
      title="Fresh to your door"
      description="Everyday essentials, thoughtful choices. Welcome to Vivodha."
    >
      <Button title="Sign up" disabled={busy} onPress={() => router.push('/signup')} />
      <Button
        title="Log in"
        variant="secondary"
        disabled={busy}
        onPress={() => router.push('/login')}
      />
      {session ? (
        <Button title="Continue your session" variant="ghost" onPress={() => router.replace('/')} />
      ) : (
        <Button
          title="Continue as guest"
          variant="ghost"
          disabled={offline || busy}
          onPress={() => setGuest(true)}
        />
      )}
      {guest && !session ? (
        <>
          <Text color="textSecondary">
            {captchaRequired
              ? 'Verify once to browse as a guest. Your session stays on this device.'
              : 'Your guest session stays on this device.'}
          </Text>
          <Captcha nonce={nonce} onToken={setToken} />
          {error ? (
            <Text color="danger" accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
          <Button
            title="Start browsing"
            disabled={offline || (captchaRequired && !token)}
            loading={busy}
            onPress={() => void continueGuest()}
          />
        </>
      ) : null}
    </AuthScreen>
  );
}
