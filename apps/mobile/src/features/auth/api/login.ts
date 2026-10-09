import type { LoginInput } from '@vivodha/shared/schemas';

import { supabase } from '@/lib/supabase';

/** Matches username-login's documented response shape (docs/edge-functions.md). */
type UsernameLoginResponse = {
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    expires_in: number;
    token_type: string;
    user: { id: string; email: string | null; is_anonymous: boolean };
  };
};

/**
 * Login accepts a username OR an email in one field. An email goes straight
 * to GoTrue; a username is resolved server-side by the username-login Edge
 * Function, which never returns the resolved email to this client and uses
 * the identical error for an unknown username and a wrong password.
 */
export async function login(input: LoginInput, captchaToken: string) {
  if (input.identifier.includes('@')) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.identifier,
      password: input.password,
      options: { captchaToken },
    });
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase.functions.invoke<UsernameLoginResponse>('username-login', {
    body: { username: input.identifier, password: input.password, captchaToken },
  });
  if (error) throw error;
  if (!data) throw new Error('username-login returned no data');

  const { session } = data;
  const { data: setData, error: setError } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (setError) throw setError;
  return setData;
}
