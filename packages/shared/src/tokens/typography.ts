/** Poppins for headings, prices and counters; Inter for body (ADR-134). */
export const fontFamily = {
  heading: 'Poppins',
  body: 'Inter',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontWeight = keyof typeof fontWeight;

type TypeStyle = {
  family: keyof typeof fontFamily;
  size: number;
  lineHeight: number;
  weight: FontWeight;
  /** Tabular numerals (fixed-width digits) for prices and counters. */
  numeric?: boolean;
};

/** Type scale in dp. See docs/design-language.md §3. */
export const typeScale = {
  display: { family: 'heading', size: 28, lineHeight: 34, weight: 'bold' },
  h1: { family: 'heading', size: 22, lineHeight: 28, weight: 'semibold' },
  h2: { family: 'heading', size: 18, lineHeight: 24, weight: 'semibold' },
  h3: { family: 'heading', size: 16, lineHeight: 22, weight: 'semibold' },
  bodyLarge: { family: 'body', size: 16, lineHeight: 24, weight: 'regular' },
  body: { family: 'body', size: 14, lineHeight: 20, weight: 'regular' },
  bodyStrong: { family: 'body', size: 14, lineHeight: 20, weight: 'semibold' },
  label: { family: 'body', size: 14, lineHeight: 18, weight: 'semibold' },
  small: { family: 'body', size: 12, lineHeight: 16, weight: 'regular' },
  caption: { family: 'body', size: 11, lineHeight: 14, weight: 'medium' },
  priceLarge: { family: 'heading', size: 22, lineHeight: 28, weight: 'bold', numeric: true },
  price: { family: 'heading', size: 16, lineHeight: 20, weight: 'bold', numeric: true },
  priceSmall: { family: 'heading', size: 13, lineHeight: 16, weight: 'semibold', numeric: true },
  mrp: { family: 'body', size: 12, lineHeight: 16, weight: 'regular', numeric: true },
  counter: { family: 'heading', size: 14, lineHeight: 18, weight: 'semibold', numeric: true },
} as const satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof typeScale;

/** Cap on system font scaling so dense commerce layouts stay usable. */
export const maxFontSizeMultiplier = 1.6;
