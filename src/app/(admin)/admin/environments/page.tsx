'use client';

import { useEffect, useState, useCallback } from 'react';
import { Server, Pencil, X, Check, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTableSkeleton, AdminEmptyState } from '@/components/admin/admin-table-skeleton';

type Environment = {
  id: string;
  name: string;
  displayName: string;
  baseImage: string;
  supportedLanguages: string[];
  maxExecutionSeconds: number;
  maxFiles: number;
  maxFileSizeBytes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type EditState = {
  maxExecutionSeconds: number;
  maxFiles: number;
  maxFileSizeBytes: number;
  isActive: boolean;
};

export default function AdminEnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/environments');
      const json = await res.json();
      setEnvironments(json.environments ?? json ?? []);
    } catch {
      console.error('Failed to fetch environments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function startEdit(env: Environment) {
    setEditingId(env.id);
    setEditState({
      maxExecutionSeconds: env.maxExecutionSeconds,
      maxFiles: env.maxFiles,
      maxFileSizeBytes: env.maxFileSizeBytes,
      isActive: env.isActive,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState(null);
  }

  async function handleSave(id: string) {
    if (!editState) return;
    await fetch(`/api/admin/environments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editState),
    });
    cancelEdit();
    fetchData();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Environments"
        description={`${environments.length} execution environments`}
        icon={Server}
      />

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Base Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Languages</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Max Exec (s)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Max Files</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Max File Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <AdminTableSkeleton columns={8} rows={3} />
            ) : environments.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <AdminEmptyState message="No environments found." icon={Inbox} />
                </td>
              </tr>
            ) : (
              environments.map((env) => {
                const isEditing = editingId === env.id;
                return (
                  <tr key={env.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">{env.displayName}</p>
                        <p className="text-xs text-muted-foreground">{env.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {env.baseImage}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(env.supportedLanguages ?? []).map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs font-normal">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 tabular-nums">
                      {isEditing && editState ? (
                        <Input
                          type="number"
                          value={editState.maxExecutionSeconds}
                          onChange={(e) =>
                            setEditState({ ...editState, maxExecutionSeconds: Number(e.target.value) })
                          }
                          className="h-8 w-20"
                        />
                      ) : (
                        <span className="text-muted-foreground">{env.maxExecutionSeconds}s</span>
                      )}
                    </td>
                    <td className="px-4 py-4 tabular-nums">
                      {isEditing && editState ? (
                        <Input
                          type="number"
                          value={editState.maxFiles}
                          onChange={(e) =>
                            setEditState({ ...editState, maxFiles: Number(e.target.value) })
                          }
                          className="h-8 w-20"
                        />
                      ) : (
                        <span className="text-muted-foreground">{env.maxFiles}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 tabular-nums">
                      {isEditing && editState ? (
                        <Input
                          type="number"
                          value={editState.maxFileSizeBytes}
                          onChange={(e) =>
                            setEditState({ ...editState, maxFileSizeBytes: Number(e.target.value) })
                          }
                          className="h-8 w-28"
                        />
                      ) : (
                        <span className="text-muted-foreground">{(env.maxFileSizeBytes / 1024).toFixed(0)} KB</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {isEditing && editState ? (
                        <Switch
                          checked={editState.isActive}
                          onCheckedChange={(val) =>
                            setEditState({ ...editState, isActive: val })
                          }
                        />
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 text-sm ${env.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${env.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`} />
                          {env.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleSave(env.id)}>
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(env)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
