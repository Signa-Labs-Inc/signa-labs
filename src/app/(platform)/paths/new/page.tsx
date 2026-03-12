'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, AlertTriangle, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LanguageIcon } from '@/components/ui/language-icon';
import { cn } from '@/lib/utils/helpers';
import { usePathCreation } from '@/hooks/use-path-creation';

// ============================================================
// Constants
// ============================================================

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

const EXAMPLE_PROMPTS = [
  'I want to learn to build React components with Tailwind',
  'Teach me data structures and algorithms in Python',
  'Master TypeScript generics and advanced types',
  'Build REST APIs with Express',
  'Learn SQL from basic queries to complex joins',
  'Teach me Go concurrency patterns',
];

// ============================================================
// Component
// ============================================================

export default function NewPathPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState(searchParams.get('prompt') ?? '');
  const [language, setLanguage] = useState(searchParams.get('language') ?? 'typescript');
  const [level, setLevel] = useState(searchParams.get('level') ?? '');

  const { status, progress, error, result, startCreation } = usePathCreation();

  useEffect(() => {
    if (result) {
      router.push(`/paths/${result.pathId}`);
    }
  }, [result, router]);

  const handleCreate = useCallback(async () => {
    if (!prompt.trim() || !level) return;
    await startCreation({ prompt: prompt.trim(), language, startingLevel: level });
  }, [prompt, language, level, startCreation]);

  const isCreating = status !== 'idle' && status !== 'failed' && status !== 'completed';
  const isSubmittable = prompt.trim().length >= 10 && !!level && !isCreating;

  return (
    <div className="animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-violet-400/20">
            <Route className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Start a Learning Path</h1>
          <p className="text-muted-foreground mt-2">
            Describe what you want to learn and we&apos;ll craft a personalized curriculum that
            adapts to your progress.
          </p>
        </div>
      </div>

      {/* ── Composer ── */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Main input card */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          {/* Textarea */}
          <div className="p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to learn? e.g. I want to learn to build React components with Tailwind CSS..."
              rows={3}
              maxLength={500}
              disabled={isCreating}
              className="w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground/50 disabled:opacity-50 md:text-sm"
            />
          </div>

          {/* Settings bar */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border/40 bg-muted/30 px-4 py-3">
            {/* Language toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
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

        {/* Example prompts — compact chips below composer */}
        {!prompt && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                disabled={isCreating}
                className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {/* Starting level */}
        <div className="mt-8">
          <Label className="text-base font-medium">Where are you starting?</Label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                disabled={isCreating}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all',
                  level === l.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border/60 bg-card hover:-translate-y-0.5 hover:border-foreground/20'
                )}
              >
                <span className="text-sm font-medium">{l.label}</span>
                <p className="text-muted-foreground mt-0.5 text-xs">{l.description}</p>
              </button>
            ))}
          </div>
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
                {progress ?? 'Crafting your learning path...'}
              </>
            ) : (
              <>
                Create Learning Path
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Progress steps */}
        {isCreating && (
          <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-card">
            <div className="flex items-stretch divide-x divide-border/60">
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
          <div className="mt-4 overflow-hidden rounded-xl border border-red-500/20 bg-linear-to-r from-red-500/5 via-card to-red-500/5">
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

// ============================================================
// Step Card (progress indicator)
// ============================================================

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
