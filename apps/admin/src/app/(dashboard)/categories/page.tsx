import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Categories' };

export default function Page() {
  return <PagePlaceholder href="/categories" />;
}
