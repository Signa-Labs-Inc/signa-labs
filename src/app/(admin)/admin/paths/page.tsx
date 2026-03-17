'use client';

import { useEffect, useState, useCallback } from 'react';
import { Route, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTableSkeleton, AdminEmptyState, AdminFilterBar } from '@/components/admin/admin-table-skeleton';

type LearningPath = {
  id: string;
  title: string;
  language: string;
  status: string;
  startingLevel: string;
  currentMilestoneIndex: number;
  totalMilestones: number;
  totalExercisesCompleted: number;
  estimatedTotalExercises: number;
  createdAt: string;
  userEmail: string | null;
};

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  active: { dot: 'bg-emerald-500', text: 'text-emerald-600' },
  completed: { dot: 'bg-blue-500', text: 'text-blue-600' },
  paused: { dot: 'bg-amber-500', text: 'text-amber-600' },
  abandoned: { dot: 'bg-red-500', text: 'text-red-600' },
};

export default function AdminPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (status) params.set('status', status);
    if (language) params.set('language', language);

    try {
      const res = await fetch(`/api/admin/paths?${params}`);
      const json = await res.json();
      setPaths(json.paths ?? []);
      setTotalCount(json.totalCount ?? 0);
    } catch {
      console.error('Failed to fetch learning paths');
    } finally {
      setLoading(false);
    }
  }, [page, status, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(totalCount / limit);
  const selectClasses = 'h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Learning Paths"
        description={`${totalCount} learning paths total`}
        icon={Route}
      />

      <AdminFilterBar>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={selectClasses}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="abandoned">Abandoned</option>
        </select>
        <select value={language} onChange={(e) => { setLanguage(e.target.value); setPage(1); }} className={selectClasses}>
          <option value="">All Languages</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="java">Java</option>
        </select>
      </AdminFilterBar>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Language</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Exercises</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <AdminTableSkeleton columns={7} />
            ) : paths.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <AdminEmptyState message="No learning paths found." icon={Inbox} />
                </td>
              </tr>
            ) : (
              paths.map((path) => {
                const style = STATUS_STYLES[path.status] ?? STATUS_STYLES.paused;
                const progress = path.totalMilestones > 0
                  ? Math.round((path.currentMilestoneIndex / path.totalMilestones) * 100)
                  : 0;
                return (
                  <tr key={path.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-4 font-medium">{path.title}</td>
                    <td className="px-4 py-4 text-muted-foreground">{path.userEmail ?? '-'}</td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary" className="text-xs font-normal capitalize">{path.language}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm capitalize ${style.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {path.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-xs text-muted-foreground">
                          {path.currentMilestoneIndex}/{path.totalMilestones}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 tabular-nums text-muted-foreground">
                      {path.totalExercisesCompleted}
                      {path.estimatedTotalExercises > 0 && (
                        <span className="text-muted-foreground/50">/{path.estimatedTotalExercises}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(path.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({totalCount} results)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
