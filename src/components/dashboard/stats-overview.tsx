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

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={<Trophy className="h-5 w-5" />}
        iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
        label="Completed"
        value={stats.totalExercisesCompleted}
        subtitle={`of ${stats.totalExercisesAttempted} attempted`}
      />
      <StatCard
        icon={<Flame className="h-5 w-5" />}
        iconBg="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
        label="Current Streak"
        value={stats.currentStreakDays}
        subtitle={stats.currentStreakDays === 1 ? 'day' : 'days'}
        highlight={stats.currentStreakDays >= 7}
      />
      <StatCard
        icon={<Target className="h-5 w-5" />}
        iconBg="bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
        label="Longest Streak"
        value={stats.longestStreakDays}
        subtitle={stats.longestStreakDays === 1 ? 'day' : 'days'}
      />
      <StatCard
        icon={<Clock className="h-5 w-5" />}
        iconBg="bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
        label="Practice Time"
        value={formatTime(stats.totalTimeSpentSeconds)}
        subtitle="total"
        isStringValue
      />
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  subtitle,
  highlight = false,
  isStringValue = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
  subtitle: string;
  highlight?: boolean;
  isStringValue?: boolean;
}) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-3xl font-bold tracking-tight ${
            highlight ? 'text-orange-500' : 'text-foreground'
          }`}
        >
          {isStringValue ? value : value.toLocaleString()}
        </span>
        <span className="text-muted-foreground text-sm">{subtitle}</span>
      </div>
    </div>
  );
}
