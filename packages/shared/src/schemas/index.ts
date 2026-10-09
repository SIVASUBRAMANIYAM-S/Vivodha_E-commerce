import { z } from 'zod';

import { PHONE_REGEX_IN, PINCODE_REGEX, USERNAME_REGEX } from '../constants';

/** Phase 0 stubs. Feature phases extend these alongside the generated DB types. */

export const pincodeSchema = z
  .string()
  .trim()
  .regex(PINCODE_REGEX, 'Enter a valid 6-digit pincode');

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_REGEX_IN, 'Enter a valid 10-digit mobile number');

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(USERNAME_REGEX, '3-20 characters: lowercase letters, numbers, underscore');

export const emailSchema = z.email('Enter a valid email');

export const passwordSchema = z.string().min(8, 'At least 8 characters');

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your name'),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
});
export type SignUpInput = z.infer<typeof signUpSchema>;

/** Login accepts a username OR an email in a single field. */
export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Enter your username or email'),
  password: z.string().min(1, 'Enter your password'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const guestContactSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: phoneSchema,
  email: emailSchema,
});
export type GuestContactInput = z.infer<typeof guestContactSchema>;

export const orderLookupSchema = z.object({
  orderNumber: z.string().trim().min(4),
  contact: z.union([emailSchema, phoneSchema]),
});
export type OrderLookupInput = z.infer<typeof orderLookupSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** Mirrors public.addresses (Phase 3). label matches the DB's text check informally. */
export const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter a name'),
  phone: phoneSchema,
  line1: z.string().trim().min(2, 'Enter the house/flat and building'),
  line2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(2, 'Enter a city'),
  state: z.string().trim().min(2, 'Enter a state'),
  pincode: pincodeSchema,
  label: z.enum(['home', 'work', 'other']),
  isDefault: z.boolean(),
});
export type AddressInput = z.infer<typeof addressSchema>;

/** Mirrors public.pincode_waitlist's `num_nonnulls(email, phone) = 1` check. */
export const pincodeWaitlistSchema = z
  .object({
    pincode: pincodeSchema,
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
  })
  .refine((data) => (data.email ? 1 : 0) + (data.phone ? 1 : 0) === 1, {
    message: 'Enter an email or a phone number',
    path: ['email'],
  });
export type PincodeWaitlistInput = z.infer<typeof pincodeWaitlistSchema>;

/**
 * 0-4 password strength heuristic for the signup/reset UI meter only — not a
 * validation rule. passwordSchema itself stays min(8); complexity/breach
 * checks are open question #14, not decided yet.
 */
export function scorePasswordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}
