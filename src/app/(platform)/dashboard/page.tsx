import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Dashboard' };
import { FlaskConical, LayoutDashboard } from 'lucide-react';
import { getCurrentUser } from '@/lib/services/auth/auth.service';
import {
  getDashboardStats,
  getActivityHeatmap,
  getLanguageBreakdown,
  getRecentActivity,
  getTodayPracticeTimeSeconds,
} from '@/lib/services/dashboard/dashboard.reader';
import { getUserProfile } from '@/lib/services/users_profiles/users-profiles.reader';
import { PathService } from '@/lib/services/paths/paths.service';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { ActivityHeatmap } from '@/components/dashboard/activity-heatmap';
import { LanguageBreakdown } from '@/components/dashboard/language-breakdown';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { PathCard } from '@/components/paths/path-card';
import { DailyGoalProgress } from '@/components/dashboard/daily-goal-progress';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const pathService = new PathService();

  const [stats, heatmap, languages, activity, paths, userProfile, todayTime] = await Promise.all([
    getDashboardStats(user.id),
    getActivityHeatmap(user.id, 365),
    getLanguageBreakdown(user.id),
    getRecentActivity(user.id, 20),
    pathService.getUserPaths(user.id).catch(() => []),
    getUserProfile(user.id),
    getTodayPracticeTimeSeconds(user.id),
  ]);

  const dailyGoalMinutes = userProfile?.preferences?.daily_goal_minutes ?? 30;

  const hasActivity = stats.totalExercisesAttempted > 0;
  const activePaths = paths.filter((p) => p.status === 'active');
  const completedPaths = paths.filter((p) => p.status === 'completed');

  return (
    <div className="animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 py-10">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-1">Track your coding practice progress</p>

          {(hasActivity || paths.length > 0) && (
            <div className="mt-6 space-y-4">
              <StatsOverview stats={stats} />
              <DailyGoalProgress todaySeconds={todayTime} goalMinutes={dailyGoalMinutes} />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
      {hasActivity || paths.length > 0 ? (
        <div className="space-y-8">

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
                  <PathCard key={path.id} path={path} spotlight />
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
                  <FlaskConical className="h-4 w-4" />
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
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Branded illustration */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-violet-400/20">
          <FlaskConical className="h-9 w-9 text-primary" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-400 text-white text-xs font-bold shadow-lg shadow-primary/25">
          0
        </div>
      </div>
      <h2 className="text-xl font-semibold">Your journey starts here</h2>
      <p className="text-muted-foreground mt-2 mb-8 max-w-md">
        Start a learning path for a guided curriculum, or jump into an exercise to start building
        your skills.
      </p>
      <div className="flex gap-3">
        <Link
          href="/paths/new"
          className="bg-linear-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-all"
        >
          <FlaskConical className="h-4 w-4" />
          Start a Learning Path
        </Link>
        <Link
          href="/exercises"
          className="hover:bg-accent inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Browse Exercises
        </Link>
      </div>
    </div>
  );
}
