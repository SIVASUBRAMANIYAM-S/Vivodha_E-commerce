import { createServerClient } from '@supabase/ssr';
import type { Database } from '@vivodha/shared/types';
import { cookies } from 'next/headers';

import { getSupabaseEnv } from './env';

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Create a new client per request; never share one across requests.
 */
export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: src/proxy.ts refreshes the session cookies.
        }
      },
    },
  });
}
