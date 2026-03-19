import Link from 'next/link';
import {
  LayoutDashboard,
  Code2,
  FolderTree,
  FileText,
  Server,
  Route,
  Users,
  FlaskConical,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import * as adminService from '@/lib/services/admin/admin.service';

export default async function AdminDashboardPage() {
  const [user, stats] = await Promise.all([requireAdmin(), adminService.getDashboardStats()]);

  const quickLinks = [
    {
      href: '/admin/exercises/generate',
      label: 'Generate Exercise',
      icon: FlaskConical,
      description: 'Create a new platform exercise',
    },
    {
      href: '/admin/exercises',
      label: 'Exercises',
      icon: Code2,
      description: 'Manage all exercises',
    },
    {
      href: '/admin/categories',
      label: 'Categories',
      icon: FolderTree,
      description: 'Organize exercise categories',
    },
    {
      href: '/admin/templates',
      label: 'Templates',
      icon: FileText,
      description: 'Prompt templates',
    },
    {
      href: '/admin/environments',
      label: 'Environments',
      icon: Server,
      description: 'Execution environments',
    },
    {
      href: '/admin/paths',
      label: 'Learning Paths',
      icon: Route,
      description: 'View learning paths',
    },
    ...(user.role === 'super_admin'
      ? [{ href: '/admin/users', label: 'Users', icon: Users, description: 'User management' }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of platform activity and content."
        icon={LayoutDashboard}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard title="Total Exercises" value={stats.totalExercises} icon={Code2} />
        <AdminStatCard title="Validated Exercises" value={stats.validatedExercises} icon={Code2} />
        <AdminStatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <AdminStatCard title="Active Paths" value={stats.activePaths} icon={Route} />
        <AdminStatCard title="Prompt Templates" value={stats.totalTemplates} icon={FileText} />
        <AdminStatCard title="Environments" value={stats.totalEnvironments} icon={Server} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="group hover:border-primary/30 transition-all hover:shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="bg-primary/10 group-hover:bg-primary/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors">
                    <link.icon className="text-primary h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">{link.label}</p>
                    <p className="text-muted-foreground truncate text-xs">{link.description}</p>
                  </div>
                  <ArrowRight className="text-muted-foreground/50 group-hover:text-primary h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
