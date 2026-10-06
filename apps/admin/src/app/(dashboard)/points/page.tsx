import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Vivo Points' };

export default function Page() {
  return <PagePlaceholder href="/points" />;
}
