import { brand, neutral } from '@vivodha/shared/tokens';
import type { CSSProperties } from 'react';

/**
 * Brand tokens from @vivodha/shared exposed as --brand-* CSS variables on <html>.
 * globals.css maps shadcn's semantic variables (--primary, --border, ...) onto these,
 * so packages/shared/src/tokens stays the single source of truth for colors.
 */
export const brandCssVars = {
  '--brand-primary': brand.primary,
  '--brand-primary-pressed': brand.primaryPressed,
  '--brand-tint': brand.tint,
  '--brand-saffron': brand.saffron,
  '--brand-offer': brand.offer,
  '--brand-points': brand.points,
  '--brand-ink': brand.ink,
  '--brand-n0': neutral[0],
  '--brand-n50': neutral[50],
  '--brand-n100': neutral[100],
  '--brand-n200': neutral[200],
  '--brand-n400': neutral[400],
  '--brand-n500': neutral[500],
} as CSSProperties;
