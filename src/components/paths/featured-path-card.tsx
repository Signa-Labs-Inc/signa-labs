'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Route, BookOpen, Milestone } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { trackEvent } from '@/lib/analytics';
import { LanguageIcon } from '@/components/ui/language-icon';

export type FeaturedPath = {
  id: string;
  title: string;
  language: string;
  startingLevel: string;
  totalMilestones: number;
  estimatedTotalExercises: number;
  plan: { overview?: string };
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  some_experience: 'Some Experience',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function FeaturedPathCard({
  path,
  index,
  compact,
  onUsageLimit,
}: {
  path: FeaturedPath;
  index: number;
  compact?: boolean;
  onUsageLimit?: (message: string) => void;
}) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    setStarting(true);
    try {
      const res = await fetch('/api/paths/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featuredPathId: path.id }),
      });
      const data = await res.json();
      if (res.ok && data.pathId) {
        trackEvent('path_started', {
          pathId: data.pathId,
          language: path.language,
          title: path.title,
        });
        router.push(`/paths/${data.pathId}`);
      } else if (res.status === 401) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent('/paths')}`);
      } else if (res.status === 403 && onUsageLimit) {
        const message =
          data?.error?.message ?? data?.error ?? 'You have reached your path creation limit.';
        onUsageLimit(message);
      } else {
        toast.error(data?.error?.message ?? data?.error ?? 'Failed to start path');
      }
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setStarting(false);
    }
  }

  const overview = path.plan?.overview ?? '';
  const levelLabel = LEVEL_LABELS[path.startingLevel] ?? path.startingLevel;

  // ── Compact variant (used in "Start something new" section on /paths) ──
  if (compact) {
    return (
      <button
        onClick={handleStart}
        disabled={starting}
        className="animate-fade-in bg-card group hover:border-primary/30 flex w-full items-center gap-4 rounded-xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="bg-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
          {starting ? (
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
          ) : (
            <LanguageIcon language={path.language} className="h-6 w-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{path.title}</p>
          <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Milestone className="h-3 w-3" />
              {path.totalMilestones} milestones
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {path.estimatedTotalExercises} exercises
            </span>
          </div>
        </div>
        <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
      </button>
    );
  }

  // ── Full card variant (discover page + paths empty state) ──
  return (
    <button
      onClick={handleStart}
      disabled={starting}
      className="animate-fade-in group hover:border-primary/30 flex w-full flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Gradient header */}
      <div className="from-primary/10 via-primary/5 to-card relative bg-linear-to-br px-6 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="bg-background/80 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm backdrop-blur-sm">
            {starting ? (
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
            ) : (
              <LanguageIcon language={path.language} className="h-7 w-7" />
            )}
          </div>
          <Badge variant="secondary" className="text-xs font-normal capitalize">
            {levelLabel}
          </Badge>
        </div>
        <h3 className="mt-4 text-left text-lg leading-tight font-semibold">{path.title}</h3>
      </div>

      {/* Body */}
      <div className="bg-card flex flex-1 flex-col px-6 pt-3 pb-5">
        {overview && (
          <p className="text-muted-foreground line-clamp-2 text-left text-sm leading-relaxed">
            {overview}
          </p>
        )}

        {/* Stats row */}
        <div className="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <Milestone className="h-3.5 w-3.5" />
            {path.totalMilestones} milestones
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />~{path.estimatedTotalExercises} exercises
          </span>
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-primary group-hover:text-primary/80 flex items-center gap-1.5 text-sm font-medium transition-colors">
            <Route className="h-3.5 w-3.5" />
            Start this path
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
}
