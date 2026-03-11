'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Code2,
  Route,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SidebarNavItem } from './sidebar-nav-item';
import { UserMenu } from './user-menu';

const COLLAPSED_KEY = 'sidebar-collapsed';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/exercises', icon: Code2, label: 'Exercises' },
  { href: '/paths', icon: Route, label: 'Learning Paths' },
  { href: '/exercises/generate', icon: Sparkles, label: 'Generate' },
];

export function Sidebar() {
  const pathname = usePathname();
  const isExerciseWorkspace = /^\/exercises\/[^/]+$/.test(pathname) && pathname !== '/exercises/generate';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isExerciseWorkspace) {
      setIsCollapsed(true);
    } else {
      const stored = localStorage.getItem(COLLAPSED_KEY);
      if (stored !== null) {
        setIsCollapsed(stored === 'true');
      }
    }
  }, [isExerciseWorkspace]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (!isExerciseWorkspace) {
      localStorage.setItem(COLLAPSED_KEY, String(next));
    }
  };

  // Avoid hydration mismatch - render expanded by default on server
  const collapsed = mounted ? isCollapsed : false;

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo / Brand */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            S
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">
              Signa Labs
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isCollapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <UserMenu isCollapsed={collapsed} />
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
