import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useCartStore } from '@/features/cart/store/cart-store';
import { queryClient } from '@/lib/query-client';
import { supabase } from '@/lib/supabase';

import { authErrorMessage } from '../api/auth-errors';
import { parseAuthCallback } from '../api/callback';

type AuthState = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  recovery: boolean;
  retry: () => void;
  finishRecovery: () => void;
  dismissError: () => void;
};
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const lastUserId = useRef<string | null | undefined>(undefined);
  const consumedLink = useRef<string | null>(null);
  const recoveryEvent = useRef(false);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const finishRecovery = useCallback(() => setRecovery(false), []);
  const dismissError = useCallback(() => setError(null), []);

  useEffect(() => {
    let active = true;
    const apply = (next: Session | null) => {
      if (!active) return;
      const id = next?.user.id ?? null;
      if (lastUserId.current !== undefined && lastUserId.current !== id) queryClient.clear();
      lastUserId.current = id;
      setSession(next);
    };
    const bindCart = () => {
      if (lastUserId.current !== undefined) {
        useCartStore.getState().bindOwner(lastUserId.current);
      }
    };
    const unsubscribeHydration = useCartStore.persist.onFinishHydration(bindCart);
    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      apply(next);
      if (useCartStore.persist.hasHydrated()) bindCart();
      if (event === 'PASSWORD_RECOVERY') {
        recoveryEvent.current = true;
        setRecovery(true);
      }
      if (event === 'SIGNED_IN') setError(null);
      if (event === 'SIGNED_OUT') {
        recoveryEvent.current = false;
        setRecovery(false);
      }
    });

    async function consume(url: string): Promise<boolean> {
      const callback = parseAuthCallback(url);
      if (callback.kind === 'none') return false;
      if (consumedLink.current === url) {
        if (active) router.replace('/');
        return true;
      }
      if (callback.kind === 'error') throw new Error(callback.message);
      recoveryEvent.current = false;
      const result =
        callback.kind === 'session'
          ? await supabase.auth.setSession({
              access_token: callback.accessToken,
              refresh_token: callback.refreshToken,
            })
          : await supabase.auth.exchangeCodeForSession(callback.code);
      if (result.error) throw result.error;
      consumedLink.current = url;
      const isRecovery = callback.recovery || recoveryEvent.current;
      if (active) {
        setError(null);
        apply(result.data.session);
        setRecovery(isRecovery);
        if (isRecovery || callback.conversion) router.replace('/set-password');
        else router.replace('/');
      }
      return true;
    }

    async function restore() {
      setLoading(true);
      setError(null);
      try {
        const url = await Linking.getInitialURL();
        if (url && (await consume(url))) return;
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (data.session) {
          const { data: verified, error: verifyError } = await supabase.auth.getUser();
          if (verifyError) throw verifyError;
          apply({ ...data.session, user: verified.user });
        } else apply(null);
        if (useCartStore.persist.hasHydrated()) bindCart();
      } catch (failure) {
        if (active) setError(authErrorMessage(failure));
      } finally {
        if (active) setLoading(false);
      }
    }
    const links = Linking.addEventListener('url', ({ url }) => {
      void consume(url).catch((failure: unknown) => {
        if (active) {
          setError(authErrorMessage(failure));
          router.replace('/auth-callback');
        }
      });
    });
    void restore();
    return () => {
      active = false;
      listener.subscription.unsubscribe();
      links.remove();
      unsubscribeHydration();
    };
  }, [attempt]);

  return (
    <AuthContext.Provider
      value={{ session, loading, error, recovery, retry, finishRecovery, dismissError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider is missing.');
  return auth;
}
