import { z } from 'zod';
import { USERNAME_REGEX } from '@vivodha/shared/constants';

export function isDevCaptchaDisabled(
  setting: string | undefined,
  url: string | undefined,
  development: boolean,
) {
  return (
    development &&
    setting === 'true' &&
    (url === 'https://nzltgmfodazrhrxufpwe.supabase.co' ||
      url === 'https://nzltgmfodazrhrxufpwe.supabase.co/')
  );
}

export function authCaptchaOptions(token: string | null | undefined, required: boolean) {
  if (required && !token) throw new Error('Complete verification before continuing.');
  return { captchaToken: required ? token || undefined : undefined };
}

export const usernameLoginRequestSchema = z.object({
  username: z.string().trim().toLowerCase().regex(USERNAME_REGEX),
  password: z.string().min(1).max(1024),
  captchaToken: z.string().min(1).max(4096).optional(),
});

export const usernameLoginResponseSchema = z.object({
  session: z.object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1),
    expires_at: z.number().int().positive(),
    token_type: z.literal('bearer'),
  }),
});

export type UsernameLoginRequest = z.infer<typeof usernameLoginRequestSchema>;
export type UsernameLoginResponse = z.infer<typeof usernameLoginResponseSchema>;
