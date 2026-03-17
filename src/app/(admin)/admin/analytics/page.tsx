import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Code2,
  Crown,
  Eye,
  Flame,
  Languages,
  Lightbulb,
  Route,
  Send,
  Shield,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { AnalyticsBarChart, AnalyticsBarChartLabels } from '@/components/admin/analytics-bar-chart';
import { AnalyticsBreakdownCard } from '@/components/admin/analytics-breakdown-card';
import * as adminService from '@/lib/services/admin/admin.service';

export const dynamic = 'force-dynamic';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  easy: 'bg-green-500/10 text-green-600 border-green-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  hard: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  advanced: 'bg-red-500/10 text-red-600 border-red-500/20',
  expert: 'bg-red-500/10 text-red-600 border-red-500/20',
};

function formatDate(dateStr: string, format: 'short' | 'month' = 'short') {
  const date = new Date(dateStr + 'T00:00:00');
  if (format === 'month') return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatWeek(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return 'W' + date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}

export default async function AdminAnalyticsPage() {
  const data = await adminService.getAnalytics();

  const dailyLabels = data.dailyCompletions.map((d) => ({ label: formatDate(d.date), value: d.count }));
  const signupLabels = data.userEngagement.newSignupsLast30d.map((d) => ({ label: formatDate(d.date), value: d.count }));
  const dauLabels = data.userEngagement.dauTrend.map((d) => ({ label: formatDate(d.date), value: d.count }));
  const wauLabels = data.userEngagement.wauTrend.map((d) => ({ label: formatWeek(d.date), value: d.count }));
  const mauLabels = data.userEngagement.mauTrend.map((d) => ({ label: formatDate(d.date, 'month'), value: d.count }));

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Analytics"
        description="Platform-wide metrics and insights."
        icon={BarChart3}
      />

      {/* ── Section 1: Platform Overview ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Platform Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminStatCard title="Total Completions" value={data.overview.totalCompletions.toLocaleString()} icon={CheckCircle2} />
          <AdminStatCard title="Total Submissions" value={data.overview.totalSubmissions.toLocaleString()} icon={Send} />
          <AdminStatCard title="Overall Pass Rate" value={`${data.overview.overallPassRate}%`} icon={Target} />
          <AdminStatCard title="Active Users (30d)" value={data.overview.activeUsersLast30d.toLocaleString()} icon={UserCheck} />
          <AdminStatCard title="Total Time Spent" value={`${data.overview.totalTimeSpentHours.toLocaleString()} hrs`} icon={Clock} />
          <AdminStatCard title="Avg Completion Time" value={`${data.overview.avgCompletionTimeMinutes} min`} icon={Zap} />
        </div>
      </section>

      {/* ── Section 2: Activity Over Time ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Activity Over Time</h2>
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Daily Completions (Last 30 Days)</h3>
            <AnalyticsBarChart data={dailyLabels} />
            <AnalyticsBarChartLabels data={dailyLabels} />
          </CardContent>
        </Card>
      </section>

      {/* ── Section 3: DAU / WAU / MAU ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Active Users</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminStatCard title="DAU (today)" value={dauLabels[dauLabels.length - 1]?.value ?? 0} icon={Users} />
          <AdminStatCard title="WAU (this week)" value={wauLabels[wauLabels.length - 1]?.value ?? 0} icon={Users} />
          <AdminStatCard title="MAU (this month)" value={mauLabels[mauLabels.length - 1]?.value ?? 0} icon={Users} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold">DAU Trend (30 days)</h3>
              <AnalyticsBarChart data={dauLabels} height={120} />
              <AnalyticsBarChartLabels data={dauLabels} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold">WAU Trend (12 weeks)</h3>
              <AnalyticsBarChart data={wauLabels} height={120} />
              <AnalyticsBarChartLabels data={wauLabels} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold">MAU Trend (6 months)</h3>
              <AnalyticsBarChart data={mauLabels} height={120} />
              <AnalyticsBarChartLabels data={mauLabels} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Section 4: User Segmentation ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold">User Segmentation</h2>

        {/* Retention + averages */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminStatCard title="7-Day Retention" value={`${data.userSegmentation.retentionDay7}%`} icon={Shield} />
          <AdminStatCard title="30-Day Retention" value={`${data.userSegmentation.retentionDay30}%`} icon={Shield} />
          <AdminStatCard title="90-Day Retention" value={`${data.userSegmentation.retentionDay90}%`} icon={Shield} />
          <AdminStatCard title="Avg Completions / User" value={data.userSegmentation.avgCompletionsPerUser} icon={TrendingUp} />
          <AdminStatCard title="Avg Time / User" value={`${data.userSegmentation.avgTimePerUserMinutes} min`} icon={Clock} />
          <AdminStatCard title="Median Streak" value={`${data.userSegmentation.medianStreak} days`} icon={Flame} />
        </div>

        {/* Breakdowns */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <AnalyticsBreakdownCard title="Activity Level (30d)" items={data.userSegmentation.byActivityLevel} icon={TrendingUp} />
          <AnalyticsBreakdownCard title="Subscription Plan" items={data.userSegmentation.byPlan} icon={Crown} />
          <AnalyticsBreakdownCard title="Preferred Language" items={data.userSegmentation.byPreferredLanguage} icon={Code2} />
        </div>

        {/* Top Users */}
        <Card className="mt-4">
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold">Top Users by Completions</h3>
            {data.userSegmentation.topUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No user data yet.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">#</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">User</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Completed</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Time</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.userSegmentation.topUsers.map((user, i) => (
                      <tr key={user.userId} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {(user.displayName ?? user.email)?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{user.displayName ?? user.email}</p>
                              {user.displayName && (
                                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{user.completions}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{user.timeSpentHours}h</td>
                        <td className="px-4 py-3 text-right">
                          {user.streak > 0 ? (
                            <span className="inline-flex items-center gap-1 tabular-nums text-amber-600">
                              <Flame className="h-3.5 w-3.5" />
                              {user.streak}d
                            </span>
                          ) : (
                            <span className="tabular-nums text-muted-foreground">0d</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Section 5: User Growth ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold">User Growth</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold">New Signups (Last 30 Days)</h3>
              <AnalyticsBarChart data={signupLabels} height={120} />
              <AnalyticsBarChartLabels data={signupLabels} />
            </CardContent>
          </Card>
          <AnalyticsBreakdownCard title="Role Distribution" items={data.userEngagement.roleDistribution} icon={Users} />
        </div>
      </section>

      {/* ── Section 6: Exercise Insights ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Exercise Insights</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <AnalyticsBreakdownCard title="By Language" items={data.exerciseInsights.byLanguage} icon={Languages} />
          <AnalyticsBreakdownCard title="By Difficulty" items={data.exerciseInsights.byDifficulty} icon={TrendingUp} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold">Hardest Exercises</h3>
              {data.exerciseInsights.hardestExercises.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough data yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.exerciseInsights.hardestExercises.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link href={`/admin/exercises/${ex.id}`} className="truncate text-sm font-medium hover:text-primary hover:underline">
                          {ex.title}
                        </Link>
                        <Badge variant="outline" className={`shrink-0 text-xs ${DIFFICULTY_COLORS[ex.difficulty] ?? ''}`}>
                          {ex.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-sm tabular-nums text-destructive font-medium">{ex.passRate}%</span>
                        <span className="text-xs text-muted-foreground">{ex.attempts} attempts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold">Most Attempted Exercises</h3>
              {data.exerciseInsights.mostAttempted.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough data yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.exerciseInsights.mostAttempted.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link href={`/admin/exercises/${ex.id}`} className="truncate text-sm font-medium hover:text-primary hover:underline">
                          {ex.title}
                        </Link>
                        <Badge variant="secondary" className="shrink-0 text-xs capitalize font-normal">
                          {ex.language}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-sm tabular-nums font-medium">{ex.attempts}</span>
                        <span className="text-xs text-muted-foreground">{ex.completions} completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Section 7: Learning Paths ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Learning Paths</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminStatCard title="Total Paths" value={data.learningPathStats.totalPaths.toLocaleString()} icon={Route} />
          <AdminStatCard title="Completion Rate" value={`${data.learningPathStats.completionRate}%`} icon={CheckCircle2} />
          <AdminStatCard title="Avg Milestones Done" value={data.learningPathStats.avgMilestonesCompleted} icon={TrendingUp} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AnalyticsBreakdownCard title="Status Distribution" items={data.learningPathStats.statusDistribution} icon={Route} />
          <AnalyticsBreakdownCard title="Popular Languages" items={data.learningPathStats.popularLanguages} icon={Code2} />
        </div>
      </section>

      {/* ── Section 8: Submission Performance ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Submission Performance</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminStatCard title="Pass Rate" value={`${data.submissionPerformance.overallPassRate}%`} icon={Target} />
          <AdminStatCard title="Avg Attempts / Completion" value={data.submissionPerformance.avgAttemptsPerCompletion} icon={TrendingUp} />
          <AdminStatCard title="Hint Usage Rate" value={`${data.submissionPerformance.hintUsageRate}%`} icon={Lightbulb} />
          <AdminStatCard title="Solution View Rate" value={`${data.submissionPerformance.solutionViewRate}%`} icon={Eye} />
          <AdminStatCard title="Avg Execution Time" value={`${data.submissionPerformance.avgExecutionTimeMs} ms`} icon={Zap} />
          <AdminStatCard title="Total Submissions" value={data.submissionPerformance.totalSubmissions.toLocaleString()} icon={Send} />
        </div>
      </section>
    </div>
  );
}
