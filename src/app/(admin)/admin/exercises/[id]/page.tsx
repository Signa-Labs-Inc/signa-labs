'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Code2,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  FolderTree,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { cn } from '@/lib/utils/helpers';

const DIFFICULTIES = ['beginner', 'easy', 'medium', 'hard', 'expert'];
const LANGUAGES = ['python', 'javascript', 'typescript', 'go', 'sql'];
const FILE_TYPES = ['starter', 'solution', 'test', 'support'] as const;

type Category = {
  id: string;
  slug: string;
  label: string;
  description: string;
  icon: string;
  tags: string[];
  isActive: boolean;
};

type ExerciseFile = {
  id?: string;
  fileType: string;
  filePath: string;
  fileName: string;
  content: string;
  isEditable: boolean;
  sortOrder: number;
};

type ExerciseDetail = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  language: string;
  tags: string[];
  hints: string[];
  isValidated: boolean;
  isPublic: boolean;
  origin: string;
  slug: string;
  deletedAt: string | null;
  createdAt: string;
  environment: { id: string; name: string; displayName: string } | null;
  files: ExerciseFile[];
};

const FILE_BADGE_COLORS: Record<string, string> = {
  starter: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  solution: 'bg-green-500/10 text-green-500 border-green-500/20',
  test: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  support: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-muted h-8 w-32 animate-pulse rounded" />
      <div className="space-y-2">
        <div className="bg-muted h-7 w-64 animate-pulse rounded" />
        <div className="bg-muted h-4 w-48 animate-pulse rounded" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-5 w-24 animate-pulse rounded" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-muted h-6 w-32 animate-pulse rounded" />
              <div className="bg-muted h-24 w-full animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [language, setLanguage] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaMessage, setMetaMessage] = useState('');

  const [files, setFiles] = useState<ExerciseFile[]>([]);
  const [savingFiles, setSavingFiles] = useState(false);
  const [filesMessage, setFilesMessage] = useState('');
  const [activeFileTab, setActiveFileTab] = useState<string>('starter');

  const [hintsInput, setHintsInput] = useState('');
  const [savingHints, setSavingHints] = useState(false);
  const [hintsMessage, setHintsMessage] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [savingCategories, setSavingCategories] = useState(false);
  const [categoriesMessage, setCategoriesMessage] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  const [metaOpen, setMetaOpen] = useState(true);
  const [filesOpen, setFilesOpen] = useState(true);
  const [hintsOpen, setHintsOpen] = useState(true);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchExercise = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/exercises/${id}`);
      if (!res.ok) throw new Error('Not found');
      const json: ExerciseDetail = await res.json();
      setExercise(json);
      setTitle(json.title ?? '');
      setDescription(json.description ?? '');
      setDifficulty(json.difficulty ?? 'medium');
      setLanguage(json.language ?? 'python');
      setTagsInput((json.tags ?? []).join(', '));
      setIsValidated(json.isValidated ?? false);
      setIsPublic(json.isPublic ?? false);
      setFiles(
        (json.files ?? []).map((f) => ({
          id: f.id,
          fileType: f.fileType,
          filePath: f.filePath,
          fileName: f.fileName,
          content: f.content ?? '',
          isEditable: f.isEditable ?? false,
          sortOrder: f.sortOrder ?? 0,
        }))
      );
      setHintsInput((json.hints ?? []).join('\n'));
    } catch {
      console.error('Failed to fetch exercise');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) return;
      const json = await res.json();
      const cats: Category[] = json.categories ?? json ?? [];
      setCategories(cats);
      return cats;
    } catch {
      // non-critical — category picker just won't appear
    }
  }, []);

  useEffect(() => {
    fetchExercise();
    fetchCategories();
  }, [fetchExercise, fetchCategories]);

  // Derive which categories the exercise belongs to based on current tags
  useEffect(() => {
    if (categories.length === 0) return;
    const currentTags = new Set(
      tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    );
    const matched = new Set<string>();
    for (const cat of categories) {
      if (cat.tags.length > 0 && cat.tags.every((t) => currentTags.has(t))) {
        matched.add(cat.id);
      }
    }
    setSelectedCategoryIds(matched);
  }, [tagsInput, categories]);

  function handleToggleCategory(categoryId: string) {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    const currentTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const isSelected = selectedCategoryIds.has(categoryId);

    let newTags: string[];
    if (isSelected) {
      // Remove this category's tags (only if not needed by another selected category)
      const otherSelectedCats = categories.filter(
        (c) => c.id !== categoryId && selectedCategoryIds.has(c.id)
      );
      const tagsNeededByOthers = new Set(otherSelectedCats.flatMap((c) => c.tags));
      newTags = currentTags.filter((t) => !category.tags.includes(t) || tagsNeededByOthers.has(t));
    } else {
      // Add this category's tags
      const tagSet = new Set(currentTags);
      for (const t of category.tags) tagSet.add(t);
      newTags = Array.from(tagSet);
    }

    setTagsInput(newTags.join(', '));
  }

  async function handleSaveCategories() {
    setSavingCategories(true);
    setCategoriesMessage('');
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await fetch(`/api/admin/exercises/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      setExercise((prev) => (prev ? { ...prev, ...updated } : prev));
      setCategoriesMessage('Categories saved successfully.');
    } catch {
      setCategoriesMessage('Failed to save categories.');
    } finally {
      setSavingCategories(false);
    }
  }

  async function handleSaveMeta() {
    setSavingMeta(true);
    setMetaMessage('');
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await fetch(`/api/admin/exercises/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          language,
          tags,
          isValidated,
          isPublic,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      setExercise((prev) => (prev ? { ...prev, ...updated } : prev));
      setMetaMessage('Metadata saved successfully.');
    } catch {
      setMetaMessage('Failed to save metadata.');
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleSaveFiles() {
    setSavingFiles(true);
    setFilesMessage('');
    try {
      const res = await fetch(`/api/admin/exercises/${id}/files/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      const returnedFiles: ExerciseFile[] = Array.isArray(data) ? data : (data.files ?? []);
      if (returnedFiles.length > 0) {
        setFiles(
          returnedFiles.map((f: ExerciseFile) => ({
            id: f.id,
            fileType: f.fileType,
            filePath: f.filePath,
            fileName: f.fileName,
            content: f.content ?? '',
            isEditable: f.isEditable ?? false,
            sortOrder: f.sortOrder ?? 0,
          }))
        );
      }
      setFilesMessage('Files saved successfully.');
    } catch {
      setFilesMessage('Failed to save files.');
    } finally {
      setSavingFiles(false);
    }
  }

  async function handleSaveHints() {
    setSavingHints(true);
    setHintsMessage('');
    try {
      const hints = hintsInput
        .split('\n')
        .map((h) => h.trim())
        .filter(Boolean);
      const res = await fetch(`/api/admin/exercises/${id}/hints`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hints }),
      });
      if (!res.ok) throw new Error('Save failed');
      setHintsMessage('Hints saved successfully.');
    } catch {
      setHintsMessage('Failed to save hints.');
    } finally {
      setSavingHints(false);
    }
  }

  function addFile(fileType: string) {
    const defaults: Record<string, { filePath: string; fileName: string }> = {
      starter: { filePath: 'src/', fileName: 'main' },
      solution: { filePath: 'solution/', fileName: 'main' },
      test: { filePath: 'tests/', fileName: 'test_main' },
      support: { filePath: 'support/', fileName: 'helper' },
    };
    const d = defaults[fileType] ?? { filePath: '', fileName: '' };
    setFiles((prev) => [
      ...prev,
      {
        fileType,
        filePath: d.filePath,
        fileName: d.fileName,
        content: '',
        isEditable: fileType === 'starter',
        sortOrder: prev.filter((f) => f.fileType === fileType).length,
      },
    ]);
  }

  function removeFile(index: number) {
    if (!window.confirm('Remove this file?')) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFile(index: number, field: keyof ExerciseFile, value: string | boolean | number) {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  }

  const [deleteError, setDeleteError] = useState('');

  async function handleDelete() {
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/exercises/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleteError(data?.error ?? `Delete failed (${res.status})`);
        return;
      }
      router.push('/admin/exercises');
    } catch {
      setDeleteError('Network error — could not delete exercise.');
    }
  }

  async function handleRestore() {
    try {
      const res = await fetch(`/api/admin/exercises/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedAt: null }),
      });
      if (res.ok) {
        setExercise((prev) => (prev ? { ...prev, deletedAt: null } : prev));
      }
    } catch {
      console.error('Failed to restore');
    }
  }

  const selectClasses =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring';

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
          <Code2 className="text-muted-foreground h-6 w-6" />
        </div>
        <p className="text-muted-foreground text-sm">Exercise not found.</p>
        <Link href="/admin/exercises">
          <Button variant="outline" size="sm">
            Back to Exercises
          </Button>
        </Link>
      </div>
    );
  }

  const filesByType = FILE_TYPES.reduce(
    (acc, type) => {
      acc[type] = files.map((f, i) => ({ ...f, _index: i })).filter((f) => f.fileType === type);
      return acc;
    },
    {} as Record<string, (ExerciseFile & { _index: number })[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/exercises">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <AdminPageHeader title={exercise.title} description={`ID: ${exercise.id}`} icon={Code2} />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="capitalize">
          {exercise.origin}
        </Badge>
        <Badge variant="secondary">{exercise.slug}</Badge>
        <Badge variant="secondary">{files.length} files</Badge>
        {exercise.environment && (
          <Badge variant="secondary">{exercise.environment.displayName}</Badge>
        )}
        {exercise.deletedAt && <Badge variant="destructive">Deleted</Badge>}
      </div>

      {/* Section 1: Metadata */}
      <Card>
        <button
          onClick={() => setMetaOpen(!metaOpen)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <h3 className="text-base font-semibold">Metadata</h3>
          {metaOpen ? (
            <ChevronDown className="text-muted-foreground h-5 w-5" />
          ) : (
            <ChevronRight className="text-muted-foreground h-5 w-5" />
          )}
        </button>
        {metaOpen && (
          <CardContent className="border-border space-y-4 border-t px-5 pt-5 pb-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="border-border bg-background focus:ring-ring w-full resize-y rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={selectClasses}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={selectClasses}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={isValidated} onCheckedChange={setIsValidated} />
                Validated
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                Public
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSaveMeta} disabled={savingMeta}>
                <Save className="mr-1.5 h-4 w-4" />
                {savingMeta ? 'Saving...' : 'Save Metadata'}
              </Button>
              {metaMessage && (
                <span
                  className={cn(
                    'text-sm',
                    metaMessage.includes('success') ? 'text-emerald-600' : 'text-destructive'
                  )}
                >
                  {metaMessage}
                </span>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Section 2: Categories */}
      {categories.length > 0 && (
        <Card>
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="flex w-full items-center justify-between p-5 text-left"
          >
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <FolderTree className="text-muted-foreground h-4 w-4" />
              Categories
            </h3>
            {categoriesOpen ? (
              <ChevronDown className="text-muted-foreground h-5 w-5" />
            ) : (
              <ChevronRight className="text-muted-foreground h-5 w-5" />
            )}
          </button>
          {categoriesOpen && (
            <CardContent className="border-border space-y-4 border-t px-5 pt-5 pb-5">
              <p className="text-muted-foreground text-sm">
                Select which categories this exercise belongs to. This updates the exercise&apos;s
                tags to match.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {categories
                  .filter((c) => c.isActive)
                  .map((cat) => {
                    const isSelected = selectedCategoryIds.has(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleToggleCategory(cat.id)}
                        className={cn(
                          'flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30 hover:bg-muted/30'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/30'
                            )}
                          >
                            {isSelected && '✓'}
                          </div>
                          <span className="text-sm font-medium">{cat.label}</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-1 pl-7 text-xs">
                          {cat.description}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1 pl-7">
                          {cat.tags.map((t) => (
                            <Badge key={t} variant="secondary" className="px-1.5 py-0 text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </button>
                    );
                  })}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSaveCategories} disabled={savingCategories}>
                  <Save className="mr-1.5 h-4 w-4" />
                  {savingCategories ? 'Saving...' : 'Save Categories'}
                </Button>
                {categoriesMessage && (
                  <span
                    className={cn(
                      'text-sm',
                      categoriesMessage.includes('success')
                        ? 'text-emerald-600'
                        : 'text-destructive'
                    )}
                  >
                    {categoriesMessage}
                  </span>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Section 3: Files */}
      <Card>
        <button
          onClick={() => setFilesOpen(!filesOpen)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <h3 className="text-base font-semibold">Exercise Files</h3>
          {filesOpen ? (
            <ChevronDown className="text-muted-foreground h-5 w-5" />
          ) : (
            <ChevronRight className="text-muted-foreground h-5 w-5" />
          )}
        </button>
        {filesOpen && (
          <CardContent className="border-border space-y-4 border-t px-5 pt-5 pb-5">
            <div className="bg-muted flex gap-1 rounded-lg p-1">
              {FILE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFileTab(type)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                    activeFileTab === type
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {type} ({filesByType[type]?.length ?? 0})
                </button>
              ))}
            </div>

            {FILE_TYPES.filter((type) => type === activeFileTab).map((fileType) => (
              <div key={fileType} className="space-y-3">
                {filesByType[fileType]?.map((file) => (
                  <div
                    key={file._index}
                    className="border-border bg-muted/30 space-y-2 rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={FILE_BADGE_COLORS[fileType]}>
                        {fileType}
                      </Badge>
                      <Input
                        value={file.filePath}
                        onChange={(e) => updateFile(file._index, 'filePath', e.target.value)}
                        placeholder="File path"
                        className="flex-1"
                      />
                      <Input
                        value={file.fileName}
                        onChange={(e) => updateFile(file._index, 'fileName', e.target.value)}
                        placeholder="File name"
                        className="flex-1"
                      />
                      {fileType === 'starter' && (
                        <label className="text-muted-foreground flex items-center gap-1.5 text-xs whitespace-nowrap">
                          <Switch
                            checked={file.isEditable}
                            onCheckedChange={(checked) =>
                              updateFile(file._index, 'isEditable', checked)
                            }
                          />
                          Editable
                        </label>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        onClick={() => removeFile(file._index)}
                        aria-label={`Remove ${file.fileName || fileType} file`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <textarea
                      value={file.content}
                      onChange={(e) => updateFile(file._index, 'content', e.target.value)}
                      placeholder="File content..."
                      className="bg-background border-border focus:ring-ring min-h-[200px] w-full resize-y rounded-md border p-3 font-mono text-sm focus:ring-1 focus:outline-none"
                    />
                  </div>
                ))}

                {(filesByType[fileType]?.length ?? 0) === 0 && (
                  <div className="border-border flex flex-col items-center gap-2 rounded-lg border border-dashed py-8">
                    <p className="text-muted-foreground text-sm">No {fileType} files yet.</p>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={() => addFile(fileType)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add {fileType} File
                </Button>
              </div>
            ))}

            <div className="border-border flex items-center gap-3 border-t pt-4">
              <Button onClick={handleSaveFiles} disabled={savingFiles}>
                <Save className="mr-1.5 h-4 w-4" />
                {savingFiles ? 'Saving...' : 'Save All Files'}
              </Button>
              {filesMessage && (
                <span
                  className={cn(
                    'text-sm',
                    filesMessage.includes('success') ? 'text-emerald-600' : 'text-destructive'
                  )}
                >
                  {filesMessage}
                </span>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Section 3: Hints */}
      <Card>
        <button
          onClick={() => setHintsOpen(!hintsOpen)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <h3 className="text-base font-semibold">Hints</h3>
          {hintsOpen ? (
            <ChevronDown className="text-muted-foreground h-5 w-5" />
          ) : (
            <ChevronRight className="text-muted-foreground h-5 w-5" />
          )}
        </button>
        {hintsOpen && (
          <CardContent className="border-border space-y-4 border-t px-5 pt-5 pb-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Hints (one per line)</label>
              <textarea
                value={hintsInput}
                onChange={(e) => setHintsInput(e.target.value)}
                rows={6}
                placeholder="First hint&#10;Second hint&#10;Third hint"
                className="border-border bg-background focus:ring-ring w-full resize-y rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSaveHints} disabled={savingHints}>
                <Save className="mr-1.5 h-4 w-4" />
                {savingHints ? 'Saving...' : 'Save Hints'}
              </Button>
              {hintsMessage && (
                <span
                  className={cn(
                    'text-sm',
                    hintsMessage.includes('success') ? 'text-emerald-600' : 'text-destructive'
                  )}
                >
                  {hintsMessage}
                </span>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Section 4: Danger Zone */}
      <Card className="border-destructive/30">
        <button
          onClick={() => setDangerOpen(!dangerOpen)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <h3 className="text-destructive flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </h3>
          {dangerOpen ? (
            <ChevronDown className="text-muted-foreground h-5 w-5" />
          ) : (
            <ChevronRight className="text-muted-foreground h-5 w-5" />
          )}
        </button>
        {dangerOpen && (
          <CardContent className="border-destructive/30 space-y-4 border-t px-5 pt-5 pb-5">
            {exercise.deletedAt ? (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  This exercise was soft-deleted. You can restore it.
                </p>
                <Button variant="outline" onClick={handleRestore}>
                  Restore Exercise
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Soft-delete this exercise. It can be restored later.
                </p>
                {!deleteConfirm ? (
                  <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
                    Delete Exercise
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-destructive text-sm font-medium">Are you sure?</span>
                      <Button variant="destructive" onClick={handleDelete}>
                        Yes, Delete
                      </Button>
                      <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                        Cancel
                      </Button>
                    </div>
                    {deleteError && <p className="text-destructive text-sm">{deleteError}</p>}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
