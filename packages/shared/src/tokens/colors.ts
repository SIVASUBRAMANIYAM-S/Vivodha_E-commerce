/**
 * Vivodha colour tokens. Rules and measured contrast ratios: docs/design-language.md §2.
 * This file must stay import-free: scripts/contrast.ts loads it directly with Node.
 *
 * - saffron: background or badge fill only, always with ink text (white on saffron is 2.05:1)
 * - offer: discounts only. Text and badge fills use `accessible.offerStrong` (brand offer fails AA)
 * - points: Vivo Points / loyalty only
 */
export const brand = {
  primary: '#0B7A55',
  primaryPressed: '#08603F',
  /** Gradient end for hero moments only (banners, success, cart bar). */
  primaryDeep: '#06573C',
  tint: '#E3F4EC',
  saffron: '#FF9F1C',
  offer: '#E5484D',
  points: '#6B4BC4',
  ink: '#13261F',
} as const;

/**
 * Darker variants for brand colours that fail WCAG AA (4.5:1) as small text on
 * white or tint. Chosen from measured ratios, see docs/design-language.md.
 */
export const accessible = {
  /** Discount text and % OFF badge fill (white text on it 5.52:1). */
  offerStrong: '#C42F35',
  /** Any saffron-coloured text (5.57:1 on white, 4.89:1 on tint). */
  saffronText: '#9A5800',
  /** Secondary text (5.78:1 on white, 5.07:1 on tint). */
  textSecondary: '#5A6963',
} as const;

/** Neutral scale derived from ink, for surfaces and borders. */
export const neutral = {
  0: '#FFFFFF',
  50: '#F7F9F8',
  100: '#EEF2F0',
  200: '#DDE4E1',
  300: '#C3CDC9',
  400: '#94A39D',
  // Phase 0 used #6B7B75, which failed AA (4.45:1 on white).
  500: accessible.textSecondary,
  600: '#4E5D57',
  700: '#36443F',
  800: '#22312B',
  900: '#13261F',
} as const;

/**
 * Semantic tokens. Components read these through useTheme(), never brand hex.
 * Dark mode = add a `dark` object with the same keys (ADR-135).
 */
export const lightTheme = {
  surface: neutral[0],
  surfaceElevated: neutral[0],
  surfaceMuted: neutral[50],
  surfaceTint: brand.tint,
  textPrimary: brand.ink,
  textSecondary: accessible.textSecondary,
  textDisabled: neutral[400],
  textOnPrimary: neutral[0],
  /** Text on saffron / warning fills. */
  textOnAccent: brand.ink,
  border: neutral[200],
  borderStrong: neutral[300],
  primary: brand.primary,
  primaryPressed: brand.primaryPressed,
  primaryDeep: brand.primaryDeep,
  success: brand.primary,
  warning: brand.saffron,
  warningText: accessible.saffronText,
  danger: accessible.offerStrong,
  discount: accessible.offerStrong,
  discountSoft: '#FCEBEC',
  points: brand.points,
  pointsSoft: '#EFEAFB',
  overlay: 'rgba(19, 38, 31, 0.45)',
  shadow: brand.ink,
  skeleton: neutral[100],
  skeletonHighlight: neutral[50],
} as const;

export type ThemeColors = { [K in keyof typeof lightTheme]: string };
export type ThemeColorToken = keyof ThemeColors;

export const themes = { light: lightTheme } as const satisfies Record<string, ThemeColors>;
export type ThemeName = keyof typeof themes;
