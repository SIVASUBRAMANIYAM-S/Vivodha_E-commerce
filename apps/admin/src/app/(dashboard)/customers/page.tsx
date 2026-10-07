import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Customers' };

export default function Page() {
  return <PagePlaceholder href="/customers" />;
}
