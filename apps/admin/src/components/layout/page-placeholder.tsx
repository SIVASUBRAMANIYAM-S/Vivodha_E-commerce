import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { navItem } from './nav';

/** Phase 0 placeholder for every dashboard page until its feature phase ships. */
export function PagePlaceholder({ href }: { href: string }) {
  const { label, phase, summary, icon: Icon } = navItem(href);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{label}</h1>
      <Card className="max-w-xl bg-tint ring-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Icon className="size-4" aria-hidden />
            Coming in {phase}
          </CardTitle>
          <CardDescription>{summary}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
