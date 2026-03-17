'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Code2, Plus, Search, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTableSkeleton, AdminEmptyState, AdminFilterBar } from '@/components/admin/admin-table-skeleton';

type Exercise = {
  id: string;
  title: string;
  origin: string;
  language: string;
  difficulty: string;
  isValidated: boolean;
  isPublic: boolean;
  deletedAt: string | null;
  createdAt: string;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  easy: 'bg-green-500/10 text-green-600 border-green-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  hard: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  advanced: 'bg-red-500/10 text-red-600 border-red-500/20',
  expert: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [origin, setOrigin] = useState('');
  const [language, setLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [isValidated, setIsValidated] = useState('');
  const [isPublic, setIsPublic] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
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
    if (origin) params.set('origin', origin);
    if (language) params.set('language', language);
    if (difficulty) params.set('difficulty', difficulty);
    if (isValidated) params.set('isValidated', isValidated);
    if (isPublic) params.set('isPublic', isPublic);
    if (includeDeleted) params.set('includeDeleted', 'true');
    if (debouncedSearch) params.set('search', debouncedSearch);

    try {
      const res = await fetch(`/api/admin/exercises?${params}`);
      const json = await res.json();
      setExercises(json.exercises ?? []);
      setTotalCount(json.totalCount ?? 0);
    } catch {
      console.error('Failed to fetch exercises');
    } finally {
      setLoading(false);
    }
  }, [page, origin, language, difficulty, isValidated, isPublic, includeDeleted, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleValidate(id: string, validate: boolean) {
    await fetch(`/api/admin/exercises/${id}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isValidated: validate }),
    });
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this exercise?')) return;
    await fetch(`/api/admin/exercises/${id}`, { method: 'DELETE' });
    fetchData();
  }

  async function handleRestore(id: string) {
    await fetch(`/api/admin/exercises/${id}/restore`, { method: 'POST' });
    fetchData();
  }

  const totalPages = Math.ceil(totalCount / limit);
  const selectClasses = 'h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Exercises"
        description={`${totalCount} exercises total`}
        icon={Code2}
      >
        <Link href="/admin/exercises/generate">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Generate Exercise
          </Button>
        </Link>
      </AdminPageHeader>

      <AdminFilterBar>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        <select value={origin} onChange={(e) => { setOrigin(e.target.value); setPage(1); }} className={selectClasses}>
          <option value="">All Origins</option>
          <option value="platform">Platform</option>
          <option value="user">User</option>
        </select>
        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }} className={selectClasses}>
          <option value="">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select value={isValidated} onChange={(e) => { setIsValidated(e.target.value); setPage(1); }} className={selectClasses}>
          <option value="">All Validation</option>
          <option value="true">Validated</option>
          <option value="false">Not Validated</option>
        </select>
        <select value={isPublic} onChange={(e) => { setIsPublic(e.target.value); setPage(1); }} className={selectClasses}>
          <option value="">All Visibility</option>
          <option value="true">Public</option>
          <option value="false">Private</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(1); }}
            className="rounded"
          />
          Include deleted
        </label>
      </AdminFilterBar>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Origin</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Language</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Difficulty</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Visibility</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <AdminTableSkeleton columns={8} />
            ) : exercises.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <AdminEmptyState message="No exercises found." icon={Inbox} />
                </td>
              </tr>
            ) : (
              exercises.map((ex) => (
                <tr key={ex.id} className={`transition-colors hover:bg-muted/30 ${ex.deletedAt ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-4">
                    <Link href={`/admin/exercises/${ex.id}`} className="font-medium text-foreground hover:text-primary hover:underline">
                      {ex.title}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className="font-normal capitalize">
                      {ex.origin}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 capitalize text-muted-foreground">{ex.language}</td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className={DIFFICULTY_COLORS[ex.difficulty] ?? ''}>
                      {ex.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={ex.isValidated ? 'default' : 'secondary'}>
                      {ex.isValidated ? 'Validated' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-sm ${ex.isPublic ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${ex.isPublic ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`} />
                      {ex.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {new Date(ex.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleValidate(ex.id, !ex.isValidated)}
                      >
                        {ex.isValidated ? 'Invalidate' : 'Validate'}
                      </Button>
                      {ex.deletedAt ? (
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleRestore(ex.id)}>
                          Restore
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDelete(ex.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
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
