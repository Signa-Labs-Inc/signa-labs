'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { LanguageIcon } from '@/components/ui/language-icon';

type FeaturedPath = {
  id: string;
  title: string;
  language: string;
  startingLevel: string;
  totalMilestones: number;
  estimatedTotalExercises: number;
  plan: { overview?: string };
};

export function FeaturedPathCard({
  path,
  index,
  compact,
}: {
  path: FeaturedPath;
  index: number;
  compact?: boolean;
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
        router.push(`/paths/${data.pathId}`);
      } else {
        // If not authenticated, redirect to sign-in
        if (res.status === 401) {
          router.push(`/sign-in?redirect_url=${encodeURIComponent(`/paths?start=${path.id}`)}`);
        }
      }
    } catch {
      // ignore
    } finally {
      setStarting(false);
    }
  }

  const description =
    path.plan?.overview ??
    `${path.totalMilestones} milestones · ${path.estimatedTotalExercises} exercises`;

  if (compact) {
    return (
      <button
        onClick={handleStart}
        disabled={starting}
        className="bg-card group hover:border-primary/30 flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
      >
        <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          {starting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LanguageIcon language={path.language} className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{path.title}</p>
          <p className="text-muted-foreground truncate text-xs">
            {path.totalMilestones} milestones · {path.estimatedTotalExercises} exercises
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleStart}
      disabled={starting}
      className="animate-fade-in bg-card group hover:border-primary/30 flex w-full items-center gap-4 rounded-xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="bg-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
        {starting ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <LanguageIcon language={path.language} className="h-6 w-6" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">{path.title}</h3>
        <p className="text-muted-foreground line-clamp-1 text-sm">{description}</p>
      </div>
      <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
    </button>
  );
}
