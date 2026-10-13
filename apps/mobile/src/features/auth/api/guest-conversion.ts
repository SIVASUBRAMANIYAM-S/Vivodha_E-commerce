import type { SignUpInput } from '@vivodha/shared/schemas';
import { supabase } from '@/lib/supabase';
import { signUp } from './auth-api';

export async function convertGuestToAccount(input: SignUpInput): Promise<void> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.user.is_anonymous) throw new Error('NOT_ANONYMOUS');
  await signUp(input, '');
}
