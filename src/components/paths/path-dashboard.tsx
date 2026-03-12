'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Lock,
  Circle,
  FlaskConical,
  Pause,
  RotateCcw,
  Trophy,
  Zap,
  Target,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageIcon } from '@/components/ui/language-icon';
import { LANGUAGE_LABELS } from '@/components/ui/language-icon';
import { SkillsBadges } from '@/components/paths/skills-badges';
import { usePathExercise } from '@/hooks/use-path-exercise';
import { toast } from 'sonner';
import type { PathProgress, MilestoneProgress } from '@/lib/services/paths/paths.types';

// ============================================================
// Constants
// ============================================================

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'text-emerald-500 bg-emerald-500/10',
  easy: 'text-sky-500 bg-sky-500/10',
  medium: 'text-amber-500 bg-amber-500/10',
  hard: 'text-orange-500 bg-orange-500/10',
  expert: 'text-red-500 bg-red-500/10',
};

// ============================================================
// Component
// ============================================================

type PathDashboardProps = {
  progress: PathProgress;
};

export function PathDashboard({ progress }: PathDashboardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    status: exerciseStatus,
    progress: exerciseProgress,
    error: exerciseError,
    result: exerciseResult,
    generateNext,
  } = usePathExercise();

  // Redirect when exercise is ready
  useEffect(() => {
    if (exerciseResult) {
      router.push(
        `/exercises/${exerciseResult.exerciseId}?pathId=${progress.id}&pathExerciseId=${exerciseResult.pathExerciseId}`
      );
    }
  }, [exerciseResult, progress.id, router]);

  const isLoadingExercise =
    exerciseStatus !== 'idle' && exerciseStatus !== 'failed' && exerciseStatus !== 'completed';

  const handleContinue = useCallback(async () => {
    await generateNext(progress.id);
  }, [progress.id, generateNext]);

  const handlePause = useCallback(async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/paths/${progress.id}/pause`, { method: 'PUT' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error;
        toast.error(typeof msg === 'string' ? msg : 'Failed to pause path — please try again');
        return;
      }
      toast.success('Path paused');
      router.refresh();
    } catch {
      toast.error('Failed to pause path — please try again');
    } finally {
      setIsUpdating(false);
    }
  }, [progress.id, router]);

  const handleResume = useCallback(async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/paths/${progress.id}/resume`, { method: 'PUT' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error;
        toast.error(typeof msg === 'string' ? msg : 'Failed to resume path — please try again');
        return;
      }
      toast.success('Path resumed');
      router.refresh();
    } catch {
      toast.error('Failed to resume path — please try again');
    } finally {
      setIsUpdating(false);
    }
  }, [progress.id, router]);

  const isActive = progress.status === 'active';
  const isPaused = progress.status === 'paused';
  const isCompleted = progress.status === 'completed';

  const completedMilestones = progress.milestones.filter((m) => m.status === 'completed').length;
  const languageLabel =
    LANGUAGE_LABELS[progress.language.toLowerCase()] ?? progress.language;

  return (
    <div className="animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 py-8 md:py-12">
          {/* Back link */}
          <Link
            href="/paths"
            className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Paths
          </Link>

          <div className="flex items-start gap-5">
            {/* Language icon */}
            <div className="bg-card flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm md:h-16 md:w-16">
              <LanguageIcon language={progress.language} className="h-8 w-8 md:h-9 md:w-9" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    {progress.title}
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {languageLabel} · {progress.estimatedTotalExercises} exercises ·{' '}
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
                      <Pause className="mr-1.5 h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  {isPaused && (
                    <Button variant="ghost" size="sm" onClick={handleResume} disabled={isUpdating}>
                      <RotateCcw className="mr-1.5 h-4 w-4" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 flex items-center gap-3">
                <div className="bg-muted/50 h-3 flex-1 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-linear-to-r from-primary to-violet-400'
                    }`}
                    style={{ width: `${progress.percentComplete}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {progress.percentComplete}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-card/60 rounded-xl border p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold tabular-nums">
                    {progress.totalExercisesCompleted}
                    <span className="text-muted-foreground text-sm font-normal">
                      /{progress.estimatedTotalExercises}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-xs">Exercises</p>
                </div>
              </div>
            </div>
            <div className="bg-card/60 rounded-xl border p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                  <Target className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-lg font-bold tabular-nums">
                    {completedMilestones}
                    <span className="text-muted-foreground text-sm font-normal">
                      /{progress.totalMilestones}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-xs">Milestones</p>
                </div>
              </div>
            </div>
            <div className="bg-card/60 rounded-xl border p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-lg font-bold tabular-nums">
                    {progress.skillsAcquired.length}
                  </p>
                  <p className="text-muted-foreground text-xs">Skills</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills acquired — inline badges */}
          {progress.skillsAcquired.length > 0 && (
            <SkillsBadges skills={progress.skillsAcquired} />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Error message */}
        {exerciseError && (
          <div className="bg-destructive/10 text-destructive mb-6 rounded-lg border border-destructive/20 px-4 py-3 text-center text-sm">
            {exerciseError}
          </div>
        )}

        {/* ── Continue CTA ── */}
        {isActive && (
          <div className="mb-8 overflow-hidden rounded-xl border border-primary/20 bg-linear-to-r from-primary/5 via-card to-violet-500/5">
            <div className="flex items-center gap-4 p-5 md:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Ready to continue?</p>
                <p className="text-muted-foreground text-sm">
                  AI will generate your next exercise based on your progress
                </p>
              </div>
              <Button
                onClick={handleContinue}
                disabled={isLoadingExercise}
                size="lg"
                className="shrink-0 gap-2"
              >
                {isLoadingExercise ? (
                  <>
                    <FlaskConical className="h-4 w-4 animate-pulse" />
                    {exerciseProgress ?? 'Generating...'}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Next Exercise
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── Completed Banner ── */}
        {isCompleted && (
          <div className="mb-8 overflow-hidden rounded-xl border border-emerald-500/20 bg-linear-to-r from-emerald-500/5 via-card to-emerald-500/5">
            <div className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <Trophy className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold">Path Complete!</h2>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                You&apos;ve conquered all {progress.totalMilestones} milestones and completed{' '}
                {progress.totalExercisesCompleted} exercises. Impressive work!
              </p>
              <Link href="/paths/new" className="mt-5">
                <Button className="gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Start a New Path
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Milestone Timeline ── */}
        <div>
          <h2 className="mb-6 text-lg font-semibold">Milestone Roadmap</h2>
          <div className="relative">
            {progress.milestones.map((milestone, i) => (
              <MilestoneTimelineItem
                key={milestone.id}
                milestone={milestone}
                isLast={i === progress.milestones.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Milestone Timeline Item
// ============================================================

function MilestoneTimelineItem({
  milestone,
  isLast,
}: {
  milestone: MilestoneProgress;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(milestone.status === 'active');

  const isCompleted = milestone.status === 'completed';
  const isActive = milestone.status === 'active';
  const isLocked = milestone.status === 'locked';
  const difficultyClass = DIFFICULTY_COLORS[milestone.targetDifficulty] ?? '';

  const exerciseProgress =
    milestone.minExercises > 0
      ? Math.min(100, Math.round((milestone.exercisesCompleted / milestone.minExercises) * 100))
      : 0;

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline connector */}
      {!isLast && (
        <div
          className={`absolute left-4.25 top-10 bottom-0 w-0.5 ${
            isCompleted ? 'bg-emerald-500' : 'bg-border'
          }`}
        />
      )}

      {/* Timeline node */}
      <div className="relative z-10 shrink-0 pt-1">
        {isCompleted ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
        ) : isActive ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
            <Circle className="h-4 w-4 fill-primary text-primary" />
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-muted">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content card */}
      <div
        className={`flex-1 overflow-hidden rounded-xl border transition-all duration-200 ${
          isActive
            ? 'border-primary/30 bg-linear-to-br from-card to-primary/5 shadow-sm'
            : isCompleted
              ? 'bg-card'
              : 'border-border/60 bg-card'
        }`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-start justify-between gap-3 p-4 text-left cursor-pointer"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${isLocked ? 'text-muted-foreground' : ''}`}>
                {milestone.index + 1}. {milestone.title}
              </h3>
              {difficultyClass && (
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${difficultyClass}`}>
                  {milestone.targetDifficulty}
                </span>
              )}
            </div>
            <p className={`mt-1 text-sm ${isLocked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
              {milestone.description}
            </p>

            {/* Progress bar for non-locked milestones */}
            {!isLocked && (
              <div className="mt-3 flex items-center gap-3">
                <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-linear-to-r from-primary to-violet-400'
                    }`}
                    style={{ width: `${isCompleted ? 100 : exerciseProgress}%` }}
                  />
                </div>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {milestone.exercisesCompleted}/{milestone.minExercises}+ exercises
                </span>
              </div>
            )}

            {/* Locked milestone teaser */}
            {isLocked && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/50">
                <Lock className="h-3 w-3" />
                {milestone.minExercises}+ exercises · {milestone.skills.length} skills to cover
              </div>
            )}
          </div>

          <div className="shrink-0 pt-1">
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded skill gates */}
        {expanded && !isLocked && milestone.skillGates.length > 0 && (
          <div className="border-t px-4 py-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              Skill Gates
            </p>
            <div className="flex flex-wrap gap-1.5">
              {milestone.skillGates.map((gate) => {
                const passed = milestone.gatesPassed.includes(gate);
                return (
                  <Badge
                    key={gate}
                    variant={passed ? 'default' : 'outline'}
                    className={`text-xs ${
                      passed
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {passed && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {gate.replace(/_/g, ' ')}
                  </Badge>
                );
              })}
            </div>
            {milestone.gatesRemaining.length > 0 && isActive && (
              <p className="text-muted-foreground mt-2 text-xs">
                {milestone.gatesRemaining.length} skill
                {milestone.gatesRemaining.length === 1 ? '' : 's'} remaining to unlock next
                milestone
              </p>
            )}
          </div>
        )}

        {/* Expanded skills list */}
        {expanded && !isLocked && milestone.skills.length > 0 && milestone.skillGates.length === 0 && (
          <div className="border-t px-4 py-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              Skills covered
            </p>
            <div className="flex flex-wrap gap-1.5">
              {milestone.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs text-muted-foreground">
                  {skill.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Locked milestone preview — teases what's coming */}
        {expanded && isLocked && (
          <div className="border-t border-border/60 px-4 py-3">
            <p className="text-muted-foreground/60 mb-2 text-xs font-medium uppercase tracking-wider">
              What you&apos;ll learn
            </p>
            <div className="flex flex-wrap gap-1.5">
              {milestone.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="border-border/40 text-xs text-muted-foreground/40"
                >
                  <Lock className="mr-1 h-2.5 w-2.5" />
                  {skill.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
            {milestone.skillGates.length > 0 && (
              <>
                <p className="text-muted-foreground/60 mb-2 mt-3 text-xs font-medium uppercase tracking-wider">
                  Skills required to unlock
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {milestone.skillGates.map((gate) => (
                    <Badge
                      key={gate}
                      variant="outline"
                      className="border-amber-500/20 text-xs text-amber-500/60"
                    >
                      {gate.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

