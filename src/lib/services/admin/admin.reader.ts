import { db } from '@/index';
import { eq, and, sql, ilike, isNull, or, asc } from 'drizzle-orm';
import { exercises } from '@/db/schema/tables/exercises';
import { exerciseEnvironments } from '@/db/schema/tables/exercise_environments';
import { exerciseCategories } from '@/db/schema/tables/exercise_categories';
import { promptTemplates } from '@/db/schema/tables/prompt_templates';
import { users } from '@/db/schema/tables/users';
import { usersProfiles } from '@/db/schema/tables/users_profiles';
import { learningPaths } from '@/db/schema/tables/learning_paths';
import { exerciseFiles } from '@/db/schema/tables/exercise_files';
import { exerciseAttempts } from '@/db/schema/tables/exercise_attempts';
import { exerciseSubmissions } from '@/db/schema/tables/exercise_submissions';
import { userLearningStats } from '@/db/schema/tables/user_learning_stats';
import type {
  AdminDashboardStats,
  AdminExerciseFilters,
  AdminUserFilters,
  AdminPathFilters,
  AnalyticsData,
  BreakdownItem,
  DailyCount,
  RankedExercise,
  TopUser,
} from './admin.types';

/** Escape LIKE wildcards so user input is treated as literal text */
function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

// --- Dashboard Stats ---------------------------------------------------------

/** Fetch aggregate counts for the admin dashboard */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    [totalExercisesResult],
    [validatedExercisesResult],
    [totalUsersResult],
    [activePathsResult],
    [totalTemplatesResult],
    [totalEnvironmentsResult],
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(exercises)
      .where(isNull(exercises.deletedAt)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(exercises)
      .where(and(isNull(exercises.deletedAt), eq(exercises.isValidated, true))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(isNull(users.deletedAt)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(learningPaths)
      .where(eq(learningPaths.status, 'active')),
    db.select({ count: sql<number>`count(*)::int` }).from(promptTemplates),
    db.select({ count: sql<number>`count(*)::int` }).from(exerciseEnvironments),
  ]);

  return {
    totalExercises: totalExercisesResult?.count ?? 0,
    validatedExercises: validatedExercisesResult?.count ?? 0,
    totalUsers: totalUsersResult?.count ?? 0,
    activePaths: activePathsResult?.count ?? 0,
    totalTemplates: totalTemplatesResult?.count ?? 0,
    totalEnvironments: totalEnvironmentsResult?.count ?? 0,
  };
}

// --- Exercises ---------------------------------------------------------------

/** List all exercises (any origin) with filters and pagination */
export async function listAllExercises(
  filters: AdminExerciseFilters = {},
  limit: number = 50,
  offset: number = 0
) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (!filters.includeDeleted) {
    conditions.push(isNull(exercises.deletedAt));
  }

  if (filters.origin) {
    conditions.push(eq(exercises.origin, filters.origin));
  }

  if (filters.language) {
    conditions.push(sql`${exercises.language} = ${filters.language}`);
  }

  if (filters.difficulty) {
    conditions.push(sql`${exercises.difficulty} = ${filters.difficulty}`);
  }

  if (filters.isValidated !== undefined) {
    conditions.push(eq(exercises.isValidated, filters.isValidated));
  }

  if (filters.isPublic !== undefined) {
    conditions.push(eq(exercises.isPublic, filters.isPublic));
  }

  if (filters.search) {
    conditions.push(ilike(exercises.title, `%${escapeLike(filters.search)}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult, exerciseResults] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(exercises)
      .where(whereClause),
    db
      .select({
        id: exercises.id,
        title: exercises.title,
        origin: exercises.origin,
        description: exercises.description,
        difficulty: exercises.difficulty,
        language: exercises.language,
        tags: exercises.tags,
        isValidated: exercises.isValidated,
        isPublic: exercises.isPublic,
        slug: exercises.slug,
        deletedAt: exercises.deletedAt,
        createdAt: exercises.createdAt,
        environmentDisplayName: exerciseEnvironments.displayName,
        creatorEmail: users.email,
      })
      .from(exercises)
      .leftJoin(exerciseEnvironments, eq(exercises.environmentId, exerciseEnvironments.id))
      .leftJoin(users, eq(exercises.createdBy, users.id))
      .where(whereClause)
      .orderBy(sql`${exercises.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
  ]);

  return {
    exercises: exerciseResults,
    totalCount: countResult[0]?.count ?? 0,
  };
}

// --- Single Exercise for Admin -----------------------------------------------

/** Get full exercise detail for admin (includes soft-deleted) */
export async function getExerciseForAdmin(id: string) {
  const [exercise] = await db
    .select({
      exercise: exercises,
      environment: exerciseEnvironments,
    })
    .from(exercises)
    .leftJoin(exerciseEnvironments, eq(exercises.environmentId, exerciseEnvironments.id))
    .where(eq(exercises.id, id));

  if (!exercise) return null;

  const files = await db
    .select()
    .from(exerciseFiles)
    .where(eq(exerciseFiles.exerciseId, id))
    .orderBy(exerciseFiles.sortOrder);

  return {
    ...exercise.exercise,
    environment: exercise.environment,
    files,
  };
}

// --- Categories --------------------------------------------------------------

/** List all categories ordered by sortOrder (not just active) */
export async function listAllCategories() {
  return db
    .select()
    .from(exerciseCategories)
    .orderBy(asc(exerciseCategories.sortOrder));
}

// --- Prompt Templates --------------------------------------------------------

/** List all prompt templates with optional search on name */
export async function listAllPromptTemplates(filters?: { search?: string }) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (filters?.search) {
    conditions.push(ilike(promptTemplates.name, `%${escapeLike(filters.search)}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select({
      id: promptTemplates.id,
      name: promptTemplates.name,
      description: promptTemplates.description,
      templateText: promptTemplates.templateText,
      exerciseType: promptTemplates.exerciseType,
      supportedLanguages: promptTemplates.supportedLanguages,
      environmentId: promptTemplates.environmentId,
      version: promptTemplates.version,
      isActive: promptTemplates.isActive,
      createdAt: promptTemplates.createdAt,
      updatedAt: promptTemplates.updatedAt,
      environmentName: exerciseEnvironments.name,
    })
    .from(promptTemplates)
    .leftJoin(exerciseEnvironments, eq(promptTemplates.environmentId, exerciseEnvironments.id))
    .where(whereClause)
    .orderBy(asc(promptTemplates.name));
}

// --- Environments ------------------------------------------------------------

/** List all environments ordered by name */
export async function listAllEnvironments() {
  return db
    .select()
    .from(exerciseEnvironments)
    .orderBy(asc(exerciseEnvironments.name));
}

// --- Learning Paths ----------------------------------------------------------

/** List all learning paths with user email join */
export async function listAllLearningPaths(
  filters: AdminPathFilters = {},
  limit: number = 50,
  offset: number = 0
) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (filters.status) {
    conditions.push(eq(learningPaths.status, filters.status as 'active' | 'completed' | 'paused' | 'abandoned'));
  }

  if (filters.language) {
    conditions.push(sql`${learningPaths.language} = ${filters.language}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult, pathResults] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(learningPaths)
      .where(whereClause),
    db
      .select({
        id: learningPaths.id,
        title: learningPaths.title,
        language: learningPaths.language,
        status: learningPaths.status,
        startingLevel: learningPaths.startingLevel,
        currentMilestoneIndex: learningPaths.currentMilestoneIndex,
        totalMilestones: learningPaths.totalMilestones,
        totalExercisesCompleted: learningPaths.totalExercisesCompleted,
        estimatedTotalExercises: learningPaths.estimatedTotalExercises,
        createdAt: learningPaths.createdAt,
        updatedAt: learningPaths.updatedAt,
        completedAt: learningPaths.completedAt,
        userEmail: users.email,
      })
      .from(learningPaths)
      .leftJoin(users, eq(learningPaths.userId, users.id))
      .where(whereClause)
      .orderBy(sql`${learningPaths.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
  ]);

  return {
    paths: pathResults,
    totalCount: countResult[0]?.count ?? 0,
  };
}

// --- Users -------------------------------------------------------------------

/** List all users with profile join */
export async function listAllUsers(
  filters: AdminUserFilters = {},
  limit: number = 50,
  offset: number = 0
) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }

  if (filters.search) {
    const searchPattern = `%${escapeLike(filters.search)}%`;
    conditions.push(
      or(
        ilike(users.email, searchPattern),
        ilike(usersProfiles.displayName, searchPattern),
        ilike(usersProfiles.username, searchPattern)
      )!
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult, userResults] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .leftJoin(usersProfiles, eq(users.id, usersProfiles.userId))
      .where(whereClause),
    db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        deletedAt: users.deletedAt,
        displayName: usersProfiles.displayName,
        username: usersProfiles.username,
        avatarUrl: usersProfiles.avatarUrl,
      })
      .from(users)
      .leftJoin(usersProfiles, eq(users.id, usersProfiles.userId))
      .where(whereClause)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
  ]);

  return {
    users: userResults,
    totalCount: countResult[0]?.count ?? 0,
  };
}

// --- Analytics -----------------------------------------------------------------

function toBreakdown(rows: { label: string; value: number }[]): BreakdownItem[] {
  const items = rows.map((r) => ({ label: r.label, value: Number(r.value) }));
  const total = items.reduce((sum, r) => sum + r.value, 0);
  return items.map((r) => ({
    ...r,
    percentage: total > 0 ? Math.round((r.value / total) * 100) : 0,
  }));
}

async function getOverviewStats(): Promise<AnalyticsData['overview']> {
  const [
    [completions],
    [submissions],
    [passRate],
    [activeUsers],
    [timeSpent],
    [avgTime],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` })
      .from(exerciseAttempts)
      .where(sql`${exerciseAttempts.status} = 'completed'`),
    db.select({ count: sql<number>`count(*)::int` })
      .from(exerciseSubmissions),
    db.select({
      rate: sql<number>`round(coalesce(100.0 * count(*) filter (where ${exerciseSubmissions.isPassing}) / nullif(count(*), 0), 0), 1)`,
    }).from(exerciseSubmissions),
    db.select({ count: sql<number>`count(distinct ${exerciseAttempts.userId})::int` })
      .from(exerciseAttempts)
      .where(sql`${exerciseAttempts.startedAt} >= now() - interval '30 days'`),
    db.select({
      total: sql<number>`coalesce(sum(${userLearningStats.totalTimeSpentSeconds}), 0)::int`,
    }).from(userLearningStats),
    db.select({
      avg: sql<number>`round(coalesce(avg(${exerciseAttempts.timeSpentSeconds}), 0) / 60.0, 1)`,
    }).from(exerciseAttempts)
      .where(sql`${exerciseAttempts.status} = 'completed'`),
  ]);

  return {
    totalCompletions: Number(completions?.count ?? 0),
    totalSubmissions: Number(submissions?.count ?? 0),
    overallPassRate: Number(passRate?.rate ?? 0),
    activeUsersLast30d: Number(activeUsers?.count ?? 0),
    totalTimeSpentHours: Math.round(Number(timeSpent?.total ?? 0) / 3600),
    avgCompletionTimeMinutes: Number(avgTime?.avg ?? 0),
  };
}

async function getDailyCompletions(): Promise<DailyCount[]> {
  const rows = await db.execute(sql`
    select
      to_char(d::date, 'YYYY-MM-DD') as date,
      coalesce((
        select count(*)::int
        from exercise_attempts ea
        where ea.status = 'completed' and ea.completed_at::date = d::date
      ), 0) as count
    from generate_series(now() - interval '29 days', now(), interval '1 day') as d
    order by d
  `);

  const resultRows = Array.isArray(rows) ? rows : (rows as { rows: unknown[] }).rows ?? [];
  return (resultRows as { date: string; count: number }[]).map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));
}

async function getExerciseInsights(): Promise<AnalyticsData['exerciseInsights']> {
  const [langRows, diffRows, hardestRows, mostAttemptedRows] = await Promise.all([
    db.select({
      label: exercises.language,
      value: sql<number>`count(*)::int`,
    })
      .from(exercises)
      .where(isNull(exercises.deletedAt))
      .groupBy(exercises.language)
      .orderBy(sql`count(*) desc`),

    db.select({
      label: exercises.difficulty,
      value: sql<number>`count(*)::int`,
    })
      .from(exercises)
      .where(isNull(exercises.deletedAt))
      .groupBy(exercises.difficulty)
      .orderBy(sql`count(*) desc`),

    db.select({
      id: exercises.id,
      title: exercises.title,
      language: exercises.language,
      difficulty: exercises.difficulty,
      passRate: sql<number>`round(100.0 * count(*) filter (where ${exerciseAttempts.status} = 'completed') / nullif(count(*), 0), 1)`,
      attempts: sql<number>`count(*)::int`,
    })
      .from(exercises)
      .innerJoin(exerciseAttempts, eq(exercises.id, exerciseAttempts.exerciseId))
      .where(isNull(exercises.deletedAt))
      .groupBy(exercises.id, exercises.title, exercises.language, exercises.difficulty)
      .having(sql`count(*) >= 3`)
      .orderBy(sql`round(100.0 * count(*) filter (where ${exerciseAttempts.status} = 'completed') / nullif(count(*), 0), 1) asc`)
      .limit(10),

    db.select({
      id: exercises.id,
      title: exercises.title,
      language: exercises.language,
      difficulty: exercises.difficulty,
      attempts: sql<number>`count(*)::int`,
      completions: sql<number>`count(*) filter (where ${exerciseAttempts.status} = 'completed')::int`,
    })
      .from(exercises)
      .innerJoin(exerciseAttempts, eq(exercises.id, exerciseAttempts.exerciseId))
      .where(isNull(exercises.deletedAt))
      .groupBy(exercises.id, exercises.title, exercises.language, exercises.difficulty)
      .orderBy(sql`count(*) desc`)
      .limit(10),
  ]);

  return {
    byLanguage: toBreakdown(langRows),
    byDifficulty: toBreakdown(diffRows),
    hardestExercises: hardestRows.map((r) => ({
      id: r.id,
      title: r.title,
      language: r.language,
      difficulty: r.difficulty,
      passRate: Number(r.passRate ?? 0),
      attempts: Number(r.attempts),
      completions: 0,
    })) as RankedExercise[],
    mostAttempted: mostAttemptedRows.map((r) => ({
      id: r.id,
      title: r.title,
      language: r.language,
      difficulty: r.difficulty,
      passRate: 0,
      attempts: Number(r.attempts),
      completions: Number(r.completions ?? 0),
    })) as RankedExercise[],
  };
}

async function getUserEngagement(): Promise<AnalyticsData['userEngagement']> {
  type DateCount = { date: string; count: number };

  const [
    [active7d],
    [active30d],
    [active90d],
    dauResult,
    wauResult,
    mauResult,
    signupResult,
    roleRows,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(distinct ${exerciseAttempts.userId})::int` })
      .from(exerciseAttempts)
      .where(sql`${exerciseAttempts.startedAt} >= now() - interval '7 days'`),
    db.select({ count: sql<number>`count(distinct ${exerciseAttempts.userId})::int` })
      .from(exerciseAttempts)
      .where(sql`${exerciseAttempts.startedAt} >= now() - interval '30 days'`),
    db.select({ count: sql<number>`count(distinct ${exerciseAttempts.userId})::int` })
      .from(exerciseAttempts)
      .where(sql`${exerciseAttempts.startedAt} >= now() - interval '90 days'`),

    // DAU trend: distinct users per day, last 30 days
    db.execute(sql`
      select to_char(d::date, 'YYYY-MM-DD') as date,
        coalesce((select count(distinct ea.user_id)::int from exercise_attempts ea where ea.started_at::date = d::date), 0) as count
      from generate_series(now() - interval '29 days', now(), interval '1 day') as d
      order by d
    `),

    // WAU trend: distinct users in 7-day window, last 12 weeks
    db.execute(sql`
      select to_char(d::date, 'YYYY-MM-DD') as date,
        coalesce((select count(distinct ea.user_id)::int from exercise_attempts ea where ea.started_at >= d - interval '6 days' and ea.started_at < d + interval '1 day'), 0) as count
      from generate_series(now() - interval '11 weeks', now(), interval '1 week') as d
      order by d
    `),

    // MAU trend: distinct users in 30-day window, last 6 months
    db.execute(sql`
      select to_char(d::date, 'YYYY-MM-DD') as date,
        coalesce((select count(distinct ea.user_id)::int from exercise_attempts ea where ea.started_at >= d - interval '29 days' and ea.started_at < d + interval '1 day'), 0) as count
      from generate_series(now() - interval '5 months', now(), interval '1 month') as d
      order by d
    `),

    // New signups (gap-filled)
    db.execute(sql`
      select to_char(d::date, 'YYYY-MM-DD') as date,
        coalesce((select count(*)::int from users u where u.deleted_at is null and u.created_at::date = d::date), 0) as count
      from generate_series(now() - interval '29 days', now(), interval '1 day') as d
      order by d
    `),

    db.select({
      label: users.role,
      value: sql<number>`count(*)::int`,
    })
      .from(users)
      .where(isNull(users.deletedAt))
      .groupBy(users.role),
  ]);

  const mapRows = (result: unknown): DailyCount[] => {
    const arr = Array.isArray(result) ? result : ((result as { rows: unknown[] }).rows ?? []);
    return (arr as DateCount[]).map((r) => ({ date: r.date, count: Number(r.count) }));
  };

  return {
    activeUsers7d: Number(active7d?.count ?? 0),
    activeUsers30d: Number(active30d?.count ?? 0),
    activeUsers90d: Number(active90d?.count ?? 0),
    dauTrend: mapRows(dauResult),
    wauTrend: mapRows(wauResult),
    mauTrend: mapRows(mauResult),
    newSignupsLast30d: mapRows(signupResult),
    roleDistribution: toBreakdown(roleRows),
  };
}

async function getUserSegmentation(): Promise<AnalyticsData['userSegmentation']> {
  const [
    activityRows,
    planRows,
    langRows,
    [retention7],
    [retention30],
    [retention90],
    topUserRows,
    [avgStats],
    [medianStreakResult],
  ] = await Promise.all([
    // Activity level segmentation based on completions in last 30 days
    db.select({
      label: sql<string>`case
        when coalesce(completions, 0) = 0 then 'Inactive'
        when coalesce(completions, 0) between 1 and 2 then 'Casual'
        when coalesce(completions, 0) between 3 and 9 then 'Active'
        else 'Power User'
      end`,
      value: sql<number>`count(*)::int`,
    })
      .from(users)
      .leftJoin(
        sql`(
          select user_id, count(*) as completions
          from exercise_attempts
          where status = 'completed' and completed_at >= now() - interval '30 days'
          group by user_id
        ) as recent_activity`,
        sql`recent_activity.user_id = ${users.id}`
      )
      .where(isNull(users.deletedAt))
      .groupBy(sql`case
        when coalesce(completions, 0) = 0 then 'Inactive'
        when coalesce(completions, 0) between 1 and 2 then 'Casual'
        when coalesce(completions, 0) between 3 and 9 then 'Active'
        else 'Power User'
      end`),

    // Subscription plan distribution
    db.select({
      label: sql<string>`coalesce(s.plan_id, 'free')`,
      value: sql<number>`count(distinct ${users.id})::int`,
    })
      .from(users)
      .leftJoin(
        sql`(
          select user_id, plan_id
          from subscriptions
          where owner_type = 'user' and status in ('active', 'trialing')
        ) as s`,
        sql`s.user_id = ${users.id}`
      )
      .where(isNull(users.deletedAt))
      .groupBy(sql`coalesce(s.plan_id, 'free')`)
      .orderBy(sql`count(distinct ${users.id}) desc`),

    // Preferred coding language from profiles
    db.select({
      label: sql<string>`coalesce(
        ${usersProfiles.preferences}->>'preferred_coding_language',
        'python'
      )`,
      value: sql<number>`count(*)::int`,
    })
      .from(users)
      .leftJoin(usersProfiles, eq(users.id, usersProfiles.userId))
      .where(isNull(users.deletedAt))
      .groupBy(sql`coalesce(${usersProfiles.preferences}->>'preferred_coding_language', 'python')`)
      .orderBy(sql`count(*) desc`),

    // Retention: % of users who signed up 7+ days ago and were active in last 7 days
    db.select({
      rate: sql<number>`round(coalesce(
        100.0 * count(distinct ea.user_id) / nullif(count(distinct u.id), 0)
      , 0), 1)`,
    })
      .from(sql`users u`)
      .leftJoin(
        sql`exercise_attempts ea`,
        sql`ea.user_id = u.id and ea.started_at >= now() - interval '7 days'`
      )
      .where(sql`u.deleted_at is null and u.created_at < now() - interval '7 days'`),

    // Retention 30d
    db.select({
      rate: sql<number>`round(coalesce(
        100.0 * count(distinct ea.user_id) / nullif(count(distinct u.id), 0)
      , 0), 1)`,
    })
      .from(sql`users u`)
      .leftJoin(
        sql`exercise_attempts ea`,
        sql`ea.user_id = u.id and ea.started_at >= now() - interval '30 days'`
      )
      .where(sql`u.deleted_at is null and u.created_at < now() - interval '30 days'`),

    // Retention 90d
    db.select({
      rate: sql<number>`round(coalesce(
        100.0 * count(distinct ea.user_id) / nullif(count(distinct u.id), 0)
      , 0), 1)`,
    })
      .from(sql`users u`)
      .leftJoin(
        sql`exercise_attempts ea`,
        sql`ea.user_id = u.id and ea.started_at >= now() - interval '90 days'`
      )
      .where(sql`u.deleted_at is null and u.created_at < now() - interval '90 days'`),

    // Top users by completions
    db.select({
      userId: userLearningStats.userId,
      email: users.email,
      displayName: usersProfiles.displayName,
      completions: userLearningStats.totalExercisesCompleted,
      timeSpentSeconds: userLearningStats.totalTimeSpentSeconds,
      streak: userLearningStats.currentStreakDays,
    })
      .from(userLearningStats)
      .innerJoin(users, eq(userLearningStats.userId, users.id))
      .leftJoin(usersProfiles, eq(userLearningStats.userId, usersProfiles.userId))
      .where(isNull(users.deletedAt))
      .orderBy(sql`${userLearningStats.totalExercisesCompleted} desc`)
      .limit(10),

    // Avg completions and time per user
    db.select({
      avgCompletions: sql<number>`round(coalesce(avg(${userLearningStats.totalExercisesCompleted}), 0), 1)`,
      avgTimeMinutes: sql<number>`round(coalesce(avg(${userLearningStats.totalTimeSpentSeconds}), 0) / 60.0, 1)`,
    }).from(userLearningStats),

    // Median streak
    db.select({
      median: sql<number>`coalesce((
        select percentile_cont(0.5) within group (order by ${userLearningStats.currentStreakDays})
        from ${userLearningStats}
      ), 0)::int`,
    }).from(sql`(select 1) as dummy`),
  ]);

  const topUsers: TopUser[] = topUserRows.map((r) => ({
    userId: r.userId,
    email: r.email,
    displayName: r.displayName,
    completions: Number(r.completions),
    timeSpentHours: Math.round(Number(r.timeSpentSeconds) / 3600),
    streak: Number(r.streak),
  }));

  return {
    byActivityLevel: toBreakdown(activityRows),
    byPlan: toBreakdown(planRows),
    byPreferredLanguage: toBreakdown(langRows),
    retentionDay7: Number(retention7?.rate ?? 0),
    retentionDay30: Number(retention30?.rate ?? 0),
    retentionDay90: Number(retention90?.rate ?? 0),
    topUsers,
    avgCompletionsPerUser: Number(avgStats?.avgCompletions ?? 0),
    avgTimePerUserMinutes: Number(avgStats?.avgTimeMinutes ?? 0),
    medianStreak: Number(medianStreakResult?.median ?? 0),
  };
}

async function getLearningPathStats(): Promise<AnalyticsData['learningPathStats']> {
  const [statusRows, langRows, [totals], [avgMilestones]] = await Promise.all([
    db.select({
      label: learningPaths.status,
      value: sql<number>`count(*)::int`,
    })
      .from(learningPaths)
      .groupBy(learningPaths.status),

    db.select({
      label: learningPaths.language,
      value: sql<number>`count(*)::int`,
    })
      .from(learningPaths)
      .groupBy(learningPaths.language)
      .orderBy(sql`count(*) desc`),

    db.select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${learningPaths.status} = 'completed')::int`,
    }).from(learningPaths),

    db.select({
      avg: sql<number>`round(coalesce(avg(${learningPaths.currentMilestoneIndex}), 0), 1)`,
    }).from(learningPaths),
  ]);

  const totalPaths = Number(totals?.total ?? 0);
  const completedPaths = Number(totals?.completed ?? 0);

  return {
    totalPaths,
    completionRate: totalPaths > 0 ? Math.round((completedPaths / totalPaths) * 100) : 0,
    avgMilestonesCompleted: Number(avgMilestones?.avg ?? 0),
    statusDistribution: toBreakdown(statusRows),
    popularLanguages: toBreakdown(langRows),
  };
}

async function getSubmissionPerformance(): Promise<AnalyticsData['submissionPerformance']> {
  const [
    [passRate],
    [avgAttempts],
    [hintUsage],
    [solutionView],
    [avgExec],
    [totalSubs],
  ] = await Promise.all([
    db.select({
      rate: sql<number>`round(coalesce(100.0 * count(*) filter (where ${exerciseSubmissions.isPassing}) / nullif(count(*), 0), 0), 1)`,
    }).from(exerciseSubmissions),

    db.select({
      avg: sql<number>`coalesce((
        select round(avg(cnt), 1)
        from (
          select count(*) as cnt
          from exercise_submissions es
          join exercise_attempts ea on es.attempt_id = ea.id
          where ea.status = 'completed'
          group by es.attempt_id
        ) sub
      ), 0)`,
    }).from(sql`(select 1) as dummy`),

    db.select({
      rate: sql<number>`round(coalesce(100.0 * count(*) filter (where ${exerciseAttempts.hintsRevealed} > 0) / nullif(count(*), 0), 0), 1)`,
    }).from(exerciseAttempts),

    db.select({
      rate: sql<number>`round(coalesce(100.0 * count(*) filter (where ${exerciseAttempts.solutionViewed} = true) / nullif(count(*), 0), 0), 1)`,
    }).from(exerciseAttempts),

    db.select({
      avg: sql<number>`round(coalesce(avg(${exerciseSubmissions.executionTimeMs}), 0))::int`,
    }).from(exerciseSubmissions),

    db.select({ count: sql<number>`count(*)::int` })
      .from(exerciseSubmissions),
  ]);

  return {
    overallPassRate: Number(passRate?.rate ?? 0),
    avgAttemptsPerCompletion: Number(avgAttempts?.avg ?? 0),
    hintUsageRate: Number(hintUsage?.rate ?? 0),
    solutionViewRate: Number(solutionView?.rate ?? 0),
    avgExecutionTimeMs: Number(avgExec?.avg ?? 0),
    totalSubmissions: totalSubs?.count ?? 0,
  };
}

/** Fetch all analytics data in parallel */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [
    overview,
    dailyCompletions,
    exerciseInsights,
    userEngagement,
    userSegmentation,
    learningPathStats,
    submissionPerformance,
  ] = await Promise.all([
    getOverviewStats(),
    getDailyCompletions(),
    getExerciseInsights(),
    getUserEngagement(),
    getUserSegmentation(),
    getLearningPathStats(),
    getSubmissionPerformance(),
  ]);

  return {
    overview,
    dailyCompletions,
    exerciseInsights,
    userEngagement,
    userSegmentation,
    learningPathStats,
    submissionPerformance,
  };
}
