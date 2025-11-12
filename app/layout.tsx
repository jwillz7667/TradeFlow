import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TradeFlow OS',
  description: 'Embedded compliance and finance OS for field operators'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkKey =
    publishableKey ||
    (process.env.NODE_ENV === 'production'
      ? (() => {
          throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
        })()
      : 'test_publishable_key');

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html lang="en" className={inter.className}>
        <body>
          <SupabaseProvider>{children}</SupabaseProvider>
          <Toaster richColors closeButton position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
