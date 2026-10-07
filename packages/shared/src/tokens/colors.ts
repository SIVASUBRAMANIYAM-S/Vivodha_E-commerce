/**
 * Vivodha brand colors. See docs/design-tokens.md for usage rules.
 * - saffron: sparing highlights only
 * - offer: discounts only
 * - points: Vivo Points / loyalty only
 */
export const brand = {
  primary: '#0B7A55',
  primaryPressed: '#08603F',
  tint: '#E3F4EC',
  saffron: '#FF9F1C',
  offer: '#E5484D',
  points: '#6B4BC4',
  ink: '#13261F',
} as const;

/** Neutral scale derived from ink, used for surfaces, borders and secondary text. */
export const neutral = {
  0: '#FFFFFF',
  50: '#F7F9F8',
  100: '#EEF2F0',
  200: '#DDE4E1',
  300: '#C3CDC9',
  400: '#94A39D',
  500: '#6B7B75',
  600: '#4E5D57',
  700: '#36443F',
  800: '#22312B',
  900: '#13261F',
} as const;

/** Semantic aliases. Components use these, never raw hex values. */
export const colors = {
  ...brand,
  background: neutral[0],
  surface: neutral[50],
  surfaceMuted: neutral[100],
  border: neutral[200],
  text: brand.ink,
  textSecondary: neutral[500],
  textDisabled: neutral[400],
  textOnPrimary: neutral[0],
  success: brand.primary,
  warning: brand.saffron,
  danger: brand.offer,
} as const;

export type ColorToken = keyof typeof colors;
