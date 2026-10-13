import { useEffect, useState } from 'react';
import { usernameSchema } from '@vivodha/shared/schemas';

import { supabase } from '@/lib/supabase';
import { authErrorMessage } from '../api/auth-errors';

type Availability = {
  value: string;
  status: 'idle' | 'checking' | 'available' | 'taken' | 'error';
  message?: string;
};

export function useUsernameAvailability(username: string, offline: boolean) {
  const [result, setResult] = useState<Availability>({ value: '', status: 'idle' });
  const [attempt, setAttempt] = useState(0);
  const parsed = usernameSchema.safeParse(username);
  const value = parsed.success ? parsed.data : '';
  useEffect(() => {
    if (!value || offline) return;
    let active = true;
    const timer = setTimeout(() => {
      setResult({ value, status: 'checking' });
      void supabase.rpc('username_available', { p_username: value }).then(({ data, error }) => {
        if (!active) return;
        setResult(
          error
            ? { value, status: 'error', message: authErrorMessage(error) }
            : { value, status: data ? 'available' : 'taken' },
        );
      });
    }, 650);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [value, offline, attempt]);
  const current: Availability =
    !value || offline
      ? { value, status: 'idle' }
      : result.value === value
        ? result
        : { value, status: 'checking' };
  return { ...current, retry: () => setAttempt((number) => number + 1) };
}
