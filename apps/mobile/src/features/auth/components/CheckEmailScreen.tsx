import { emailSchema } from '@vivodha/shared/schemas';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useIsOffline } from '@/components/ui/States';
import { supabase } from '@/lib/supabase';
import { captchaOptions, captchaRequired } from '@/lib/captcha-policy';
import { authRedirectUrl } from '../api/auth-api';
import { authErrorMessage } from '../api/auth-errors';
import { AuthScreen } from './AuthScreen';
import { Captcha } from './Captcha';

export function CheckEmailScreen() {
  const params = useLocalSearchParams<{ email?: string; conversion?: string }>();
  const email = emailSchema.safeParse(params.email);
  const converting = params.conversion === '1';
  const offline = useIsOffline();
  const [showResend, setShowResend] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  async function resend() {
    if (!email.success) return;
    setBusy(true);
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: converting ? 'email_change' : 'signup',
        email: email.data,
        options: {
          ...captchaOptions(token),
          emailRedirectTo: authRedirectUrl(converting ? 'conversion' : undefined),
        },
      });
      if (resendError) throw resendError;
      setSent(true);
      setShowResend(false);
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
      title="Check your email"
      description={
        email.success
          ? `Open the confirmation link sent to ${email.data} on this device.`
          : 'Open the confirmation link in your email on this device.'
      }
    >
      <Text color="textSecondary">
        {converting
          ? 'Your guest account keeps the same identity. After confirmation, enter a password to finish.'
          : 'Check your spam folder too. Once confirmed, return to Vivodha.'}
      </Text>
      {sent ? (
        <Text accessibilityLiveRegion="polite">
          If confirmation is still needed, a new link has been sent.
        </Text>
      ) : null}
      {error ? (
        <Text color="danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {showResend ? <Captcha nonce={nonce} onToken={setToken} /> : null}
      {showResend ? (
        <Button
          title="Send confirmation again"
          loading={busy}
          disabled={offline || (captchaRequired && !token) || !email.success}
          onPress={() => void resend()}
        />
      ) : (
        <Button
          title="Resend confirmation"
          variant="secondary"
          disabled={offline || !email.success}
          onPress={() => setShowResend(true)}
        />
      )}
      <Button
        title="Go to login"
        variant="ghost"
        disabled={busy}
        onPress={() => router.replace('/login')}
      />
      <Button
        title={converting ? 'Continue as guest while waiting' : 'Back to welcome'}
        variant="ghost"
        disabled={busy}
        onPress={() => router.replace(converting ? '/' : '/welcome')}
      />
    </AuthScreen>
  );
}
