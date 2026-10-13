import { authCaptchaOptions, isDevCaptchaDisabled } from '@vivodha/shared/schemas';

export const captchaRequired = !isDevCaptchaDisabled(
  process.env.EXPO_PUBLIC_DEV_DISABLE_CAPTCHA,
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  __DEV__,
);

export function captchaOptions(token: string | null | undefined) {
  return authCaptchaOptions(token, captchaRequired);
}
