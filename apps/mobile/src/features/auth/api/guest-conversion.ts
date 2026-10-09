import * as Linking from 'expo-linking';

import type { SignUpInput } from '@vivodha/shared/schemas';

import { supabase } from '@/lib/supabase';

/**
 * Converts the current anonymous (guest) session into a permanent account,
 * keeping the same user id — so the local cart and every addresses/orders
 * row already tied to that id carry over with no migration code. Sequence
 * and reasoning: docs/decisions.md ADR-150-adjacent note on guest conversion.
 */
export async function convertGuestToAccount(input: SignUpInput): Promise<void> {
  // 1. Never attempt this before a session is confirmed present — calling
  // updateUser immediately after signInAnonymously() can otherwise race
  // ahead of the client's own session being set.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user.is_anonymous) {
    throw new Error('NOT_ANONYMOUS');
  }

  // 2. One updateUser call carries both the pending email change and the
  // metadata public.sync_signup_identity() (migration 14) reads. The
  // metadata applies immediately (reserving the username); the email stays
  // "pending" until the confirmation link below is opened. updateUser has
  // no captchaToken option — this call needs none, since the session being
  // updated was itself already Turnstile-verified when it was created.
  const redirectTo = Linking.createURL('/callback');
  const { error } = await supabase.auth.updateUser(
    {
      email: input.email,
      password: input.password,
      data: {
        username: input.username,
        full_name: input.fullName,
        phone: input.phone,
      },
    },
    { emailRedirectTo: redirectTo },
  );
  // A GoTrue email-uniqueness error surfaces here distinctly (mapped to
  // EMAIL_TAKEN by mapAuthError) — this can never silently merge into an
  // existing account under that email; the guest's cart/addresses only ever
  // move with *this* user id.
  if (error) throw error;

  // 3. The user taps the confirmation link. GoTrue's own /verify endpoint —
  // not this client — sets email_confirmed_at and flips is_anonymous to
  // false server-side. That update is exactly what sync_signup_identity's
  // trigger condition listens for, so the username/profile finalize happens
  // there, independent of whether the deep link reopens this app.
  //
  // 4-5. app/(auth)/callback.tsx picks up from here: exchangeCodeForSession,
  // then (only once the email is verified) updateUser({ password }) is not
  // needed again — the password was already set in step 2.
}
