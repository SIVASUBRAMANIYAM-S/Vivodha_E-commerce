/* eslint-disable no-console -- CLI script: printing the table is its job. */
/**
 * Prints the WCAG contrast table for every text/background pair the app uses,
 * computed from the real tokens, and exits non-zero if a required pair fails.
 * Run: pnpm --filter @vivodha/shared contrast   (Node 22 strips the TS types)
 */
import { accessible, brand, lightTheme } from '../src/tokens/colors.ts';
import { contrastLevel, contrastRatio } from '../src/tokens/contrast.ts';

type Pair = { name: string; fg: string; bg: string; min: number; note?: string };

const t = lightTheme;
const pairs: Pair[] = [
  { name: 'textPrimary on surface', fg: t.textPrimary, bg: t.surface, min: 4.5 },
  { name: 'textPrimary on surfaceTint', fg: t.textPrimary, bg: t.surfaceTint, min: 4.5 },
  { name: 'textSecondary on surface', fg: t.textSecondary, bg: t.surface, min: 4.5 },
  { name: 'textSecondary on surfaceTint', fg: t.textSecondary, bg: t.surfaceTint, min: 4.5 },
  { name: 'textSecondary on surfaceMuted', fg: t.textSecondary, bg: t.surfaceMuted, min: 4.5 },
  { name: 'primary on surface', fg: t.primary, bg: t.surface, min: 4.5 },
  { name: 'primary on surfaceTint', fg: t.primary, bg: t.surfaceTint, min: 4.5 },
  { name: 'textOnPrimary on primary', fg: t.textOnPrimary, bg: t.primary, min: 4.5 },
  { name: 'textOnPrimary on primaryDeep', fg: t.textOnPrimary, bg: t.primaryDeep, min: 4.5 },
  { name: 'textOnAccent (ink) on warning (saffron)', fg: t.textOnAccent, bg: t.warning, min: 4.5 },
  { name: 'warningText on surface', fg: t.warningText, bg: t.surface, min: 4.5 },
  { name: 'discount on surface', fg: t.discount, bg: t.surface, min: 4.5 },
  { name: 'discount on discountSoft', fg: t.discount, bg: t.discountSoft, min: 4.5 },
  { name: 'white on discount (badge)', fg: '#FFFFFF', bg: t.discount, min: 4.5 },
  { name: 'danger on surface', fg: t.danger, bg: t.surface, min: 4.5 },
  { name: 'points on surface', fg: t.points, bg: t.surface, min: 4.5 },
  { name: 'points on pointsSoft', fg: t.points, bg: t.pointsSoft, min: 4.5 },
  { name: 'white on points', fg: '#FFFFFF', bg: t.points, min: 4.5 },
  // Documented failures that motivated the accessible variants (informational only).
  {
    name: 'brand.offer on surface',
    fg: brand.offer,
    bg: t.surface,
    min: 0,
    note: 'use accessible.offerStrong',
  },
  {
    name: 'white on brand.saffron',
    fg: '#FFFFFF',
    bg: brand.saffron,
    min: 0,
    note: 'forbidden; ink text only',
  },
  {
    name: 'brand.saffron on surface',
    fg: brand.saffron,
    bg: t.surface,
    min: 0,
    note: `use ${accessible.saffronText}`,
  },
  {
    name: 'textDisabled on surface',
    fg: t.textDisabled,
    bg: t.surface,
    min: 0,
    note: 'disabled: WCAG exempt',
  },
];

let failed = 0;
console.log('Pair'.padEnd(42), 'Ratio'.padStart(6), ' Level     Required');
for (const p of pairs) {
  const ratio = contrastRatio(p.fg, p.bg);
  const ok = ratio >= p.min;
  if (!ok) failed++;
  const req = p.min ? `>= ${p.min}` : 'info';
  console.log(
    p.name.padEnd(42),
    ratio.toFixed(2).padStart(6),
    ` ${contrastLevel(ratio).padEnd(9)} ${req.padEnd(7)} ${ok ? '' : 'FAIL'} ${p.note ?? ''}`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} required pair(s) below WCAG AA.`);
  process.exit(1);
}
console.log('\nAll required pairs meet WCAG AA.');
