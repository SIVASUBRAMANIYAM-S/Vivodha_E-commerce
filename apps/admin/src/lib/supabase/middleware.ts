import { createServerClient } from '@supabase/ssr';
import type { Database } from '@vivodha/shared/types';
import { NextResponse, type NextRequest } from 'next/server';

import { getSupabaseEnv } from './env';

/**
 * Refreshes the Supabase auth session on every request (called from src/proxy.ts).
 * Phase 2 adds the admin-role check and redirects unauthenticated users to /login.
 */
export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Do not run code between createServerClient and getClaims(): it validates the JWT
  // and triggers the token refresh that keeps the session cookie alive.
  await supabase.auth.getClaims();

  return response;
}
