/**
 * Motion tokens (ADR-136). Platform-neutral numbers; the mobile app maps them
 * to Reanimated (withSpring / withTiming + Easing.bezier). docs/design-language.md §5.
 */
export const duration = {
  instant: 100,
  fast: 160,
  base: 240,
  slow: 380,
} as const;

/** Spring presets in Reanimated's physics terms. */
export const spring = {
  /** Buttons, stepper morph, indicators. */
  snappy: { damping: 18, stiffness: 320, mass: 0.8 },
  /** Cart bar, sheets, header collapse. */
  gentle: { damping: 20, stiffness: 160, mass: 1 },
  /** Badge count bounce, arrival pulse. */
  bouncy: { damping: 11, stiffness: 260, mass: 0.9 },
} as const;

/** Cubic-bezier control points [x1, y1, x2, y2]. */
export const easing = {
  standard: [0.2, 0, 0, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.3, 0, 1, 1],
} as const;

/** First-load entrance stagger: delay per item, capped. */
export const stagger = {
  interval: 40,
  maxItems: 8,
} as const;

export type DurationToken = keyof typeof duration;
export type SpringToken = keyof typeof spring;
export type EasingToken = keyof typeof easing;
