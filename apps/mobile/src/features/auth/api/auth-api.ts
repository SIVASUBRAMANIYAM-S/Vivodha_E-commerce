import { FunctionsHttpError } from '@supabase/supabase-js';
import {
  emailSchema,
  loginSchema,
  passwordSchema,
  signUpSchema,
  usernameLoginResponseSchema,
  type LoginInput,
  type SignUpInput,
} from '@vivodha/shared/schemas';
import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';
import { captchaOptions } from '@/lib/captcha-policy';

export function authRedirectUrl(intent?: 'conversion' | 'recovery') {
  return Linking.createURL('auth-callback', {
    queryParams: intent ? { intent } : undefined,
  });
}

export async function logIn(input: LoginInput, captchaToken: string) {
  const { identifier, password } = loginSchema.parse(input);
  const options = captchaOptions(captchaToken);
  if (identifier.includes('@')) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailSchema.parse(identifier),
      password,
      options,
    });
    if (error) throw error;
    if (!data.session) throw new Error('Login returned no session. Please try again.');
    return;
  }
  const { data, error } = await supabase.functions.invoke('username-login', {
    body: { username: identifier.toLowerCase(), password, ...options },
  });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body: unknown = await error.context.json();
      if (
        body &&
        typeof body === 'object' &&
        'error' in body &&
        body.error &&
        typeof body.error === 'object' &&
        'code' in body.error &&
        typeof body.error.code === 'string'
      ) {
        throw Object.assign(new Error('Login failed'), { code: body.error.code });
      }
    }
    throw error;
  }
  const response = usernameLoginResponseSchema.parse(data);
  const { error: sessionError } = await supabase.auth.setSession(response.session);
  if (sessionError) throw sessionError;
}

export async function signUp(input: SignUpInput, captchaToken: string) {
  const values = signUpSchema.parse(input);
  const { data: current, error: currentError } = await supabase.auth.getSession();
  if (currentError) throw currentError;
  const converting = current.session?.user.is_anonymous === true;
  if (current.session && !converting) throw new Error('Log out before creating another account.');
  const metadata = {
    username: values.username,
    full_name: values.fullName,
    phone: values.phone,
    account_conversion_pending: converting,
  };
  if (converting) {
    // Supabase requires verified email before an anonymous user can add a password.
    // Do not retain the entered password; ask for it again after confirmation.
    const { error } = await supabase.auth.updateUser(
      { email: values.email, data: metadata },
      { emailRedirectTo: authRedirectUrl('conversion') },
    );
    if (error) throw error;
  } else {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: metadata,
        ...captchaOptions(captchaToken),
        emailRedirectTo: authRedirectUrl(),
      },
    });
    if (error) throw error;
  }
  return { converting, email: values.email };
}

export async function resetPassword(email: string, captchaToken: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(emailSchema.parse(email), {
    redirectTo: authRedirectUrl('recovery'),
    ...captchaOptions(captchaToken),
  });
  if (error) throw error;
}

export async function setPassword(password: string, converting: boolean) {
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!data.user.email_confirmed_at) throw new Error('Confirm your email first.');
  const { error } = await supabase.auth.updateUser({
    password: passwordSchema.parse(password),
    ...(converting ? { data: { account_conversion_pending: false } } : {}),
  });
  if (error) throw error;
}

export async function logOut() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}
