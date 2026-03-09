'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Lock,
  Circle,
  Sparkles,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PathProgress, MilestoneProgress } from '@/lib/services/paths/paths.types';

// ============================================================
// Constants
// ============================================================

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'text-emerald-600',
  easy: 'text-sky-600',
  medium: 'text-amber-600',
  hard: 'text-orange-600',
  expert: 'text-red-600',
};

const MILESTONE_ICONS: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  active: Circle,
  locked: Lock,
};

const MILESTONE_COLORS: Record<string, string> = {
  completed:
    'text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800',
  active: 'text-primary border-primary/30 bg-primary/5',
  locked: 'text-muted-foreground border-muted bg-muted/30',
};

// ============================================================
// Component
// ============================================================

type PathDashboardProps = {
  progress: PathProgress;
};

export function PathDashboard({ progress }: PathDashboardProps) {
  const router = useRouter();
  const [isLoadingExercise, setIsLoadingExercise] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = useCallback(async () => {
    setIsLoadingExercise(true);
    setError(null);

    try {
      const response = await fetch(`/api/paths/${progress.id}/next`, {
        method: 'POST',
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? 'Failed to generate exercise');
        return;
      }

      const data = (await response.json()) as {
        exerciseId: string;
        pathExerciseId: string;
      };

      router.push(
        `/exercises/${data.exerciseId}?pathId=${progress.id}&pathExerciseId=${data.pathExerciseId}`
      );
    } catch {
      setError('Network error');
    } finally {
      setIsLoadingExercise(false);
    }
  }, [progress.id, router]);

  const handlePause = useCallback(async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await fetch(`/api/paths/${progress.id}/pause`, { method: 'PUT' });
      router.refresh();
    } catch {
      setError('Failed to pause path — please try again');
    } finally {
      setIsUpdating(false);
    }
  }, [progress.id, router]);

  const handleResume = useCallback(async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await fetch(`/api/paths/${progress.id}/resume`, { method: 'PUT' });
      router.refresh();
    } catch {
      setError('Failed to resume path — please try again');
    } finally {
      setIsUpdating(false);
    }
  }, [progress.id, router]);

  const isActive = progress.status === 'active';
  const isPaused = progress.status === 'paused';
  const isCompleted = progress.status === 'completed';

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/paths"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Paths
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{progress.title}</h1>
            <p className="text-muted-foreground mt-1">
              {progress.totalExercisesCompleted}/{progress.estimatedTotalExercises} exercises
              {' · '}
              {progress.milestones.filter((m) => m.status === 'completed').length}/
              {progress.totalMilestones} milestones
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePause}
                disabled={isUpdating}
                className="text-muted-foreground"
              >
                <Pause className="mr-1 h-4 w-4" />
                Pause
              </Button>
            )}
            {isPaused && (
              <Button variant="ghost" size="sm" onClick={handleResume} disabled={isUpdating}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Resume
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="bg-muted h-3 flex-1 overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCompleted ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{progress.percentComplete}%</span>
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-destructive mb-4 text-center text-sm">{error}</p>}

      {/* Continue button */}
      {isActive && (
        <div className="mb-8">
          <Button
            onClick={handleContinue}
            disabled={isLoadingExercise}
            size="lg"
            className="w-full gap-2"
          >
            {isLoadingExercise ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                Generating your next exercise...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Continue Learning
              </>
            )}
          </Button>
        </div>
      )}

      {/* Completed banner */}
      {isCompleted && (
        <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
          <h2 className="text-lg font-semibold">Path Complete!</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            You&apos;ve completed all milestones. Great work!
          </p>
          <Link href="/paths/new">
            <Button className="mt-4 gap-2">
              <Sparkles className="h-4 w-4" />
              Start a New Path
            </Button>
          </Link>
        </div>
      )}

      {/* Milestones */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Milestones</h2>
        {progress.milestones.map((milestone) => (
          <MilestoneCard key={milestone.id} milestone={milestone} />
        ))}
      </div>

      {/* Skills acquired */}
      {progress.skillsAcquired.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Skills Acquired</h2>
          <div className="flex flex-wrap gap-2">
            {progress.skillsAcquired.map(({ skill, confidence }) => (
              <div key={skill} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <span className="text-sm">{skill.replace(/_/g, ' ')}</span>
                <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      confidence >= 0.7
                        ? 'bg-emerald-500'
                        : confidence >= 0.4
                          ? 'bg-amber-500'
                          : 'bg-muted-foreground'
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Milestone Card
// ============================================================

function MilestoneCard({ milestone }: { milestone: MilestoneProgress }) {
  const Icon = MILESTONE_ICONS[milestone.status] ?? Circle;
  const colorClass = MILESTONE_COLORS[milestone.status] ?? MILESTONE_COLORS.locked;
  const isActive = milestone.status === 'active';

  return (
    <div className={`rounded-xl border p-5 transition-colors ${colorClass}`}>
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            milestone.status === 'completed'
              ? 'text-emerald-500'
              : milestone.status === 'active'
                ? 'text-primary'
                : 'text-muted-foreground'
          }`}
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">
              {milestone.index + 1}. {milestone.title}
            </h3>
            <span className={`text-xs ${DIFFICULTY_COLORS[milestone.targetDifficulty] ?? ''}`}>
              {milestone.targetDifficulty}
            </span>
          </div>

          <p className="text-muted-foreground mt-1 text-sm">{milestone.description}</p>

          {/* Progress within milestone */}
          {milestone.status !== 'locked' && (
            <div className="mt-3 space-y-2">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span>
                  {milestone.exercisesCompleted}/{milestone.minExercises}+ exercises
                </span>
                {milestone.gatesPassed.length > 0 && (
                  <span>
                    · {milestone.gatesPassed.length}/{milestone.skillGates.length} skills
                    demonstrated
                  </span>
                )}
              </div>

              {/* Skill gates */}
              {isActive && milestone.skillGates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {milestone.skillGates.map((gate) => {
                    const passed = milestone.gatesPassed.includes(gate);
                    return (
                      <Badge
                        key={gate}
                        variant={passed ? 'default' : 'outline'}
                        className={`text-xs ${
                          passed
                            ? 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : ''
                        }`}
                      >
                        {passed && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {gate.replace(/_/g, ' ')}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
