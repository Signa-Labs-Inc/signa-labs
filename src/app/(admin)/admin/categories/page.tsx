'use client';

import { useEffect, useState, useCallback } from 'react';
import { FolderTree, ChevronUp, ChevronDown, Plus, Trash2, Pencil, X, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTableSkeleton, AdminEmptyState } from '@/components/admin/admin-table-skeleton';

type Category = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  icon: string;
  tags: string[];
  sortOrder: number;
  isActive: boolean;
};

type CategoryForm = {
  slug: string;
  label: string;
  description: string;
  icon: string;
  tags: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm: CategoryForm = {
  slug: '',
  label: '',
  description: '',
  icon: '',
  tags: '',
  sortOrder: 0,
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      setCategories(json.categories ?? json ?? []);
    } catch {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setShowAddForm(false);
    setForm({
      slug: cat.slug,
      label: cat.label,
      description: cat.description ?? '',
      icon: cat.icon,
      tags: (cat.tags ?? []).join(', '),
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setShowAddForm(false);
    setForm(emptyForm);
  }

  async function handleSave() {
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const body = { ...form, tags, sortOrder: Number(form.sortOrder) };

    if (editingId) {
      await fetch(`/api/admin/categories/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    cancelEdit();
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    fetchData();
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    fetchData();
  }

  async function handleReorder(id: string, direction: 'up' | 'down') {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const reordered = categories.map((c) => c.id);
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

    await fetch('/api/admin/categories/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: reordered }),
    });
    fetchData();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description={`${categories.length} categories`}
        icon={FolderTree}
      >
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Category
        </Button>
      </AdminPageHeader>

      {(showAddForm || editingId) && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {editingId ? 'Edit Category' : 'New Category'}
              </h3>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. algorithms"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Label</label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Algorithms"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Icon</label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.g. brain"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Sort Order</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="border-border bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="tag1, tag2"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(val) => setForm({ ...form, isActive: val })}
              />
              <span className="text-sm">Active</span>
            </div>
            <Button onClick={handleSave}>
              {editingId ? 'Update Category' : 'Create Category'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="border-border overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border bg-muted/50 border-b">
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Order
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Icon
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Label
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Description
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Tags
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Active
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {loading ? (
              <AdminTableSkeleton columns={7} rows={4} />
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <AdminEmptyState message="No categories found." icon={Inbox} />
                </td>
              </tr>
            ) : (
              categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={idx === 0}
                        onClick={() => handleReorder(cat.id, 'up')}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={idx === categories.length - 1}
                        onClick={() => handleReorder(cat.id, 'down')}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <span className="text-muted-foreground ml-1 tabular-nums">
                        {cat.sortOrder}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-base">{cat.icon}</span>
                  </td>
                  <td className="px-4 py-4 font-medium">{cat.label}</td>
                  <td className="text-muted-foreground max-w-[200px] truncate px-4 py-4">
                    {cat.description}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(cat.tags ?? []).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Switch
                      checked={cat.isActive}
                      onCheckedChange={(val) => handleToggleActive(cat.id, val)}
                    />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => startEdit(cat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
