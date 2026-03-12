'use client';

import { Target, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type DailyGoalProgressProps = {
  todaySeconds: number;
  goalMinutes: number;
};

export function DailyGoalProgress({ todaySeconds, goalMinutes }: DailyGoalProgressProps) {
  const todayMinutes = Math.floor(todaySeconds / 60);
  const progress = goalMinutes > 0 ? Math.min(todayMinutes / goalMinutes, 1) : 0;
  const isComplete = progress >= 1;
  const remaining = Math.max(0, goalMinutes - todayMinutes);

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all ${
        isComplete
          ? 'border-emerald-500/30 bg-linear-to-r from-emerald-500/5 via-card to-emerald-500/5'
          : 'border-border bg-linear-to-br from-card via-card to-primary/5'
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isComplete
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Target className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {isComplete ? 'Daily goal reached!' : 'Daily Goal'}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {todayMinutes}m / {goalMinutes}m
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isComplete
                  ? 'bg-emerald-500'
                  : 'bg-linear-to-r from-primary to-violet-400'
              }`}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          <p className="text-muted-foreground mt-1.5 text-xs">
            {isComplete ? (
              'Great work today — keep the momentum going!'
            ) : remaining === goalMinutes ? (
              <>
                Start practicing to hit your {goalMinutes}-minute goal.{' '}
                <Link href="/profile" className="text-primary hover:underline">
                  Change goal
                </Link>
              </>
            ) : (
              `${remaining} minute${remaining === 1 ? '' : 's'} to go`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
