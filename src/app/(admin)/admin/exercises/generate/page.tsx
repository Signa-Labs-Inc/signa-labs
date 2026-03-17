'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Plus, Trash2, FlaskConical, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const LANGUAGES = ['python', 'javascript', 'typescript', 'go', 'sql'];
const DIFFICULTIES = ['beginner', 'easy', 'medium', 'hard', 'expert'];
const EXERCISE_TYPES = ['algorithm', 'debugging', 'build', 'refactor', 'query', 'api', 'data_pipeline', 'config'];
const FILE_TYPES = ['starter', 'solution', 'test', 'support'] as const;

type FileEntry = {
  fileType: string;
  filePath: string;
  fileName: string;
  content: string;
};

type Environment = {
  id: string;
  name: string;
  displayName: string;
};

const FILE_BADGE_COLORS: Record<string, string> = {
  starter: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  solution: 'bg-green-500/10 text-green-500 border-green-500/20',
  test: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  support: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

export default function AdminExerciseGeneratePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  const [prompt, setPrompt] = useState('');
  const [aiLanguage, setAiLanguage] = useState('python');
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [aiExerciseType, setAiExerciseType] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{ runId: string } | null>(null);
  const [generationError, setGenerationError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [manualLanguage, setManualLanguage] = useState('python');
  const [manualDifficulty, setManualDifficulty] = useState('medium');
  const [environmentId, setEnvironmentId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [hintsInput, setHintsInput] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchEnvironments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/environments');
      if (res.ok) {
        const data = await res.json();
        setEnvironments(Array.isArray(data) ? data : data.environments ?? []);
      }
    } catch {
      console.error('Failed to fetch environments');
    }
  }, []);

  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenerationError('');
    setGenerationResult(null);

    try {
      const body: Record<string, string> = {
        mode: 'generate',
        prompt,
        language: aiLanguage,
        difficulty: aiDifficulty,
      };
      if (aiExerciseType) {
        body.exerciseType = aiExerciseType;
      }

      const res = await fetch('/api/admin/exercises/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Generation failed (${res.status})`);
      }

      const data = await res.json();
      setGenerationResult({ runId: data.runId ?? data.id ?? 'unknown' });
    } catch (err: unknown) {
      setGenerationError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
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
    setFiles((prev) => [...prev, { fileType, filePath: d.filePath, fileName: d.fileName, content: '' }]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFile(index: number, field: keyof FileEntry, value: string) {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  }

  async function handleCreate() {
    if (!title.trim()) return;
    setCreating(true);
    setCreateError('');

    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const hints = hintsInput.split('\n').map((h) => h.trim()).filter(Boolean);

      const res = await fetch('/api/admin/exercises/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'manual',
          title,
          description,
          language: manualLanguage,
          difficulty: manualDifficulty,
          environmentId: environmentId || undefined,
          tags,
          hints,
          isValidated,
          isPublic,
          files,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Creation failed (${res.status})`);
      }

      const data = await res.json();
      router.push(`/admin/exercises/${data.id ?? data.exercise?.id}`);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setCreating(false);
    }
  }

  const selectClasses = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Generate / Create Exercise"
        description="Use AI to generate or manually create a new exercise"
        icon={FlaskConical}
      />

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          onClick={() => setActiveTab('ai')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'ai'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FlaskConical className="h-4 w-4" />
          AI Generate
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'manual'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <PenLine className="h-4 w-4" />
          Manual Create
        </button>
      </div>

      {activeTab === 'ai' && (
        <Card className="max-w-2xl">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder="Describe the exercise you want to generate..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Language</label>
                <select value={aiLanguage} onChange={(e) => setAiLanguage(e.target.value)} className={selectClasses}>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Difficulty</label>
                <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)} className={selectClasses}>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Type (optional)</label>
                <select value={aiExerciseType} onChange={(e) => setAiExerciseType(e.target.value)} className={selectClasses}>
                  <option value="">None</option>
                  {EXERCISE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={generating || !prompt.trim()}>
              {generating ? 'Generating...' : 'Generate'}
            </Button>

            {generationError && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {generationError}
              </div>
            )}

            {generationResult && (
              <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Generation started successfully!</p>
                <p className="text-sm text-muted-foreground">
                  Run ID: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{generationResult.runId}</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Note: The generated exercise will be created with origin &quot;user&quot; (hardcoded by the generation service).
                  You can convert it to a platform exercise from the exercise detail page.
                </p>
                <Button variant="outline" size="sm" onClick={() => router.push('/admin/exercises')}>
                  Go to Exercises List
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'manual' && (
        <div className="space-y-6">
          <Card className="max-w-2xl">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-base font-semibold">Exercise Details</h3>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exercise title" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description (Markdown)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Exercise description in markdown..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-y font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Language</label>
                  <select value={manualLanguage} onChange={(e) => setManualLanguage(e.target.value)} className={selectClasses}>
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Difficulty</label>
                  <select value={manualDifficulty} onChange={(e) => setManualDifficulty(e.target.value)} className={selectClasses}>
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Environment</label>
                <select value={environmentId} onChange={(e) => setEnvironmentId(e.target.value)} className={selectClasses}>
                  <option value="">Select Environment</option>
                  {environments.map((env) => (
                    <option key={env.id} value={env.id}>{env.displayName || env.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Hints (one per line)</label>
                <textarea
                  value={hintsInput}
                  onChange={(e) => setHintsInput(e.target.value)}
                  rows={4}
                  placeholder="First hint&#10;Second hint&#10;Third hint"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-ring"
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
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-base font-semibold">Files</h3>

            {FILE_TYPES.map((fileType) => {
              const typeFiles = files
                .map((f, i) => ({ ...f, _index: i }))
                .filter((f) => f.fileType === fileType);

              return (
                <Card key={fileType}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={FILE_BADGE_COLORS[fileType]}>
                          {fileType}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {typeFiles.length} file{typeFiles.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => addFile(fileType)}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add File
                      </Button>
                    </div>

                    {typeFiles.map((file) => (
                      <div key={file._index} className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={file.filePath}
                            onChange={(e) => updateFile(file._index, 'filePath', e.target.value)}
                            placeholder="File path (e.g. src/)"
                            className="flex-1"
                          />
                          <Input
                            value={file.fileName}
                            onChange={(e) => updateFile(file._index, 'fileName', e.target.value)}
                            placeholder="File name"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => removeFile(file._index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <textarea
                          value={file.content}
                          onChange={(e) => updateFile(file._index, 'content', e.target.value)}
                          placeholder="File content..."
                          className="font-mono text-sm bg-background border border-border rounded-md p-3 w-full min-h-[200px] resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {createError && (
            <div className="max-w-2xl rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {createError}
            </div>
          )}

          <Button onClick={handleCreate} disabled={creating || !title.trim()}>
            {creating ? 'Creating...' : 'Create Exercise'}
          </Button>
        </div>
      )}
    </div>
  );
}
