import type { User } from '@supabase/supabase-js';

export function needsPassword(
  user: Pick<User, 'is_anonymous' | 'email_confirmed_at' | 'user_metadata'>,
  recovery: boolean,
) {
  return (
    recovery ||
    (!user.is_anonymous &&
      !!user.email_confirmed_at &&
      user.user_metadata.account_conversion_pending === true)
  );
}

export function passwordStrength(password: string) {
  if (!password) return { label: 'Not entered', level: 0 };
  if (password.length < 8) return { label: 'Too short', level: 1 };
  if (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
    return { label: 'Strong', level: 4 };
  return password.length >= 10 ? { label: 'Good', level: 3 } : { label: 'Fair', level: 2 };
}
