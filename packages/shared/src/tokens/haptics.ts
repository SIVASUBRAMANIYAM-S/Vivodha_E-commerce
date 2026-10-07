/**
 * Haptic feedback map (ADR-136): which feedback each interaction gets.
 * Platform-neutral; the mobile app maps kinds to expo-haptics. Haptics fire on
 * the input, never at the end of an animation.
 */
export type HapticKind =
  | 'impactLight'
  | 'impactMedium'
  | 'selection'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError';

export const haptics = {
  add: 'impactLight',
  increment: 'impactLight',
  decrement: 'impactLight',
  /** Tab, chip, filter, variant change. */
  select: 'selection',
  /** Order-level wins, e.g. free delivery reached (once per session). */
  success: 'notificationSuccess',
  error: 'notificationError',
} as const satisfies Record<string, HapticKind>;

export type HapticEvent = keyof typeof haptics;
