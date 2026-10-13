import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '../components/AuthProvider';

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) throw new Error('Sign in to view your profile.');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      const { data: identity, error: identityError } = await supabase
        .from('usernames')
        .select('username')
        .eq('user_id', userId)
        .maybeSingle();
      if (identityError) throw identityError;
      return { ...profile, username: identity?.username ?? null };
    },
  });
}
