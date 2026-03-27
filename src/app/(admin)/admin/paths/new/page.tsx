'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertTriangle, Route, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LanguageIcon } from '@/components/ui/language-icon';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { cn } from '@/lib/utils/helpers';
import { usePathCreation } from '@/hooks/use-path-creation';

const LANGUAGES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'go', label: 'Go' },
  { value: 'sql', label: 'SQL' },
];

const LEVELS = [
  { value: 'beginner', label: 'Beginner', description: "I'm new to this" },
  {
    value: 'some_experience',
    label: 'Some Experience',
    description: "I've done tutorials but can't build from scratch",
  },
  { value: 'intermediate', label: 'Intermediate', description: 'I can build small projects' },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'I want to master specific advanced topics',
  },
];

export default function AdminNewPathPage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [level, setLevel] = useState('');
  const [featureOnCreate, setFeatureOnCreate] = useState(true);

  const { status, progress, error, result, startCreation } = usePathCreation();

  useEffect(() => {
    if (!result) return;

    if (featureOnCreate) {
      fetch(`/api/admin/paths/${result.pathId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: true, featuredOrder: null }),
      })
        .then(async (res) => {
          if (!res.ok) {
            toast.error(
              'Path created but failed to feature it. You can feature it manually from the paths list.'
            );
          }
          router.push('/admin/paths');
        })
        .catch(() => {
          toast.error(
            'Path created but failed to feature it. You can feature it manually from the paths list.'
          );
          router.push('/admin/paths');
        });
    } else {
      router.push('/admin/paths');
    }
  }, [result, featureOnCreate, router]);

  const handleCreate = useCallback(async () => {
    if (!prompt.trim() || !level) return;
    await startCreation({ prompt: prompt.trim(), language, startingLevel: level });
  }, [prompt, language, level, startCreation]);

  const isCreating = status !== 'idle' && status !== 'failed' && status !== 'completed';
  const isSubmittable = prompt.trim().length >= 10 && !!level && !isCreating;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Create Learning Path"
        description="Create a new path and optionally feature it on the discover page."
        icon={Route}
      />

      <div className="mx-auto max-w-3xl">
        {/* Composer card */}
        <div className="border-border/60 bg-card overflow-hidden rounded-2xl border shadow-sm">
          <div className="p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Describe the learning path"
              placeholder="What should this path teach? e.g. Master TypeScript generics, utility types, and advanced type patterns..."
              rows={3}
              maxLength={500}
              disabled={isCreating}
              className="placeholder:text-muted-foreground/50 w-full resize-none bg-transparent text-base outline-none disabled:opacity-50 md:text-sm"
            />
          </div>

          <div className="border-border/40 bg-muted/30 flex flex-wrap items-center gap-2 border-t px-4 py-3">
            <div className="border-border/60 bg-card flex items-center gap-1 rounded-lg border p-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  disabled={isCreating}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                    language === lang.value
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LanguageIcon language={lang.value} className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{lang.label}</span>
                </button>
              ))}
            </div>

            <span className="text-muted-foreground/50 ml-auto hidden text-xs tabular-nums sm:block">
              {prompt.length}/500
            </span>
          </div>
        </div>

        {/* Starting level */}
        <div className="mt-8">
          <Label className="text-base font-medium">Starting level</Label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                disabled={isCreating}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all',
                  level === l.value
                    ? 'border-primary bg-primary/5 ring-primary/20 ring-1'
                    : 'border-border/60 bg-card hover:border-foreground/20 hover:-translate-y-0.5'
                )}
              >
                <span className="text-sm font-medium">{l.label}</span>
                <p className="text-muted-foreground mt-0.5 text-xs">{l.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Feature toggle */}
        <div className="mt-6">
          <label className="bg-card border-border/60 flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all select-none">
            <input
              type="checkbox"
              checked={featureOnCreate}
              onChange={(e) => setFeatureOnCreate(e.target.checked)}
              disabled={isCreating}
              className="accent-primary h-4 w-4"
            />
            <Star
              className={cn('h-4 w-4', featureOnCreate ? 'text-primary' : 'text-muted-foreground')}
            />
            <div>
              <span className="text-sm font-medium">Feature this path on creation</span>
              <p className="text-muted-foreground text-xs">
                Automatically show on the discover and paths pages
              </p>
            </div>
          </label>
        </div>

        {/* Create button */}
        <div className="mt-8">
          <Button
            onClick={handleCreate}
            disabled={!isSubmittable}
            className="w-full gap-2"
            size="lg"
          >
            {isCreating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {progress ?? 'Crafting learning path...'}
              </>
            ) : (
              <>
                Create Path
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Progress steps */}
        {isCreating && (
          <div className="border-border/60 bg-card mt-4 overflow-hidden rounded-xl border">
            <div className="divide-border/60 flex items-stretch divide-x">
              <StepCard
                number={1}
                label="Submitting"
                active={status === 'submitting'}
                done={status === 'queued' || status === 'planning'}
              />
              <StepCard
                number={2}
                label="Queued"
                active={status === 'queued'}
                done={status === 'planning'}
              />
              <StepCard
                number={3}
                label="Building Path"
                active={status === 'planning'}
                done={false}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'failed' && error && (
          <div className="via-card mt-4 overflow-hidden rounded-xl border border-red-500/20 bg-linear-to-r from-red-500/5 to-red-500/5">
            <div className="flex items-start gap-3 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-medium text-red-300">Path creation failed</p>
                <p className="mt-1 text-sm text-red-300/80">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreate}
                  className="mt-3"
                  disabled={!prompt.trim() || !level}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepCard({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-3 px-4 py-3 transition-colors',
        done && 'bg-emerald-500/5',
        active && 'bg-primary/5'
      )}
    >
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
          done
            ? 'bg-emerald-500 text-white'
            : active
              ? 'bg-primary text-primary-foreground animate-pulse'
              : 'bg-muted text-muted-foreground'
        )}
      >
        {number}
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          done ? 'text-emerald-500' : active ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </div>
  );
}
