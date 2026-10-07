import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';

import { brandCssVars } from '@/lib/theme';

import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: { default: 'Vivodha Admin', template: '%s · Vivodha Admin' },
  description: 'Vivodha store administration',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      style={brandCssVars}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
