import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { captchaRequired } from '@/lib/captcha-policy';
import { TurnstileChallenge } from './TurnstileChallenge';
import { parseChallengeMessage } from './turnstile-html';

export function Captcha({
  onToken,
  nonce,
}: {
  onToken: (token: string | null) => void;
  nonce: number;
}) {
  if (!captchaRequired) {
    return (
      <Text color="danger" accessibilityRole="alert">
        DEV only: CAPTCHA is temporarily disabled. Re-enable it before production or CAPTCHA review.
      </Text>
    );
  }
  return <CaptchaAttempt key={nonce} onToken={onToken} nonce={nonce} />;
}

function CaptchaAttempt({
  onToken,
  nonce,
}: {
  onToken: (token: string | null) => void;
  nonce: number;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const siteKey = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;
  const rawOrigin =
    process.env.EXPO_PUBLIC_TURNSTILE_ORIGIN?.trim() || process.env.EXPO_PUBLIC_SUPABASE_URL;
  let origin: string | null = null;
  try {
    if (rawOrigin) {
      const parsed = new URL(rawOrigin);
      if (parsed.protocol === 'https:' && !parsed.username && !parsed.password)
        origin = parsed.origin;
    }
  } catch {
    // Invalid public configuration is shown below rather than mounting a broken WebView.
  }
  const validKey = !!siteKey && /^[A-Za-z0-9_-]+$/.test(siteKey);
  const failed = useCallback(() => {
    onToken(null);
    setExpiresAt(null);
    setMessage(
      'Verification could not load. Check your connection and allowed Turnstile hostname.',
    );
  }, [onToken]);
  const receive = useCallback(
    (data: string) => {
      try {
        const event = parseChallengeMessage(data);
        if (event.type === 'success' && event.token) {
          onToken(event.token);
          setExpiresAt(Date.now() + 110_000);
          setMessage(null);
        } else {
          onToken(null);
          setExpiresAt(null);
          setMessage(
            event.type === 'expired'
              ? 'Verification expired. Please verify again.'
              : 'Verification failed. Try again.',
          );
        }
      } catch {
        failed();
      }
    },
    [failed, onToken],
  );
  useEffect(() => {
    onToken(null);
  }, [nonce, retry, onToken]);
  useEffect(() => {
    if (expiresAt) return;
    const timer = setTimeout(() => {
      setMessage(
        'Verification is taking longer than expected. Complete the challenge or reload it; check the allowed hostname if it keeps failing.',
      );
    }, 45_000);
    return () => clearTimeout(timer);
  }, [expiresAt, retry]);
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setTimeout(
      () => {
        onToken(null);
        setMessage('Verification expired. Please verify again.');
        setExpiresAt(null);
      },
      Math.max(0, expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [expiresAt, onToken]);

  if (!validKey || !origin) {
    return (
      <Text color="danger" accessibilityRole="alert">
        Security verification is not configured. Add the public Turnstile site key and a valid HTTPS
        origin locally, then restart Expo.
      </Text>
    );
  }
  return (
    <View>
      <Text variant="small" color="textSecondary">
        Security verification
      </Text>
      <TurnstileChallenge
        key={`${nonce}-${retry}`}
        siteKey={siteKey}
        origin={origin}
        onMessage={receive}
        onFailure={failed}
      />
      {message ? (
        <Text color="danger" accessibilityRole="alert">
          {message}
        </Text>
      ) : null}
      <Button
        title="Reload verification"
        variant="ghost"
        onPress={() => {
          onToken(null);
          setExpiresAt(null);
          setMessage(null);
          setRetry((value) => value + 1);
        }}
      />
    </View>
  );
}
