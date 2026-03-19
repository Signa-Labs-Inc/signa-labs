'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Code2,
  FolderTree,
  FileText,
  Server,
  Route,
  Users,
  FlaskConical,
  BarChart3,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface AdminSidebarProps {
  userRole: string;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/exercises/generate', label: 'Generate', icon: FlaskConical },
  { href: '/admin/exercises', label: 'Exercises', icon: Code2 },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/templates', label: 'Templates', icon: FileText },
  { href: '/admin/environments', label: 'Environments', icon: Server },
  { href: '/admin/paths', label: 'Paths', icon: Route },
  { href: '/admin/plans', label: 'Plans', icon: CreditCard },
];

const superAdminItems = [
  { href: '/admin/users', label: 'Users', icon: Users },
];

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    // Ensure /admin/exercises/generate doesn't also highlight /admin/exercises
    if (href === '/admin/exercises') {
      return pathname === '/admin/exercises' || (pathname.startsWith('/admin/exercises/') && !pathname.startsWith('/admin/exercises/generate'));
    }
    return pathname.startsWith(href);
  };

  const allItems = [
    ...navItems,
    ...(userRole === 'super_admin' ? superAdminItems : []),
  ];

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-border bg-background">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <LayoutDashboard className="size-5 text-primary" />
        <span className="text-lg font-semibold text-foreground">Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {allItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
