'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical, AlertTriangle, ArrowRight, Bug, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageIcon } from '@/components/ui/language-icon';
import { cn } from '@/lib/utils/helpers';
import { useGenerationJob } from '@/hooks/use-generation-job';

// ============================================================
// Types
// ============================================================

type Language = 'python' | 'javascript' | 'typescript' | 'go' | 'sql';
type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
type ExerciseMode = 'build' | 'debugging';

// ============================================================
// Constants
// ============================================================

const BUILD_PROMPTS = [
  'Build a function that flattens a deeply nested array',
  'Implement a basic LRU cache with get and put operations',
  'Validate balanced parentheses in a string',
  'Create a debounce utility function',
  'Implement binary search on a sorted array',
  'Group anagrams together from a list of strings',
];

const DEBUG_PROMPTS = [
  'A function that removes duplicates from a sorted array',
  'A merge sort implementation with a subtle bug',
  'A promise-based retry function with a flaw',
  'A binary search that fails on edge cases',
  'A deep clone function that mishandles certain types',
  'A rate limiter with an off-by-one error',
];

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'sql', label: 'SQL' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'expert', label: 'Expert' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
  easy: 'border-sky-500/40 bg-sky-500/10 text-sky-500',
  medium: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
  hard: 'border-orange-500/40 bg-orange-500/10 text-orange-500',
  expert: 'border-red-500/40 bg-red-500/10 text-red-500',
};

// ============================================================
// Component
// ============================================================

export default function GenerateExercisePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState<string>('');
  const [language, setLanguage] = useState<Language>('python');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [mode, setMode] = useState<ExerciseMode>('build');

  const { status, progress, error, result, startGeneration } = useGenerationJob();

  useEffect(() => {
    if (result) {
      router.push(`/exercises/${result.exerciseId}`);
    }
  }, [result, router]);

  const handleGenerate = useCallback(async (): Promise<void> => {
    await startGeneration({
      prompt,
      language,
      difficulty,
      exerciseType: mode === 'debugging' ? 'debugging' : undefined,
    });
  }, [prompt, language, difficulty, mode, startGeneration]);

  const isGenerating = status !== 'idle' && status !== 'failed' && status !== 'completed';
  const isSubmittable = prompt.trim().length >= 10 && !isGenerating;

  return (
    <div className="animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-violet-400/20">
            <FlaskConical className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Craft an Exercise</h1>
          <p className="text-muted-foreground mt-2">
            Describe what you want to practice and we&apos;ll craft a custom exercise for you.
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
              placeholder={
                mode === 'debugging'
                  ? 'Describe the code to debug, e.g. A binary search that fails on edge cases...'
                  : 'What do you want to practice? e.g. Build a function that flattens a deeply nested array...'
              }
              rows={3}
              maxLength={2000}
              disabled={isGenerating}
              className="w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground/50 disabled:opacity-50 md:text-sm"
            />
          </div>

          {/* Settings bar + generate button */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border/40 bg-muted/30 px-4 py-3">
            {/* Language toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value)}
                  disabled={isGenerating}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                    language === opt.value
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LanguageIcon language={opt.value} className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Difficulty toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  disabled={isGenerating}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                    difficulty === opt.value
                      ? DIFFICULTY_COLORS[opt.value]
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
              <button
                onClick={() => setMode('build')}
                disabled={isGenerating}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                  mode === 'build'
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Hammer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Build</span>
              </button>
              <button
                onClick={() => setMode('debugging')}
                disabled={isGenerating}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                  mode === 'debugging'
                    ? 'bg-orange-500/10 text-orange-500 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Bug className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Debug</span>
              </button>
            </div>

            {/* Char count */}
            <span className="text-muted-foreground/50 ml-auto hidden text-xs tabular-nums sm:block">
              {prompt.length}/2000
            </span>

            {/* Craft button */}
            <Button
              onClick={handleGenerate}
              disabled={!isSubmittable}
              size="sm"
              className="gap-1.5"
            >
              {isGenerating ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {progress ?? 'Crafting...'}
                </>
              ) : (
                <>
                  <FlaskConical className="h-3.5 w-3.5" />
                  Craft Exercise
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Validation hint */}
        {prompt.trim().length > 0 && prompt.trim().length < 10 && (
          <p className="mt-2 text-xs text-amber-500">
            Prompt must be at least 10 characters
          </p>
        )}

        {/* Progress steps */}
        {isGenerating && (
          <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-card">
            <div className="flex items-stretch divide-x divide-border/60">
              <StepCard
                number={1}
                label="Queued"
                active={status === 'queued' || status === 'submitting'}
                done={status === 'generating' || status === 'validating'}
              />
              <StepCard
                number={2}
                label="Generating"
                active={status === 'generating'}
                done={status === 'validating'}
              />
              <StepCard
                number={3}
                label="Validating"
                active={status === 'validating'}
                done={false}
              />
            </div>
          </div>
        )}

        {/* Error state */}
        {status === 'failed' && error && (
          <div className="mt-4 overflow-hidden rounded-xl border border-red-500/20 bg-linear-to-r from-red-500/5 via-card to-red-500/5">
            <div className="flex items-start gap-3 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-medium text-red-300">Crafting failed</p>
                <p className="mt-1 text-sm text-red-300/80">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  className="mt-3"
                  disabled={prompt.trim().length < 10}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Example prompts — always visible ── */}
        <div className="mt-8">
          <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wider">
            Need inspiration?
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(mode === 'debugging' ? DEBUG_PROMPTS : BUILD_PROMPTS).map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                disabled={isGenerating}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex-1">{example}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
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
