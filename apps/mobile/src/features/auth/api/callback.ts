export type AuthCallback =
  | {
      kind: 'session';
      accessToken: string;
      refreshToken: string;
      recovery: boolean;
      conversion: boolean;
    }
  | { kind: 'code'; code: string; recovery: boolean; conversion: boolean }
  | { kind: 'error'; message: string }
  | { kind: 'none' };

export function parseAuthCallback(url: string): AuthCallback {
  const parsed = new URL(url);
  const matches =
    parsed.pathname === '/auth-callback' ||
    parsed.pathname === '/--/auth-callback' ||
    (parsed.protocol === 'vivodha:' && parsed.hostname === 'auth-callback' && !parsed.pathname);
  if (!matches) return { kind: 'none' };
  const values = new URLSearchParams(parsed.hash.slice(1));
  const error = values.get('error') ?? parsed.searchParams.get('error');
  if (error)
    return { kind: 'error', message: 'This email link is invalid or expired. Request a new one.' };
  const recovery =
    values.get('type') === 'recovery' || parsed.searchParams.get('intent') === 'recovery';
  const conversion = parsed.searchParams.get('intent') === 'conversion';
  const accessToken = values.get('access_token');
  const refreshToken = values.get('refresh_token');
  if (accessToken && refreshToken)
    return { kind: 'session', accessToken, refreshToken, recovery, conversion };
  const code = parsed.searchParams.get('code');
  if (code) return { kind: 'code', code, recovery, conversion };
  if (accessToken || refreshToken) {
    return { kind: 'error', message: 'This email link is incomplete. Request a new one.' };
  }
  return { kind: 'none' };
}
