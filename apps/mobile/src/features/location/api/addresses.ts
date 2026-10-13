import type { AddressInput } from '@vivodha/shared/schemas';

import { supabase } from '@/lib/supabase';

/** Minimal create path, used by onboarding today. Step 8 adds list/update/delete/set-default. */
export async function createAddress(userId: string, input: AddressInput): Promise<void> {
  const { error } = await supabase.from('addresses').insert({
    user_id: userId,
    full_name: input.fullName,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2 || null,
    landmark: input.landmark || null,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    label: input.label,
    is_default: input.isDefault,
  });
  if (error) throw error;
}
