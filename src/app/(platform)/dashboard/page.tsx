import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/lib/services/auth/auth.service';
import {
  getDashboardStats,
  getActivityHeatmap,
  getLanguageBreakdown,
  getRecentActivity,
} from '@/lib/services/dashboard/dashboard.reader';
import { PathService } from '@/lib/services/paths/paths.service';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { ActivityHeatmap } from '@/components/dashboard/activity-heatmap';
import { LanguageBreakdown } from '@/components/dashboard/language-breakdown';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { PathCard } from '@/components/paths/path-card';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const pathService = new PathService();

  const [stats, heatmap, languages, activity, paths] = await Promise.all([
    getDashboardStats(user.id),
    getActivityHeatmap(user.id, 365),
    getLanguageBreakdown(user.id),
    getRecentActivity(user.id, 20),
    pathService.getUserPaths(user.id),
  ]);

  const hasActivity = stats.totalExercisesAttempted > 0;
  const activePaths = paths.filter((p) => p.status === 'active');
  const completedPaths = paths.filter((p) => p.status === 'completed');

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your coding practice progress</p>
      </div>

      {hasActivity || paths.length > 0 ? (
        <div className="space-y-8">
          <StatsOverview stats={stats} />

          {/* Active learning paths */}
          {activePaths.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Active Paths</h2>
                <Link
                  href="/paths"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="grid gap-3">
                {activePaths.slice(0, 3).map((path) => (
                  <PathCard key={path.id} path={path} />
                ))}
              </div>
            </section>
          )}

          {/* Completed paths (show up to 2) */}
          {completedPaths.length > 0 && activePaths.length === 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Completed Paths</h2>
                <Link
                  href="/paths"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="grid gap-3">
                {completedPaths.slice(0, 2).map((path) => (
                  <PathCard key={path.id} path={path} />
                ))}
              </div>
            </section>
          )}

          {/* Start a path CTA if user has none */}
          {paths.length === 0 && hasActivity && (
            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Start a Learning Path</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Get a personalized curriculum that adapts to your skill level as you progress.
                  </p>
                </div>
                <Link
                  href="/paths/new"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  New Path
                </Link>
              </div>
            </section>
          )}

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
        Start a learning path for a guided curriculum, or generate a custom exercise to start
        practicing.
      </p>
      <div className="flex gap-3">
        <Link
          href="/paths/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Start a Learning Path
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
