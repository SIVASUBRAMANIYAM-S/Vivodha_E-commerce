import { supabase } from '@/lib/supabase';
import { setPassword } from './auth-api';

export { resetPassword as requestPasswordReset } from './auth-api';

export async function setNewPassword(password: string) {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  await setPassword(password, data.session?.user.user_metadata.account_conversion_pending === true);
}
