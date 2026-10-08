/**
 * Mobile theme = shared tokens + RN font mapping + Reanimated motion helpers.
 * Components read colours from useTheme(), never hardcoded hex (ADR-135).
 */
export {
  accessible,
  brand,
  contrastLevel,
  contrastRatio,
  duration,
  fontFamily,
  fontWeight,
  haptics,
  iconSize,
  lightTheme,
  maxFontSizeMultiplier,
  neutral,
  radius,
  shadow,
  spacing,
  spring,
  stagger,
  touch,
  typeScale,
  type FontWeight,
  type RadiusToken,
  type ShadowToken,
  type SpacingToken,
  type ThemeColors,
  type ThemeColorToken,
  type TypeVariant,
} from '@vivodha/shared/tokens';
export { fontAssets, fontFor } from './fonts';
export {
  easings,
  springConfig,
  springTo,
  timeTo,
  timingConfig,
  useMotionPreference,
} from './motion';
export { ThemeProvider, useTheme } from './ThemeProvider';
