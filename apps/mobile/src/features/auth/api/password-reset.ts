import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';

export async function requestPasswordReset(email: string, captchaToken: string) {
  const redirectTo = Linking.createURL('/callback');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo, captchaToken });
  if (error) throw error;
}

/**
 * Only valid once app/(auth)/callback.tsx has exchanged a 'recovery' code for
 * a session — GoTrue requires the email to be verified before a password can
 * be set, which is exactly what that exchange does.
 */
export async function setNewPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
