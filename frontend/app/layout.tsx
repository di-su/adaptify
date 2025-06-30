import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import BackendWakeup from '@/components/BackendWakeup';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Content Brief Generator',
  description: 'Generate comprehensive content briefs with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BackendWakeup />
        {children}
      </body>
    </html>
  );
}
