'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const footerLinks = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Team', href: '/team' },
    { label: 'Partners', href: '/partners' },
    { label: 'Investors', href: '/investors' },
    { label: 'Jobs', href: '/jobs' },
  ],
  Resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

interface FooterProps {
  variant?: 'default' | 'dark';
}

export function Footer({ variant = 'default' }: FooterProps) {
  const { isSignedIn } = useAuth();
  const homeHref = isSignedIn ? '/dashboard' : '/';

  const isDark = variant === 'dark';

  return (
    <footer
      className={
        isDark
          ? 'border-t border-white/10 bg-black'
          : 'border-t border-border bg-card/50'
      }
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Top: Logo + Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href={homeHref} className="inline-flex items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm ${
                  isDark
                    ? 'bg-linear-to-br from-white to-zinc-300 text-black'
                    : 'bg-linear-to-br from-primary to-violet-400 text-white'
                }`}
              >
                S
              </div>
              <span
                className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-foreground'
                }`}
              >
                Signa Labs
              </span>
            </Link>
            <p
              className={`mt-3 text-sm leading-relaxed ${
                isDark ? 'text-zinc-400' : 'text-muted-foreground'
              }`}
            >
              AI-powered coding exercises that adapt to your skill level.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3
                className={`text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-foreground'
                }`}
              >
                {category}
              </h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`text-sm transition-colors ${
                        isDark
                          ? 'text-zinc-400 hover:text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: Copyright */}
        <div
          className={`mt-10 border-t pt-6 ${
            isDark ? 'border-white/10' : 'border-border'
          }`}
        >
          <p
            className={`text-center text-xs ${
              isDark ? 'text-zinc-500' : 'text-muted-foreground'
            }`}
          >
            &copy; {new Date().getFullYear()} Signa Labs Inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
