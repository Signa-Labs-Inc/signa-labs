'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Plus, Pencil, X, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTableSkeleton, AdminEmptyState } from '@/components/admin/admin-table-skeleton';

type PromptTemplate = {
  id: string;
  name: string;
  description: string | null;
  templateText: string;
  exerciseType: string;
  supportedLanguages: string[];
  environmentId: string | null;
  environmentName: string | null;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Environment = {
  id: string;
  name: string;
  displayName: string;
};

type TemplateForm = {
  name: string;
  description: string;
  templateText: string;
  exerciseType: string;
  supportedLanguages: string;
  environmentId: string;
};

const emptyForm: TemplateForm = {
  name: '',
  description: '',
  templateText: '',
  exerciseType: 'practice',
  supportedLanguages: '',
  environmentId: '',
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tplRes, envRes] = await Promise.all([
        fetch('/api/admin/templates'),
        fetch('/api/admin/environments'),
      ]);
      const tplJson = await tplRes.json();
      const envJson = await envRes.json();
      setTemplates(tplJson.templates ?? tplJson ?? []);
      setEnvironments(envJson.environments ?? envJson ?? []);
    } catch {
      console.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function startEdit(tpl: PromptTemplate) {
    setEditingId(tpl.id);
    setShowForm(true);
    setForm({
      name: tpl.name,
      description: tpl.description ?? '',
      templateText: tpl.templateText,
      exerciseType: tpl.exerciseType,
      supportedLanguages: (tpl.supportedLanguages ?? []).join(', '),
      environmentId: tpl.environmentId ?? '',
    });
  }

  function cancelForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(emptyForm);
  }

  async function handleSave() {
    const supportedLanguages = form.supportedLanguages
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    const body = {
      ...form,
      supportedLanguages,
      environmentId: form.environmentId || null,
    };

    if (editingId) {
      await fetch(`/api/admin/templates/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    cancelForm();
    fetchData();
  }

  async function handleToggleActive(id: string) {
    await fetch(`/api/admin/templates/${id}/activate`, { method: 'POST' });
    fetchData();
  }

  const selectClasses = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Prompt Templates"
        description={`${templates.length} templates`}
        icon={FileText}
      >
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Template
        </Button>
      </AdminPageHeader>

      {showForm && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {editingId ? 'Edit Template' : 'New Template'}
              </h3>
              <Button variant="ghost" size="sm" onClick={cancelForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Exercise Type</label>
                <select
                  value={form.exerciseType}
                  onChange={(e) => setForm({ ...form, exerciseType: e.target.value })}
                  className={selectClasses}
                >
                  <option value="practice">Practice</option>
                  <option value="challenge">Challenge</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Template Text</label>
              <textarea
                value={form.templateText}
                onChange={(e) => setForm({ ...form, templateText: e.target.value })}
                rows={8}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Supported Languages (comma-separated)</label>
                <Input
                  value={form.supportedLanguages}
                  onChange={(e) => setForm({ ...form, supportedLanguages: e.target.value })}
                  placeholder="python, javascript, go"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Environment</label>
                <select
                  value={form.environmentId}
                  onChange={(e) => setForm({ ...form, environmentId: e.target.value })}
                  className={selectClasses}
                >
                  <option value="">None</option>
                  {environments.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.displayName || env.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleSave}>
              {editingId ? 'Update Template' : 'Create Template'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Version</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Languages</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Environment</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <AdminTableSkeleton columns={7} rows={3} />
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <AdminEmptyState message="No templates found." icon={Inbox} />
                </td>
              </tr>
            ) : (
              templates.map((tpl) => (
                <tr key={tpl.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-4 font-medium">{tpl.name}</td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className="capitalize font-normal">{tpl.exerciseType}</Badge>
                  </td>
                  <td className="px-4 py-4 tabular-nums text-muted-foreground">v{tpl.version}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-sm ${tpl.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${tpl.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`} />
                      {tpl.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(tpl.supportedLanguages ?? []).map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs font-normal">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {tpl.environmentName ?? <span className="italic">None</span>}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(tpl)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleToggleActive(tpl.id)}
                      >
                        {tpl.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
