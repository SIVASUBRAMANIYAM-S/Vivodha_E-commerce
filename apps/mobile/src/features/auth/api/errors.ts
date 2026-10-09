import { parseFunctionError } from '@/lib/function-error';

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'EMAIL_TAKEN'
  | 'USERNAME_TAKEN'
  | 'CAPTCHA_FAILED'
  | 'CAPTCHA_CANCELLED'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'NOT_ANONYMOUS'
  | 'UNKNOWN';

export type FriendlyAuthError = { code: AuthErrorCode; message: string };

const MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'Incorrect username/email or password.',
  EMAIL_NOT_CONFIRMED: 'Please confirm your email before logging in.',
  EMAIL_TAKEN: 'This email is already registered — log in instead?',
  USERNAME_TAKEN: 'That username is already taken.',
  CAPTCHA_FAILED: "That check didn't go through. Please try again.",
  CAPTCHA_CANCELLED: 'Verification was cancelled.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  NETWORK: 'Check your connection and try again.',
  NOT_ANONYMOUS: 'This action is only available for a guest session.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

function friendly(code: AuthErrorCode): FriendlyAuthError {
  return { code, message: MESSAGES[code] };
}

/** GoTrue's own error codes (AuthApiError#code), duck-typed at runtime — see note below. */
const GOTRUE_CODE_MAP: Record<string, AuthErrorCode> = {
  invalid_credentials: 'INVALID_CREDENTIALS',
  email_not_confirmed: 'EMAIL_NOT_CONFIRMED',
  user_already_exists: 'EMAIL_TAKEN',
  email_exists: 'EMAIL_TAKEN',
  email_address_not_authorized: 'EMAIL_TAKEN',
  captcha_failed: 'CAPTCHA_FAILED',
  over_request_rate_limit: 'RATE_LIMITED',
  over_email_send_rate_limit: 'RATE_LIMITED',
  over_sms_send_rate_limit: 'RATE_LIMITED',
};

/** username-login Edge Function error codes that reuse the same friendly strings. */
const FUNCTION_CODE_MAP: Record<string, AuthErrorCode> = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  CAPTCHA_FAILED: 'CAPTCHA_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
};

/**
 * Turns a GoTrue AuthError, the username-login Edge Function's error, or this
 * feature's own thrown sentinel errors (TurnstileGate, guest-conversion) into
 * one friendly message. Unknown-username and wrong-password converge on the
 * identical INVALID_CREDENTIALS string, whichever path produced them.
 *
 * @vivodha/supabase-js's public entry point doesn't re-export the AuthError
 * class or its isAuthError()/isAuthRetryableFetchError() type guards (only
 * @supabase/auth-js — a transitive, undeclared dependency — has them), so
 * GoTrue errors are detected by duck-typing `error.name`/`.code`, which are
 * stable at runtime (set via `this.name = '...'` in auth-js's own source).
 */
export async function mapAuthError(error: unknown): Promise<FriendlyAuthError> {
  if (error instanceof Error) {
    if (error.message === 'CAPTCHA_CANCELLED') return friendly('CAPTCHA_CANCELLED');
    if (error.message === 'CAPTCHA_EXPIRED' || error.message.startsWith('CAPTCHA_FAILED:')) {
      return friendly('CAPTCHA_FAILED');
    }
    if (error.message === 'NOT_ANONYMOUS') return friendly('NOT_ANONYMOUS');
  }

  const functionError = await parseFunctionError(error);
  if (functionError) {
    return friendly(FUNCTION_CODE_MAP[functionError.code] ?? 'UNKNOWN');
  }

  if (error instanceof Error) {
    if (error.name === 'AuthRetryableFetchError') return friendly('NETWORK');
    if (error.name === 'AuthApiError' || error.name === 'AuthError') {
      const code = (error as Error & { code?: string }).code;
      if (code && GOTRUE_CODE_MAP[code]) return friendly(GOTRUE_CODE_MAP[code]);
    }
    // React Native's fetch throws a bare TypeError on a dropped connection.
    if (error instanceof TypeError) return friendly('NETWORK');
  }

  return friendly('UNKNOWN');
}
