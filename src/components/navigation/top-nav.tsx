'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Code2, Route, FlaskConical, Crown } from 'lucide-react';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/exercises', icon: Code2, label: 'Exercises' },
  { href: '/paths', icon: Route, label: 'Paths' },
  { href: '/exercises/generate', icon: FlaskConical, label: 'Craft' },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-violet-400 text-white font-bold text-sm">
            S
          </div>
          <span className="hidden text-lg font-bold text-foreground sm:block">
            Signa Labs
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href) &&
                  !(item.href === '/exercises' && pathname.startsWith('/exercises/generate'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/pricing"
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              pathname === '/pricing'
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            <Crown className="h-4 w-4" />
            Pricing
          </Link>
        </nav>

        {/* User Menu + Theme Toggle (desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
