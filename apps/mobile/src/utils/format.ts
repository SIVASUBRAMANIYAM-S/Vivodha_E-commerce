import { CURRENCY } from '@vivodha/shared/constants';

const inr = new Intl.NumberFormat(CURRENCY.locale, {
  style: 'currency',
  currency: CURRENCY.code,
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** Money is stored as integer paise (see docs/decisions.md). formatINR(4950) -> "₹49.50". */
export function formatINR(paise: number): string {
  return inr.format(paise / CURRENCY.minorUnit);
}

/** Whole-number discount percent, e.g. discountPercent(10000, 8000) -> 20. */
export function discountPercent(mrpPaise: number, pricePaise: number): number {
  if (mrpPaise <= 0 || pricePaise >= mrpPaise) return 0;
  return Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100);
}
