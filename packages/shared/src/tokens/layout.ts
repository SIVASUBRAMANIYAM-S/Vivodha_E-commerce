/** 4-point spacing scale. Screen gutter = lg (16). */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Corner radii by role (ADR-133): cards 20, buttons/chips/inputs 14, sheets 28. */
export const radius = {
  none: 0,
  badge: 8,
  button: 14,
  chip: 14,
  input: 14,
  image: 14,
  card: 20,
  sheet: 28,
  pill: 999,
} as const;

/**
 * Soft layered depth: two stacked, low-opacity, ink-tinted shadows, as CSS
 * box-shadow strings (React Native `boxShadow`, consistent on Android and iOS
 * under the new architecture). Supersedes Phase 0's flat elevation (ADR-133).
 */
export const shadow = {
  none: 'none',
  sm: '0px 1px 2px rgba(19, 38, 31, 0.06), 0px 2px 6px rgba(19, 38, 31, 0.05)',
  md: '0px 2px 4px rgba(19, 38, 31, 0.06), 0px 6px 16px rgba(19, 38, 31, 0.08)',
  lg: '0px 4px 8px rgba(19, 38, 31, 0.06), 0px 12px 32px rgba(19, 38, 31, 0.14)',
} as const;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

/** Minimum touch target (dp). */
export const touch = {
  min: 48,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type ShadowToken = keyof typeof shadow;
