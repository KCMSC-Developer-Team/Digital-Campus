import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KCMSC Digital Campus',
  description: 'The private institutional operations platform for K C Model School & College.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
