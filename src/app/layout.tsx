import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from 'sonner';
import './globals.css';

const heading = Plus_Jakarta_Sans({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

const body = Inter({
  variable: '--font-body',
  subsets: ['latin'],
});

const mono = JetBrains_Mono({
  variable: '--font-code',
  subsets: ['latin'],
});

const APP_TITLE = 'Signa - Become a Better Engineer';
const APP_DESCRIPTION = 'AI-powered exercises that adapt to your skill level.';

export const metadata: Metadata = {
  title: {
    default: APP_TITLE,
    template: '%s | Signa',
  },
  description: `${APP_DESCRIPTION} Get personalized lessons, real-time feedback, and structured learning paths.`,
  keywords: [
    'software engineering',
    'programming',
    'interview prep',
    'AI',
    'exercises',
    'learning paths',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.signalabs.com'),
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    type: 'website',
    siteName: 'Signa',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${heading.variable} ${body.variable} ${mono.variable} antialiased`}>
          <ThemeProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
