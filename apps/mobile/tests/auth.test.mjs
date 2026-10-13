import assert from 'node:assert/strict';
import test from 'node:test';

import { parseAuthCallback } from '../src/features/auth/api/callback.ts';
import { authErrorMessage } from '../src/features/auth/api/auth-errors.ts';
import { needsPassword, passwordStrength } from '../src/features/auth/api/session-route.ts';
import {
  parseChallengeMessage,
  turnstileHtml,
} from '../src/features/auth/components/turnstile-html.ts';
import {
  signUpSchema,
  phoneSchema,
  usernameSchema,
  loginSchema,
  isDevCaptchaDisabled,
  authCaptchaOptions,
} from '@vivodha/shared/schemas';

test('CAPTCHA exception requires explicit opt-in, the exact DEV project and a development build', () => {
  const dev = 'https://nzltgmfodazrhrxufpwe.supabase.co';
  assert.equal(isDevCaptchaDisabled('true', dev, true), true);
  assert.equal(isDevCaptchaDisabled('true', `${dev}/`, true), true);
  for (const [setting, url, development] of [
    [undefined, dev, true],
    ['false', dev, true],
    ['TRUE', dev, true],
    ['true', dev, false],
    ['true', undefined, true],
    ['true', 'https://production.supabase.co', true],
    ['true', `${dev}.example.com`, true],
    ['true', `${dev}/other`, true],
    ['true', 'http://nzltgmfodazrhrxufpwe.supabase.co', true],
  ]) {
    assert.equal(isDevCaptchaDisabled(setting, url, development), false);
  }
});

test('auth options require genuine tokens by default and omit tokens in opted-in DEV', () => {
  assert.throws(() => authCaptchaOptions(null, true), /Complete verification/);
  assert.throws(() => authCaptchaOptions('', true), /Complete verification/);
  assert.deepEqual(authCaptchaOptions('genuine-token', true), { captchaToken: 'genuine-token' });
  assert.equal(JSON.stringify(authCaptchaOptions(null, false)), '{}');
  assert.equal(JSON.stringify(authCaptchaOptions('stale-token', false)), '{}');
});

test('native signup callback extracts tokens without exposing them in navigation', () => {
  assert.deepEqual(
    parseAuthCallback(
      'vivodha://auth-callback#access_token=test-access&refresh_token=test-refresh&type=signup',
    ),
    {
      kind: 'session',
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
      recovery: false,
      conversion: false,
    },
  );
});

test('Expo Go password recovery and conversion redirects preserve intent', () => {
  assert.deepEqual(
    parseAuthCallback(
      'exp://192.0.2.1:8081/--/auth-callback?intent=recovery#access_token=test&refresh_token=test-refresh',
    ),
    {
      kind: 'session',
      accessToken: 'test',
      refreshToken: 'test-refresh',
      recovery: true,
      conversion: false,
    },
  );
  assert.deepEqual(parseAuthCallback('vivodha://auth-callback?intent=conversion&code=test-code'), {
    kind: 'code',
    code: 'test-code',
    conversion: true,
    recovery: false,
  });
});

test('callback parser rejects expired and incomplete links and ignores other routes', () => {
  assert.equal(parseAuthCallback('vivodha://auth-callback#error=access_denied').kind, 'error');
  assert.equal(parseAuthCallback('vivodha://auth-callback#access_token=test').kind, 'error');
  assert.equal(
    parseAuthCallback('vivodha://product/auth-callback-fake#access_token=test').kind,
    'none',
  );
  assert.equal(parseAuthCallback('vivodha://home').kind, 'none');
  assert.equal(parseAuthCallback('http://localhost:8081/auth-callback?code=test').kind, 'code');
});

test('guest conversion cannot reach password setup until email confirmation', () => {
  const metadata = { account_conversion_pending: true };
  assert.equal(
    needsPassword(
      { is_anonymous: true, email_confirmed_at: undefined, user_metadata: metadata },
      false,
    ),
    false,
  );
  assert.equal(
    needsPassword(
      { is_anonymous: false, email_confirmed_at: '2026-10-13', user_metadata: metadata },
      false,
    ),
    true,
  );
  assert.equal(
    needsPassword(
      { is_anonymous: false, email_confirmed_at: '2026-10-13', user_metadata: {} },
      false,
    ),
    false,
  );
  assert.equal(needsPassword({ is_anonymous: false, user_metadata: {} }, true), true);
});

test('password strength thresholds agree with the eight-character minimum', () => {
  assert.equal(passwordStrength('').level, 0);
  assert.equal(passwordStrength('1234567').label, 'Too short');
  assert.equal(passwordStrength('password').level, 2);
  assert.equal(passwordStrength('password12').level, 3);
  assert.equal(passwordStrength('Password12!long').level, 4);
});

test('shared signup validates profile constraints before server submission', () => {
  const valid = {
    fullName: 'Test Shopper',
    username: 'test_shopper',
    email: 'test@example.com',
    password: 'Password12!',
    phone: '9876543210',
  };
  assert.equal(signUpSchema.safeParse(valid).success, true);
  assert.equal(signUpSchema.safeParse({ ...valid, fullName: 'a'.repeat(101) }).success, false);
  assert.equal(signUpSchema.safeParse({ ...valid, password: 'short' }).success, false);
  assert.equal(phoneSchema.safeParse('1234567890').success, false);
  assert.equal(usernameSchema.safeParse('invalid-name').success, false);
  assert.equal(loginSchema.safeParse({ identifier: 'bad@', password: 'test' }).success, false);
  assert.equal(loginSchema.safeParse({ identifier: 'VALID_NAME', password: 'test' }).success, true);
});

test('challenge response accepts only bounded tokens and known events', () => {
  assert.deepEqual(parseChallengeMessage('{"type":"success","token":"test-token"}'), {
    type: 'success',
    token: 'test-token',
  });
  assert.deepEqual(parseChallengeMessage('{"type":"expired"}'), { type: 'expired' });
  assert.throws(() => parseChallengeMessage('{"type":"success","token":""}'));
  assert.throws(() =>
    parseChallengeMessage(JSON.stringify({ type: 'success', token: 'x'.repeat(4097) })),
  );
  assert.throws(() => parseChallengeMessage('{"type":"unknown"}'));
  assert.throws(() => parseChallengeMessage('bad json'));
});

test('challenge markup cannot interpolate a script through the public key', () => {
  assert.throws(() => turnstileHtml('</script>', { surface: 'white', textPrimary: 'black' }));
  const html = turnstileHtml('test-site-key', { surface: 'white', textPrimary: 'black' });
  assert.match(html, /expired-callback/);
  assert.match(html, /error-callback/);
  assert.match(html, /challenges\.cloudflare\.com/);
});

test('friendly auth errors do not display raw credential errors', () => {
  assert.equal(authErrorMessage({ code: 'invalid_credentials' }), 'Invalid username or password.');
  assert.match(authErrorMessage({ code: 'email_not_confirmed' }), /Confirm your email/);
  assert.match(authErrorMessage({ code: 'captcha_failed' }), /Verification failed/);
  assert.match(authErrorMessage({ code: 'RATE_LIMITED' }), /Too many/);
  assert.match(authErrorMessage(new Error('Failed to fetch')), /connection/);
});
