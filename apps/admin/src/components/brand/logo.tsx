import { brand } from '@vivodha/shared/tokens';

import { cn } from '@/lib/utils';

/**
 * Vivodha mark: rounded emerald square, white "V" from two leaves, saffron seed
 * dot (ADR-123). Path geometry mirrors packages/shared/src/brand/logo-mark.svg
 * exactly (same 0-100 viewBox) — the single source of truth for the mark.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn('size-8', className)} role="img" aria-label="vivodha">
      <rect width="100" height="100" rx="24" fill={brand.primary} />
      <path d="M50 78 C 20 65 15 35 28 15 C 34 34 38 56 50 78 Z" fill="#FFFFFF" />
      <path
        d="M50 78 C 80 65 85 35 72 15 C 66 34 62 56 50 78 Z"
        fill="#FFFFFF"
        fillOpacity="0.88"
      />
      <circle cx="50" cy="12" r="6.5" fill={brand.saffron} />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="font-heading text-xl font-semibold lowercase tracking-tight text-primary">
        vivodha
      </span>
    </span>
  );
}
