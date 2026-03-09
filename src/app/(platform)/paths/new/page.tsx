'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  'I want to master TypeScript generics and advanced types',
  'Help me learn to build REST APIs with Express',
  'I want to learn SQL from basic queries to complex joins',
  'Teach me Go concurrency patterns',
];

// ============================================================
// Component
// ============================================================

export default function NewPathPage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [level, setLevel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!prompt.trim() || !level) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          language,
          startingLevel: level,
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? 'Failed to create learning path');
        return;
      }

      const data = (await response.json()) as { pathId?: string };
      if (!data.pathId || typeof data.pathId !== 'string') {
        setError('Unexpected response — missing path ID');
        return;
      }
      router.push(`/paths/${data.pathId}`);
    } catch {
      setError('Network error — please try again');
    } finally {
      setIsCreating(false);
    }
  }, [prompt, language, level, router]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Start a Learning Path</h1>
        <p className="text-muted-foreground mt-2">
          Describe what you want to learn and AI will create a personalized curriculum that adapts
          to your progress.
        </p>
      </div>

      <div className="space-y-6">
        {/* Prompt */}
        <div>
          <Label htmlFor="prompt" className="text-base font-medium">
            What do you want to learn?
          </Label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError(null);
            }}
            placeholder="e.g. I want to learn to build React components with Tailwind CSS"
            rows={3}
            maxLength={500}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring mt-2 flex w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          <p className="text-muted-foreground mt-1 text-xs">{prompt.length}/500</p>
        </div>

        {/* Example prompts */}
        {!prompt && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                className="bg-muted/50 text-muted-foreground hover:text-foreground hover:border-foreground/20 rounded-full border px-3 py-1.5 text-xs transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {/* Language */}
        <div>
          <Label className="text-base font-medium">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Starting level */}
        <div>
          <Label className="text-base font-medium">Where are you starting?</Label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => {
                  setLevel(l.value);
                  setError(null);
                }}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  level === l.value
                    ? 'border-primary bg-primary/5 ring-primary/20 ring-1'
                    : 'hover:border-foreground/20'
                }`}
              >
                <span className="text-sm font-medium">{l.label}</span>
                <p className="text-muted-foreground mt-0.5 text-xs">{l.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Create button */}
        <Button
          onClick={handleCreate}
          disabled={!prompt.trim() || !level || isCreating}
          className="w-full gap-2"
          size="lg"
        >
          {isCreating ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              Creating your learning path...
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              Create Learning Path
            </>
          )}
        </Button>

        {isCreating && (
          <p className="text-muted-foreground text-center text-sm">
            AI is designing your personalized curriculum. This takes about 10 seconds.
          </p>
        )}
      </div>
    </div>
  );
}
