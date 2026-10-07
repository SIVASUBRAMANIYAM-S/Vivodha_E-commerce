import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Banners' };

export default function Page() {
  return <PagePlaceholder href="/banners" />;
}
