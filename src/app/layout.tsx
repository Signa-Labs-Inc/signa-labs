import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Signa Labs - Learn to Code by Doing',
    template: '%s | Signa Labs',
  },
  description:
    'AI-powered coding exercises that adapt to your skill level. Get personalized lessons, real-time feedback, and structured learning paths.',
  keywords: ['coding', 'programming', 'learn to code', 'AI', 'exercises', 'learning paths'],
  openGraph: {
    title: 'Signa Labs - Learn to Code by Doing',
    description: 'AI-powered coding exercises that adapt to your skill level.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signa Labs - Learn to Code by Doing',
    description: 'AI-powered coding exercises that adapt to your skill level.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
