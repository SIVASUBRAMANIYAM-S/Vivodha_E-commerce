import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { USERNAME_AVAILABILITY_DEBOUNCE_MS } from '@vivodha/shared/constants';
import { usernameSchema } from '@vivodha/shared/schemas';

import { supabase } from '@/lib/supabase';

/**
 * Debounces the raw input, validates it against usernameSchema, and only
 * then queries the username_available RPC — so a half-typed username never
 * burns a request or flashes a false "taken" while the user is still typing.
 */
export function useUsernameAvailable(rawUsername: string) {
  const [debounced, setDebounced] = useState(rawUsername);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(rawUsername), USERNAME_AVAILABILITY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [rawUsername]);

  const parsed = usernameSchema.safeParse(debounced);
  const username = parsed.success ? parsed.data : null;

  const query = useQuery({
    queryKey: ['username-available', username],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('username_available', { p_username: username! });
      if (error) throw error;
      return data;
    },
    enabled: username !== null,
    staleTime: 0,
    gcTime: 0,
  });

  return {
    /** Still waiting on the debounce window or an invalid/empty username — show no verdict. */
    isPending: username === null || query.isFetching,
    isAvailable: username !== null && query.data === true ? true : null,
    isTaken: username !== null && query.data === false ? true : null,
  };
}
