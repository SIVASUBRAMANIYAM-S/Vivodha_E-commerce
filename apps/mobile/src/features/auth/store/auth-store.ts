import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  /** True only until the first getSession() resolves — not a loading flag for later auth actions. */
  isInitializing: boolean;
};

export const useAuthStore = create<AuthState>()(() => ({
  session: null,
  isInitializing: true,
}));

export function useSession(): Session | null {
  return useAuthStore((s) => s.session);
}

export function useIsGuest(): boolean {
  return useAuthStore((s) => s.session?.user.is_anonymous ?? false);
}

/**
 * Call once from the root layout. Session persistence itself is
 * src/lib/supabase.ts's job (secureStorage); this only mirrors the current
 * session into Zustand so screens can read it without calling getSession()
 * themselves. onAuthStateChange's callback must stay synchronous per
 * auth-js's own guidance — it warns against awaiting inside it, since that
 * can deadlock a concurrent call to the client's own auth methods.
 */
export function initAuthStore(): () => void {
  void supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session, isInitializing: false });
  });

  const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, isInitializing: false });
  });

  return () => subscription.subscription.unsubscribe();
}
