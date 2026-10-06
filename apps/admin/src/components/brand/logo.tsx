import { brand } from '@vivodha/shared/tokens';

import { cn } from '@/lib/utils';

/**
 * Placeholder Vivodha mark: rounded emerald square, white "V" from two leaves, saffron seed dot.
 * Replace with the final artwork once supplied (docs/open-questions.md).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn('size-8', className)} role="img" aria-label="vivodha">
      <rect width="48" height="48" rx="12" fill={brand.primary} />
      <path d="M24 37C14.5 31 9.5 21 12 11c8 3 13 13 12 26Z" fill="#FFFFFF" />
      <path d="M24 37c9.5-6 14.5-16 12-26-8 3-13 13-12 26Z" fill="#FFFFFF" fillOpacity="0.85" />
      <circle cx="24" cy="12.5" r="3.5" fill={brand.saffron} />
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
