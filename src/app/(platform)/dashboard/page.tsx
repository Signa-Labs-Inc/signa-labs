import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/services/auth/auth.service';
import {
  getDashboardStats,
  getActivityHeatmap,
  getLanguageBreakdown,
  getRecentActivity,
} from '@/lib/services/dashboard/dashboard.reader';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { ActivityHeatmap } from '@/components/dashboard/activity-heatmap';
import { LanguageBreakdown } from '@/components/dashboard/language-breakdown';
import { ActivityFeed } from '@/components/dashboard/activity-feed';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const [stats, heatmap, languages, activity] = await Promise.all([
    getDashboardStats(user.id),
    getActivityHeatmap(user.id, 365),
    getLanguageBreakdown(user.id),
    getRecentActivity(user.id, 20),
  ]);

  const hasActivity = stats.totalExercisesAttempted > 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your coding practice progress</p>
      </div>

      {hasActivity ? (
        <div className="space-y-8">
          <StatsOverview stats={stats} />
          <ActivityHeatmap data={heatmap} />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <LanguageBreakdown data={languages} />
            <ActivityFeed items={activity} />
          </div>
        </div>
      ) : (
        <EmptyDashboard />
      )}
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-5xl">📊</div>
      <h2 className="text-xl font-semibold">No activity yet</h2>
      <p className="text-muted-foreground mt-2 mb-6 max-w-md">
        Complete your first exercise to start tracking your progress. Generate a custom exercise or
        try one from the practice library.
      </p>
      <div className="flex gap-3">
        <Link
          href="/exercises/generate"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          ✨ Generate Exercise
        </Link>
        <Link
          href="/exercises"
          className="hover:bg-muted inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        >
          Browse Exercises
        </Link>
      </div>
    </div>
  );
}
