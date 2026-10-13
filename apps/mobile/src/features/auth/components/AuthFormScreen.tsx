import { emailSchema, loginSchema, passwordSchema, signUpSchema } from '@vivodha/shared/schemas';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useIsOffline } from '@/components/ui/States';
import { captchaRequired } from '@/lib/captcha-policy';
import { radius, spacing, useTheme } from '@/theme';
import { passwordStrength } from '../api/session-route';
import { logIn, resetPassword, setPassword, signUp } from '../api/auth-api';
import { authErrorMessage } from '../api/auth-errors';
import { useUsernameAvailability } from '../hooks/useUsernameAvailability';
import { useAuth } from './AuthProvider';
import { AuthScreen } from './AuthScreen';
import { Captcha } from './Captcha';

type Mode = 'login' | 'signup' | 'forgot' | 'password';
export function AuthFormScreen({ mode }: { mode: Mode }) {
  const { session, recovery, finishRecovery } = useAuth();
  const { colors } = useTheme();
  const offline = useIsOffline();
  const [values, setValues] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    identifier: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [sent, setSent] = useState(false);
  const availability = useUsernameAvailability(mode === 'signup' ? values.username : '', offline);
  const converting = mode === 'signup' && session?.user.is_anonymous === true;
  const needsCaptcha = mode !== 'password' && !converting;
  const title = {
    login: 'Welcome back',
    signup: 'Create your account',
    forgot: 'Reset your password',
    password: 'Set your password',
  }[mode];
  const pendingConversion = session?.user.user_metadata.account_conversion_pending === true;

  function change(field: keyof typeof values, text: string) {
    setValues((current) => ({ ...current, [field]: text }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }
  async function submit() {
    setError(null);
    const parsed =
      mode === 'signup'
        ? signUpSchema.safeParse(values)
        : mode === 'login'
          ? loginSchema.safeParse(values)
          : mode === 'forgot'
            ? emailSchema.safeParse(values.email)
            : passwordSchema.safeParse(values.password);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? (mode === 'forgot' ? 'email' : 'password'));
        next[field] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    if (mode === 'password' && values.password !== values.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const result = await signUp(values, token ?? '');
        setValues((current) => ({ ...current, password: '' }));
        router.replace({
          pathname: '/check-email',
          params: { email: result.email, conversion: result.converting ? '1' : '0' },
        });
      } else if (mode === 'login') {
        await logIn(values, token ?? '');
        setValues((current) => ({ ...current, password: '' }));
        router.replace('/');
      } else if (mode === 'forgot') {
        await resetPassword(values.email, token ?? '');
        setSent(true);
      } else {
        await setPassword(values.password, pendingConversion);
        setValues((current) => ({ ...current, password: '', confirmPassword: '' }));
        finishRecovery();
        router.replace('/');
      }
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setBusy(false);
      setToken(null);
      setNonce((value) => value + 1);
    }
  }

  if (mode === 'password' && (!session || (!recovery && !pendingConversion))) {
    return (
      <AuthScreen
        title={title}
        description="Open your confirmation or password-reset email link first."
      >
        <Button
          title="Request a new reset link"
          onPress={() => router.replace('/forgot-password')}
        />
        <Button
          title="Back to welcome"
          variant="ghost"
          onPress={() => router.replace('/welcome')}
        />
      </AuthScreen>
    );
  }
  if (sent)
    return (
      <AuthScreen
        title="Check your email"
        description="If an account exists for that email, we have sent a password-reset link. Open it on this device."
      >
        <Button title="Send another link" disabled={offline} onPress={() => setSent(false)} />
        <Button title="Back to login" variant="ghost" onPress={() => router.replace('/login')} />
      </AuthScreen>
    );

  const strength = passwordStrength(values.password);
  const password = (
    <View style={styles.fields}>
      <Input
        label="Password"
        value={values.password}
        onChangeText={(text) => change('password', text)}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        error={errors.password}
        editable={!busy && !offline}
      />
      <Button
        title={visible ? 'Hide password' : 'Show password'}
        variant="ghost"
        onPress={() => setVisible((value) => !value)}
      />
      {mode !== 'login' ? (
        <>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Password strength"
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={strength.level}
            aria-valuetext={strength.label}
            accessibilityValue={{ min: 0, max: 4, now: strength.level, text: strength.label }}
            style={styles.meter}
          >
            {[1, 2, 3, 4].map((level) => (
              <View
                key={level}
                style={[
                  styles.segment,
                  { backgroundColor: strength.level >= level ? colors.primary : colors.border },
                ]}
              />
            ))}
          </View>
          <Text variant="small" color="textSecondary" accessibilityLiveRegion="polite">
            Password strength: {strength.label}. Use at least 8 characters.
          </Text>
        </>
      ) : null}
    </View>
  );
  return (
    <AuthScreen
      title={title}
      description={
        converting
          ? 'Keep your guest cart and addresses. Confirm your email, then enter a password again to finish; we never save passwords.'
          : mode === 'forgot'
            ? 'We will email a secure reset link. No OTP required.'
            : undefined
      }
    >
      {mode === 'signup' ? (
        <>
          <Input
            label="Full name"
            value={values.fullName}
            onChangeText={(text) => change('fullName', text)}
            autoComplete="name"
            error={errors.fullName}
            editable={!busy && !offline}
            maxLength={100}
          />
          <Input
            label="Username"
            value={values.username}
            onChangeText={(text) => change('username', text.toLowerCase())}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            error={
              errors.username ||
              (availability.status === 'taken' ? 'This username is taken.' : undefined)
            }
            helper={
              availability.status === 'checking'
                ? 'Checking availability…'
                : availability.status === 'available'
                  ? 'Username available'
                  : '3–20 lowercase letters, numbers or underscore'
            }
            editable={!busy && !offline}
          />
          {availability.status === 'error' ? (
            <>
              <Text color="danger">{availability.message}</Text>
              <Button
                title="Retry username check"
                variant="secondary"
                disabled={offline}
                onPress={availability.retry}
              />
            </>
          ) : null}
        </>
      ) : null}
      {mode === 'login' ? (
        <Input
          label="Username or email"
          value={values.identifier}
          onChangeText={(text) => change('identifier', text)}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          error={errors.identifier}
          editable={!busy && !offline}
        />
      ) : null}
      {mode === 'signup' || mode === 'forgot' ? (
        <Input
          label="Email"
          value={values.email}
          onChangeText={(text) => change('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          error={errors.email}
          editable={!busy && !offline}
        />
      ) : null}
      {mode !== 'forgot' ? password : null}
      {mode === 'password' ? (
        <Input
          label="Confirm password"
          value={values.confirmPassword}
          onChangeText={(text) => change('confirmPassword', text)}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.confirmPassword}
          editable={!busy && !offline}
        />
      ) : null}
      {mode === 'signup' ? (
        <Input
          label="Delivery phone"
          value={values.phone}
          onChangeText={(text) => change('phone', text.replace(/\D/g, ''))}
          keyboardType="phone-pad"
          autoComplete="tel"
          maxLength={10}
          error={errors.phone}
          helper="10-digit Indian mobile number, used for delivery only."
          editable={!busy && !offline}
        />
      ) : null}
      {needsCaptcha ? <Captcha nonce={nonce} onToken={setToken} /> : null}
      {error ? (
        <Text color="danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Button
        title={
          {
            login: 'Log in',
            signup: 'Create account',
            forgot: 'Send reset link',
            password: 'Save password',
          }[mode]
        }
        loading={busy}
        disabled={
          offline ||
          (needsCaptcha && captchaRequired && !token) ||
          (mode === 'signup' && availability.status !== 'available')
        }
        onPress={() => void submit()}
      />
      {mode === 'login' ? (
        <Button
          title="Forgot password?"
          variant="ghost"
          disabled={busy}
          onPress={() => router.push('/forgot-password')}
        />
      ) : null}
      {mode === 'signup' ? (
        <Button
          title="Already have an account? Log in"
          variant="ghost"
          disabled={busy}
          onPress={() => router.replace('/login')}
        />
      ) : null}
      {mode === 'login' ? (
        <Button
          title="Create an account"
          variant="ghost"
          disabled={busy}
          onPress={() => router.replace('/signup')}
        />
      ) : null}
      <Button
        title={session ? 'Back to your account' : 'Back to welcome'}
        variant="ghost"
        disabled={busy}
        onPress={() => router.replace(session ? '/account' : '/welcome')}
      />
    </AuthScreen>
  );
}
const styles = StyleSheet.create({
  fields: { gap: spacing.xs },
  meter: { flexDirection: 'row', gap: spacing.xs },
  segment: { height: spacing.xs, flex: 1, borderRadius: radius.badge },
});
