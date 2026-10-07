/** 4-point spacing scale. */
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

export const radii = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

/**
 * Flat elevation: separate surfaces with borders and tint, not shadows.
 * Only `overlay` (sheets, sticky cart bar) may use a soft shadow.
 */
export const elevation = {
  flat: { borderWidth: 1, borderColor: 'border', shadow: null },
  raised: { borderWidth: 1, borderColor: 'border', shadow: null },
  overlay: {
    borderWidth: 0,
    borderColor: null,
    shadow: { color: '#13261F', opacity: 0.08, radius: 12, offsetY: -2 },
  },
} as const;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;
