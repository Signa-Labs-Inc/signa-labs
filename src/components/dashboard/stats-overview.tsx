import { Trophy, Flame, Clock, Target } from 'lucide-react';
import type { DashboardStats } from '@/lib/services/dashboard/dashboard.types';

type StatsOverviewProps = {
  stats: DashboardStats;
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function ProgressRing({
  value,
  max,
  size = 48,
  strokeWidth = 4,
  className = '',
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className={className}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/50"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ring-gradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const completionRate =
    stats.totalExercisesAttempted > 0
      ? Math.round(
          (stats.totalExercisesCompleted / stats.totalExercisesAttempted) * 100
        )
      : 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Completed — with progress ring */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
        <div className="bg-linear-to-br from-card via-card to-primary/5 rounded-xl border p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="text-muted-foreground text-sm font-medium">
                Completed
              </span>
            </div>
            <ProgressRing
              value={stats.totalExercisesCompleted}
              max={stats.totalExercisesAttempted}
              size={40}
              strokeWidth={3}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {stats.totalExercisesCompleted.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-sm">
              of {stats.totalExercisesAttempted} ({completionRate}%)
            </span>
          </div>
        </div>
      </div>

      {/* Streak — with fire glow */}
      <div className="animate-fade-in" style={{ animationDelay: '80ms' }}>
        <div
          className={`bg-linear-to-br from-card via-card to-primary/5 rounded-xl border p-5 ${
            stats.currentStreakDays >= 7
              ? 'border-orange-500/30 shadow-sm shadow-orange-500/10'
              : ''
          }`}
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                stats.currentStreakDays >= 7
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
              }`}
            >
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-muted-foreground text-sm font-medium">
              Current Streak
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold tracking-tight ${
                stats.currentStreakDays >= 7 ? 'text-orange-500' : ''
              }`}
            >
              {stats.currentStreakDays}
            </span>
            <span className="text-muted-foreground text-sm">
              {stats.currentStreakDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          {/* Streak bar */}
          {stats.currentStreakDays > 0 && (
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < stats.currentStreakDays
                      ? 'bg-orange-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Longest streak */}
      <div className="animate-fade-in" style={{ animationDelay: '160ms' }}>
        <div className="bg-linear-to-br from-card via-card to-primary/5 rounded-xl border p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Target className="h-5 w-5" />
            </div>
            <span className="text-muted-foreground text-sm font-medium">
              Best Streak
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {stats.longestStreakDays}
            </span>
            <span className="text-muted-foreground text-sm">
              {stats.longestStreakDays === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </div>

      {/* Practice time */}
      <div className="animate-fade-in" style={{ animationDelay: '240ms' }}>
        <div className="bg-linear-to-br from-card via-card to-primary/5 rounded-xl border p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg p-2 bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-muted-foreground text-sm font-medium">
              Practice Time
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {formatTime(stats.totalTimeSpentSeconds)}
            </span>
            <span className="text-muted-foreground text-sm">total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
