'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Code2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/helpers';

// ============================================================
// Types
// ============================================================

type Language = 'python' | 'javascript' | 'typescript';
type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

type GenerateResponse = {
  exerciseId: string;
  attemptId: string;
  title: string;
  validationPassed: boolean;
};

type ErrorResponse = {
  error: string | { code?: string; message?: string };
};

type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

// ============================================================
// Constants
// ============================================================

const EXAMPLE_PROMPTS = [
  'Build a function that flattens a deeply nested array',
  'Implement a basic LRU cache with get and put operations',
  'Write a function that validates balanced parentheses in a string',
  'Create a debounce utility function',
  'Implement binary search on a sorted array',
  'Build a function that groups anagrams together from a list of strings',
];

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Simple, single-concept exercises' },
  { value: 'easy', label: 'Easy', description: 'Basic data structures and logic' },
  { value: 'medium', label: 'Medium', description: 'Multiple concepts, moderate complexity' },
  { value: 'hard', label: 'Hard', description: 'Advanced algorithms and patterns' },
  { value: 'expert', label: 'Expert', description: 'Complex optimization and design' },
];

const STATUS_MESSAGES: Record<string, string> = {
  generating: 'Generating your exercise...',
  validating: 'Validating the solution...',
  saving: 'Almost ready...',
};

// ============================================================
// Component
// ============================================================

export default function GenerateExercisePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState<string>('');
  const [language, setLanguage] = useState<Language>('python');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleGenerate = useCallback(async (): Promise<void> => {
    setStatus('generating');
    setStatusMessage(STATUS_MESSAGES.generating);
    setErrorMessage('');

    try {
      // Simulate progress messaging
      const progressTimer = setTimeout(() => {
        setStatusMessage(STATUS_MESSAGES.validating);
      }, 3000);

      const savingTimer = setTimeout(() => {
        setStatusMessage(STATUS_MESSAGES.saving);
      }, 8000);

      const response = await fetch('/api/exercises/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language, difficulty }),
      });

      clearTimeout(progressTimer);
      clearTimeout(savingTimer);

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as ErrorResponse | null;
        const rawError = errorBody?.error;
        const message =
          typeof rawError === 'string'
            ? rawError
            : (rawError?.message ?? rawError?.code ?? `Generation failed (${response.status})`);
        setStatus('error');
        setErrorMessage(message);
        return;
      }

      const data = (await response.json()) as GenerateResponse;

      setStatus('success');
      setStatusMessage(`Created: ${data.title}`);

      // Redirect to the exercise workspace
      setTimeout(() => {
        router.push(`/exercises/${data.exerciseId}`);
      }, 500);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Network error');
    }
  }, [prompt, language, difficulty, router]);

  const handleExampleClick = useCallback((example: string): void => {
    setPrompt(example);
  }, []);

  const isSubmittable = prompt.trim().length >= 10 && status !== 'generating';

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Generate an Exercise</h1>
        <p className="text-muted-foreground mt-2">
          Describe what you want to practice and AI will create a custom exercise for you.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Prompt */}
        <div className="space-y-2">
          <label htmlFor="prompt" className="text-sm font-medium">
            What do you want to practice?
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Build a function that flattens a deeply nested array"
            rows={4}
            maxLength={2000}
            disabled={status === 'generating'}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">{prompt.length}/2000</span>
            {prompt.trim().length > 0 && prompt.trim().length < 10 && (
              <span className="text-xs text-amber-500">Prompt must be at least 10 characters</span>
            )}
          </div>
        </div>

        {/* Language + Difficulty row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v as Language)}
              disabled={status === 'generating'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as Difficulty)}
              disabled={status === 'generating'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span>{opt.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={!isSubmittable}
          className="w-full gap-2"
          size="lg"
        >
          {status === 'generating' ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {statusMessage}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Exercise
            </>
          )}
        </Button>

        {/* Error state */}
        {status === 'error' && (
          <div className="flex items-start gap-3 rounded-lg border border-red-900/50 bg-red-950/20 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-300">Generation failed</p>
              <p className="mt-1 text-sm text-red-300/80">{errorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                className="mt-3"
                disabled={!isSubmittable}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Example prompts */}
        <div className="space-y-3 pt-2">
          <div className="text-muted-foreground flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            <span className="text-sm font-medium">Try an example</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                disabled={status === 'generating'}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs transition-colors',
                  'text-muted-foreground hover:text-foreground hover:border-foreground/30',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  prompt === example && 'border-primary text-primary'
                )}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
