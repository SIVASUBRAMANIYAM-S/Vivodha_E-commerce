import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@vivodha/shared/types';

import { getSupabaseEnv } from './env';

/**
 * Supabase client for Client Components.
 * ADR-142: Vivodha's tables live in the `erp` schema, not `public`.
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createBrowserClient<Database, 'erp'>(url, publishableKey, {
    db: { schema: 'erp' },
  });
}
