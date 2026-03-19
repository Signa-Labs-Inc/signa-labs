'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Users, Search, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
  AdminTableSkeleton,
  AdminEmptyState,
  AdminFilterBar,
} from '@/components/admin/admin-table-skeleton';

type User = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

const ROLE_STYLES: Record<string, string> = {
  learner: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  admin: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  super_admin: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (debouncedSearch) params.set('search', debouncedSearch);

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      setUsers(json.users ?? []);
      setTotalCount(json.totalCount ?? 0);
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRoleChange(userId: string, newRole: string) {
    const confirmed = window.confirm(
      `Are you sure you want to change this user's role to "${newRole}"?`
    );
    if (!confirmed) return;

    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      fetchData();
    } catch {
      console.error('Failed to update role');
    }
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Users" description={`${totalCount} users total`} icon={Users} />

      <AdminFilterBar>
        <div className="flex items-center gap-2">
          <Search className="text-muted-foreground h-4 w-4 shrink-0" />
          <Input
            placeholder="Search by email, name, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80"
          />
        </div>
      </AdminFilterBar>

      <div className="border-border overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border bg-muted/50 border-b">
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                User
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Email
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Role
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Joined
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                Change Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {loading ? (
              <AdminTableSkeleton columns={5} />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <AdminEmptyState message="No users found." icon={Inbox} />
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                        {(user.displayName ?? user.email)?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-medium">{user.displayName ?? user.username ?? '-'}</p>
                        {user.username && user.displayName && (
                          <p className="text-muted-foreground text-xs">@{user.username}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground px-4 py-4">{user.email}</td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className={ROLE_STYLES[user.role] ?? ''}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border-border bg-background focus:ring-ring h-8 rounded-md border px-2 text-sm focus:ring-1 focus:outline-none"
                    >
                      <option value="learner">learner</option>
                      <option value="admin">admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages} ({totalCount} results)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
