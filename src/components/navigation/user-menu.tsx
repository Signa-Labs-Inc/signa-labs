'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { LogOut, User } from 'lucide-react';

interface UserMenuProps {
  isCollapsed: boolean;
}

export function UserMenu({ isCollapsed }: UserMenuProps) {
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

  if (!user) return null;

  const displayName = user.fullName || user.primaryEmailAddress?.emailAddress || 'User';
  const avatarUrl = user.imageUrl;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/50 ${
          isCollapsed ? 'justify-center px-2' : ''
        }`}
      >
        <img
          src={avatarUrl}
          alt={displayName}
          className="h-7 w-7 shrink-0 rounded-full"
        />
        {!isCollapsed && (
          <span className="truncate text-sidebar-foreground">{displayName}</span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute bottom-full mb-2 z-50 w-48 rounded-md border border-sidebar-border bg-sidebar p-1 shadow-lg ${
            isCollapsed ? 'left-full ml-2 bottom-0 mb-0' : 'left-0'
          }`}
        >
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
