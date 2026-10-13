import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../packages/shared/src/types/database.ts';
import {
  isDevCaptchaDisabled,
  usernameLoginRequestSchema,
  usernameLoginResponseSchema,
} from '../../../packages/shared/src/schemas/auth-api.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function failure(code: string, message: string, status: number) {
  return json({ error: { code, message } }, status);
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createUsernameLoginHandler(config: {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  devDisableCaptcha?: string;
  fetch?: typeof fetch;
}) {
  const options = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: config.fetch ?? fetch },
  };
  const backend = createClient<Database>(config.url, config.serviceRoleKey, options);
  const captchaRequired = !isDevCaptchaDisabled(config.devDisableCaptcha, config.url, true);

  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== 'POST') return failure('METHOD_NOT_ALLOWED', 'Use POST.', 405);
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return failure('INVALID_INPUT', 'Send a JSON request.', 400);
    }

    try {
      const body = await request.text();
      if (body.length > 8192) return failure('INVALID_INPUT', 'Request is too large.', 413);
      let input: unknown;
      try {
        input = JSON.parse(body);
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        return failure('INVALID_INPUT', 'Send valid JSON.', 400);
      }
      const parsed = usernameLoginRequestSchema.safeParse(input);
      if (!parsed.success) return failure('INVALID_INPUT', 'Check your login details.', 400);
      const { username, password, captchaToken } = parsed.data;
      if (captchaRequired && !captchaToken) {
        return failure('CAPTCHA_FAILED', 'Complete verification before logging in.', 400);
      }

      const forwarded = request.headers.get('x-forwarded-for');
      const subject = forwarded?.split(',')[0]?.trim();
      if (!subject) {
        console.error('username-login: missing gateway client address');
        return failure('SERVICE_UNAVAILABLE', 'Login is temporarily unavailable. Try again.', 503);
      }
      for (const [scope, value, limit] of [
        ['username-login-ip', subject, 20],
        ['username-login-name', username, 10],
      ] as const) {
        const { data: allowed, error } = await backend.rpc('consume_request_limit', {
          p_scope: scope,
          p_subject: await digest(value),
          p_limit: limit,
          p_window_seconds: 60,
        });
        if (error) {
          console.error('username-login: rate limiter failed');
          return failure(
            'SERVICE_UNAVAILABLE',
            'Login is temporarily unavailable. Try again.',
            503,
          );
        }
        if (!allowed)
          return failure('RATE_LIMITED', 'Too many attempts. Try again in a minute.', 429);
      }

      const { data: identity, error: identityError } = await backend
        .from('usernames')
        .select('user_id')
        .eq('username', username)
        .maybeSingle();
      if (identityError) {
        console.error('username-login: identity lookup failed');
        return failure('SERVICE_UNAVAILABLE', 'Login is temporarily unavailable. Try again.', 503);
      }
      let email: string | undefined;
      if (identity) {
        const { data, error } = await backend.auth.admin.getUserById(identity.user_id);
        if (error) {
          console.error('username-login: auth identity lookup failed');
          return failure(
            'SERVICE_UNAVAILABLE',
            'Login is temporarily unavailable. Try again.',
            503,
          );
        }
        email = data.user.email;
      }

      // Unknown usernames still take the Auth/CAPTCHA path; no identity data leaves this endpoint.
      const authClient = createClient<Database>(config.url, config.anonKey, options);
      const { data, error } = await authClient.auth.signInWithPassword({
        email: email ?? `${await digest(username)}@invalid.example`,
        password,
        options: { captchaToken },
      });
      if (error || !email || !data.session) {
        if (error?.code === 'captcha_failed') {
          return failure('CAPTCHA_FAILED', 'Verification failed. Please verify again.', 400);
        }
        if (error?.status === 429) {
          return failure('RATE_LIMITED', 'Too many attempts. Try again in a minute.', 429);
        }
        if (error && (!error.status || error.status >= 500)) {
          console.error('username-login: auth service unavailable');
          return failure(
            'SERVICE_UNAVAILABLE',
            'Login is temporarily unavailable. Try again.',
            503,
          );
        }
        return failure('INVALID_CREDENTIALS', 'Invalid username or password', 401);
      }

      const response = usernameLoginResponseSchema.safeParse({
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          token_type: data.session.token_type,
        },
      });
      if (!response.success) {
        console.error('username-login: invalid auth session response');
        return failure('SERVICE_UNAVAILABLE', 'Login is temporarily unavailable. Try again.', 503);
      }
      return json(response.data, 200);
    } catch {
      console.error('username-login: unexpected request failure');
      return failure('SERVICE_UNAVAILABLE', 'Login is temporarily unavailable. Try again.', 503);
    }
  };
}
