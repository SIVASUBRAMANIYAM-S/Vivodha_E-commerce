import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

// Next.js 16 renamed middleware.ts to proxy.ts (same behaviour).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip static assets and image optimisation files.
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
