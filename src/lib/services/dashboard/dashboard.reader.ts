/**
 * Dashboard Reader
 *
 * All database reads for the user progress dashboard.
 */

import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '@/index';
import { userLearningStats } from '@/db/schema/tables/user_learning_stats';
import { exerciseSubmissions } from '@/db/schema/tables/exercise_submissions';
import { exerciseAttempts } from '@/db/schema/tables/exercise_attempts';
import { exerciseEvents } from '@/db/schema/tables/exercise_events';
import { exercises } from '@/db/schema/tables/exercises';
import type { DashboardStats, HeatmapDay, LanguageStat, ActivityItem } from './dashboard.types';

// ============================================================
// Stats overview
// ============================================================

/**
 * Get the user's aggregate learning stats.
 * Returns default values if the user has no stats row yet.
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [stats] = await db
    .select({
      totalExercisesCompleted: userLearningStats.totalExercisesCompleted,
      totalExercisesAttempted: userLearningStats.totalExercisesAttempted,
      totalTimeSpentSeconds: userLearningStats.totalTimeSpentSeconds,
      currentStreakDays: userLearningStats.currentStreakDays,
      longestStreakDays: userLearningStats.longestStreakDays,
      lastActivityAt: userLearningStats.lastActivityAt,
    })
    .from(userLearningStats)
    .where(eq(userLearningStats.userId, userId))
    .limit(1);

  if (!stats) {
    return {
      totalExercisesCompleted: 0,
      totalExercisesAttempted: 0,
      totalTimeSpentSeconds: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActivityAt: null,
    };
  }

  return stats;
}

// ============================================================
// Activity heatmap
// ============================================================

/**
 * Get daily submission counts for the last N days.
 * Used to render the GitHub-style activity heatmap.
 */
export async function getActivityHeatmap(
  userId: string,
  days: number = 365
): Promise<HeatmapDay[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      date: sql<string>`${exerciseSubmissions.submittedAt}::date::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(exerciseSubmissions)
    .where(
      and(
        eq(exerciseSubmissions.userId, userId),
        sql`${exerciseSubmissions.submittedAt} >= ${startDate.toISOString()}::timestamptz`
      )
    )
    .groupBy(sql`${exerciseSubmissions.submittedAt}::date`)
    .orderBy(sql`${exerciseSubmissions.submittedAt}::date`);

  return result.map((row) => ({
    date: row.date,
    count: row.count,
  }));
}

// ============================================================
// Language breakdown
// ============================================================

/**
 * Get exercise completion and attempt counts grouped by language.
 */
export async function getLanguageBreakdown(userId: string): Promise<LanguageStat[]> {
  const result = await db
    .select({
      language: exercises.language,
      completed: sql<number>`count(*) FILTER (WHERE ${exerciseAttempts.status} = 'completed')::int`,
      attempted: sql<number>`count(*)::int`,
    })
    .from(exerciseAttempts)
    .innerJoin(exercises, eq(exerciseAttempts.exerciseId, exercises.id))
    .where(eq(exerciseAttempts.userId, userId))
    .groupBy(exercises.language)
    .orderBy(sql`count(*) FILTER (WHERE ${exerciseAttempts.status} = 'completed') DESC`);

  return result;
}

// ============================================================
// Recent activity feed
// ============================================================

/**
 * Get recent exercise events with exercise details.
 * Filters to user-facing events (excludes internal events).
 */
export async function getRecentActivity(
  userId: string,
  limit: number = 20
): Promise<ActivityItem[]> {
  const result = await db
    .select({
      id: exerciseEvents.id,
      eventType: exerciseEvents.eventType,
      exerciseTitle: exercises.title,
      exerciseLanguage: exercises.language,
      exerciseId: exercises.id,
      occurredAt: exerciseEvents.occurredAt,
      payload: exerciseEvents.payload,
    })
    .from(exerciseEvents)
    .innerJoin(exerciseAttempts, eq(exerciseEvents.attemptId, exerciseAttempts.id))
    .innerJoin(exercises, eq(exerciseAttempts.exerciseId, exercises.id))
    .where(
      and(
        eq(exerciseEvents.userId, userId),
        sql`${exerciseEvents.eventType} IN ('attempt_started', 'attempt_completed', 'tests_passed', 'tests_failed', 'hint_revealed')`
      )
    )
    .orderBy(desc(exerciseEvents.occurredAt))
    .limit(limit);

  return result as ActivityItem[];
}
