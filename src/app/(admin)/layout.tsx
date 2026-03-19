import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/services/auth/auth.service';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    redirect('/dashboard');
  }

  return (
    <div className="bg-background flex h-screen">
      <AdminSidebar userRole={user.role} />
      <div className="flex-1 overflow-auto">
        <div className="border-border bg-card/50 border-b px-8 py-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">Admin Portal</span>
            <span className="text-muted-foreground text-sm">{user.email}</span>
          </div>
        </div>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
