import type { Metadata } from 'next';

import { Toaster } from '@/shared/components/sonner';

import '@/shared/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Kuromoji',
    template: '%s | Kuromoji',
  },
  description: 'シンプルな買い物リストアプリ',
  applicationName: 'Kuromoji',
  keywords: ['買い物リスト', 'ショッピングリスト', '買い物メモ', '共有', '家族'],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Kuromoji',
    description: 'シンプルな買い物リストアプリ',
    type: 'website',
    images: ['/opengraph-image.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Kuromoji',
    description: 'シンプルな買い物リストアプリ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
