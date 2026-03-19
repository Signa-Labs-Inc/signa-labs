'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Code2, Route, FlaskConical, Crown, Compass } from 'lucide-react';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/discover', icon: Compass, label: 'Discover' },
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
      <div className="border-border bg-card flex h-14 items-center justify-between border-b px-4">
        <Link href="/discover" className="flex items-center gap-2">
          <div className="from-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br to-violet-400 text-sm font-bold text-white">
            S
          </div>
          <span className="text-foreground text-lg font-bold">Signa Labs</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-muted-foreground hover:bg-accent/50 rounded-md p-2 transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Overlay + Drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="bg-card border-border fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r">
            {/* Header */}
            <div className="border-border flex h-14 items-center justify-between border-b px-4">
              <span className="text-primary text-lg font-bold">Signa Labs</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:bg-accent/50 rounded-md p-2 transition-colors"
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
            <div className="border-border flex items-center justify-between border-t p-3">
              <UserMenu />
              <ThemeToggle />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
