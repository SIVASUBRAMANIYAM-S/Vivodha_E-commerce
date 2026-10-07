/** Poppins for headings, Inter for body. Platform layers map family + weight to loaded font names. */
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

/** Type scale in px (mobile dp). lineHeight is absolute. */
export const typeScale = {
  display: { family: 'heading', size: 28, lineHeight: 36, weight: 'bold' },
  h1: { family: 'heading', size: 22, lineHeight: 30, weight: 'semibold' },
  h2: { family: 'heading', size: 18, lineHeight: 26, weight: 'semibold' },
  h3: { family: 'heading', size: 16, lineHeight: 22, weight: 'semibold' },
  body: { family: 'body', size: 14, lineHeight: 20, weight: 'regular' },
  bodyStrong: { family: 'body', size: 14, lineHeight: 20, weight: 'semibold' },
  small: { family: 'body', size: 12, lineHeight: 16, weight: 'regular' },
  caption: { family: 'body', size: 11, lineHeight: 14, weight: 'medium' },
  price: { family: 'body', size: 15, lineHeight: 20, weight: 'bold' },
} as const satisfies Record<
  string,
  { family: keyof typeof fontFamily; size: number; lineHeight: number; weight: FontWeight }
>;

export type TypeVariant = keyof typeof typeScale;
