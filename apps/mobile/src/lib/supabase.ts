import { createClient, type Session } from '@supabase/supabase-js';
import type { Database } from '@vivodha/shared/types';
import { AppState, Platform } from 'react-native';

import { secureStorage } from './secure-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy apps/mobile/.env.example to apps/mobile/.env.',
  );
}

/**
 * Client-safe Supabase client. Only the publishable key ever ships in the app.
 * ADR-142: Vivodha's tables live in the `erp` schema, not `public` (this
 * project's database is shared with another app that owns `public`).
 */
export const supabase = createClient<Database, 'erp'>(supabaseUrl, supabasePublishableKey, {
  db: { schema: 'erp' },
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Refresh tokens only while the app is in the foreground (Supabase React Native guidance).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}

/**
 * Returns the current session, or creates an anonymous (guest) session.
 * Guests can browse and order. Anonymous sign-in must be enabled in the Supabase dashboard.
 * Wired into onboarding in Phase 4.
 */
export async function ensureGuestSession(): Promise<Session> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data.session) return data.session;

  const { data: anon, error: anonError } = await supabase.auth.signInAnonymously();
  if (anonError) throw anonError;
  if (!anon.session) throw new Error('Anonymous sign-in returned no session');
  return anon.session;
}
