'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

export function SidebarNavItem({ href, icon: Icon, label, isCollapsed }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-primary'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      } ${isCollapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}
