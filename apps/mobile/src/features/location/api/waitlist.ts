import type { PincodeWaitlistInput } from '@vivodha/shared/schemas';

import { supabase } from '@/lib/supabase';

/** Insert-only for customers (migration 14); a duplicate pincode+contact is a friendly no-op. */
export async function joinPincodeWaitlist(input: PincodeWaitlistInput): Promise<void> {
  const { error } = await supabase.from('pincode_waitlist').insert({
    pincode: input.pincode,
    email: input.email || null,
    phone: input.phone || null,
  });
  if (error && error.code !== '23505') throw error;
}
