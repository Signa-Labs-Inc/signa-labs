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

export const metadata: Metadata = {
  title: {
    default: 'Signa - Become a Better Engineer',
    template: '%s | Signa',
  },
  description:
    'AI-powered exercises that adapt to your skill level. Get personalized lessons, real-time feedback, and structured learning paths.',
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
    title: 'Signa - Become a Better Engineer',
    description: 'AI-powered exercises that adapt to your skill level.',
    type: 'website',
    siteName: 'Signa',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signa - Become a Better Engineer',
    description: 'AI-powered exercises that adapt to your skill level.',
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
