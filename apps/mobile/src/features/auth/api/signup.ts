import * as Linking from 'expo-linking';

import type { SignUpInput } from '@vivodha/shared/schemas';

import { supabase } from '@/lib/supabase';

/**
 * Creates a permanent account. Never inserts into usernames/profiles
 * directly — public.sync_signup_identity() (migration 14) reserves the
 * username now and finalizes it (plus full_name/phone) once the email is
 * confirmed, reading exactly this metadata shape off auth.users.
 */
export async function signUp(input: SignUpInput, captchaToken: string) {
  const redirectTo = Linking.createURL('/callback');
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      captchaToken,
      emailRedirectTo: redirectTo,
      data: {
        username: input.username,
        full_name: input.fullName,
        phone: input.phone,
      },
    },
  });
  if (error) throw error;
  return data;
}
