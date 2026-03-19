'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { CreditCard, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link href="/sign-in?redirect_url=%2Fdashboard">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
    );
  }

  const displayName = user.fullName || user.primaryEmailAddress?.emailAddress || 'User';
  const initials = displayName
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-accent/50 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
      >
        <div className="from-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br to-violet-400 text-xs font-bold text-white">
          {initials}
        </div>
        <span className="text-foreground hidden max-w-30 truncate sm:block">{displayName}</span>
      </button>

      {isOpen && (
        <div className="border-border bg-card absolute top-full right-0 z-50 mt-2 w-48 rounded-md border p-1 shadow-lg">
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="text-foreground hover:bg-accent/50 flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <Link
            href="/settings/billing"
            onClick={() => setIsOpen(false)}
            className="text-foreground hover:bg-accent/50 flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Billing
          </Link>
          <button
            onClick={() => signOut()}
            className="text-foreground hover:bg-accent/50 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
