export function authErrorMessage(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message : '';
  switch (code) {
    case 'invalid_credentials':
    case 'INVALID_CREDENTIALS':
      return 'Invalid username or password.';
    case 'email_not_confirmed':
      return 'Confirm your email before logging in. Open the link in your confirmation email.';
    case 'captcha_failed':
    case 'CAPTCHA_FAILED':
      return 'Verification failed or expired. Complete the challenge again.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
    case 'RATE_LIMITED':
    case 'P0001':
      return 'Too many attempts. Wait a moment and try again.';
    case 'user_already_exists':
    case 'email_exists':
    case 'identity_already_exists':
      return 'This email already has an account. Log in instead.';
    case 'weak_password':
      return 'Choose a stronger password with at least 8 characters.';
    case 'manual_linking_disabled':
      return 'Guest conversion is not enabled yet. Please contact support.';
    case 'anonymous_provider_disabled':
      return 'Guest sign-in is not enabled yet. Please contact support.';
    case 'SERVICE_UNAVAILABLE':
      return 'Login is temporarily unavailable. Please try again.';
    case 'INVALID_INPUT':
      return 'Check your username or email and password, then try again.';
  }
  if (/network|fetch|connection/i.test(message)) {
    return 'Could not connect to Vivodha. Check your connection and try again.';
  }
  if (/username|signup profile/i.test(message)) {
    return 'Could not reserve that username. Try a different username and submit again.';
  }
  if (error instanceof Error && !code) return message;
  return 'We could not complete this request. Please try again.';
}
