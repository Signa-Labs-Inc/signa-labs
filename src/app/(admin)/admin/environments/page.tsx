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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/environments');
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setFetchError(data?.error ?? `Failed to load environments (${res.status})`);
        return;
      }
      const json = await res.json();
      setEnvironments(json.environments ?? json ?? []);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : 'Network error — could not load environments.'
      );
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
    setSaveError(null);
  }

  async function handleSave(id: string) {
    if (!editState) return;
    setSaveError(null);

    try {
      const res = await fetch(`/api/admin/environments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editState),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSaveError(data?.error ?? `Request failed (${res.status})`);
        return;
      }

      cancelEdit();
      fetchData();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Network error — please try again.');
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Environments"
        description={`${environments.length} execution environments`}
        icon={Server}
      />

      {fetchError && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {fetchError}
        </div>
      )}

      <div className="border-border overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border bg-muted/50 border-b">
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Name
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Base Image
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Languages
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Max Exec (s)
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Max Files
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Max File Size
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Status
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
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
                  <tr key={env.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">{env.displayName}</p>
                        <p className="text-muted-foreground text-xs">{env.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
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
                          min={1}
                          step={1}
                          value={editState.maxExecutionSeconds}
                          onChange={(e) => {
                            const v = e.currentTarget.valueAsNumber;
                            if (Number.isFinite(v))
                              setEditState({ ...editState, maxExecutionSeconds: v });
                          }}
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
                          min={1}
                          step={1}
                          value={editState.maxFiles}
                          onChange={(e) => {
                            const v = e.currentTarget.valueAsNumber;
                            if (Number.isFinite(v)) setEditState({ ...editState, maxFiles: v });
                          }}
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
                          min={0}
                          step={1024}
                          value={editState.maxFileSizeBytes}
                          onChange={(e) => {
                            const v = e.currentTarget.valueAsNumber;
                            if (Number.isFinite(v))
                              setEditState({ ...editState, maxFileSizeBytes: v });
                          }}
                          className="h-8 w-28"
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {(env.maxFileSizeBytes / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {isEditing && editState ? (
                        <Switch
                          checked={editState.isActive}
                          onCheckedChange={(val) => setEditState({ ...editState, isActive: val })}
                          aria-label={`Toggle active state for ${env.displayName}`}
                        />
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm ${env.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${env.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`}
                          />
                          {env.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {isEditing ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleSave(env.id)}
                              aria-label={`Save changes for ${env.displayName}`}
                            >
                              <Check className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={cancelEdit}
                              aria-label="Cancel editing"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {saveError && (
                            <p className="text-destructive max-w-45 text-xs">{saveError}</p>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => startEdit(env)}
                          aria-label={`Edit ${env.displayName}`}
                        >
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
