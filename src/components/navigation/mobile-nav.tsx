'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Code2, Route, FlaskConical, Crown } from 'lucide-react';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/exercises', icon: Code2, label: 'Exercises' },
  { href: '/paths', icon: Route, label: 'Paths' },
  { href: '/exercises/generate', icon: FlaskConical, label: 'Craft' },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isExerciseWorkspace =
    /^\/exercises\/[^/]+$/.test(pathname) && pathname !== '/exercises/generate';

  // Don't show mobile nav on exercise workspace (top-nav handles it)
  if (isExerciseWorkspace) return null;

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-violet-400 text-white font-bold text-sm">
            S
          </div>
          <span className="text-lg font-bold text-foreground">Signa Labs</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent/50 transition-colors"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay + Drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col">
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-lg font-bold text-primary">Signa Labs</span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-accent/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 space-y-1 p-3">
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
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/pricing"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  pathname === '/pricing'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                <Crown className="h-5 w-5" />
                <span>Pricing</span>
              </Link>
            </nav>

            {/* User menu + theme toggle */}
            <div className="flex items-center justify-between border-t border-border p-3">
              <UserMenu />
              <ThemeToggle />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
