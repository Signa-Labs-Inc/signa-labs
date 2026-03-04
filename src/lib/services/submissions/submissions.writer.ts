/**
 * Submissions Writer
 *
 * All database writes related to submissions, attempts, events,
 * and learning stats updates.
 */

import { eq, sql } from 'drizzle-orm';
import { db } from '@/index';
import { exerciseSubmissions } from '@/db/schema/tables/exercise_submissions';
import { submissionFiles } from '@/db/schema/tables/submission_files';
import { exerciseAttempts } from '@/db/schema/tables/exercise_attempts';
import { exerciseEvents } from '@/db/schema/tables/exercise_events';
import { userLearningStats } from '@/db/schema/tables/user_learning_stats';
import type {
  CreateSubmissionInput,
  CreateSubmissionResult,
  SubmissionFileInput,
  UpdateSubmissionResultsInput,
} from './submissions.types';

// ============================================================
// Submission writes
// ============================================================

export async function createSubmission(
  data: CreateSubmissionInput
): Promise<CreateSubmissionResult> {
  const [submission] = await db
    .insert(exerciseSubmissions)
    .values({
      attemptId: data.attemptId,
      userId: data.userId,
      testsPassed: 0,
      testsFailed: 0,
      testsTotal: 0,
      isPassing: false,
    })
    .returning({ id: exerciseSubmissions.id });

  return submission;
}

export async function createSubmissionFiles(
  submissionId: string,
  files: SubmissionFileInput[]
): Promise<void> {
  if (files.length === 0) return;

  await db.insert(submissionFiles).values(
    files.map((f) => ({
      submissionId,
      filePath: f.filePath,
      content: f.content,
    }))
  );
}

export async function updateSubmissionResults(
  submissionId: string,
  data: UpdateSubmissionResultsInput
): Promise<void> {
  await db.update(exerciseSubmissions).set(data).where(eq(exerciseSubmissions.id, submissionId));
}

// ============================================================
// Event writes
// ============================================================

export async function emitExerciseEvent(
  attemptId: string,
  userId: string,
  eventType: string,
  payload: Record<string, unknown> = {}
): Promise<void> {
  await db.insert(exerciseEvents).values({
    attemptId,
    userId,
    eventType,
    payload,
  });
}

// ============================================================
// Attempt writes
// ============================================================

export async function markAttemptCompleted(attemptId: string): Promise<void> {
  await db
    .update(exerciseAttempts)
    .set({
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(exerciseAttempts.id, attemptId));
}

// ============================================================
// Learning stats writes
// ============================================================

/**
 * Increment completion stats and update streak.
 * Uses upsert so it works even if the user doesn't have a stats row yet.
 */
export async function updateLearningStatsOnCompletion(userId: string): Promise<void> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  await db
    .insert(userLearningStats)
    .values({
      userId,
      totalExercisesCompleted: 1,
      totalExercisesAttempted: 0,
      totalTimeSpentSeconds: 0,
      currentStreakDays: 1,
      longestStreakDays: 1,
      lastActivityAt: now,
    })
    .onConflictDoUpdate({
      target: userLearningStats.userId,
      set: {
        totalExercisesCompleted: sql`${userLearningStats.totalExercisesCompleted} + 1`,
        lastActivityAt: now,
        currentStreakDays: sql`
          CASE
            WHEN ${userLearningStats.lastActivityAt}::date = ${today.toISOString()}::date
              THEN ${userLearningStats.currentStreakDays}
            WHEN ${userLearningStats.lastActivityAt}::date = (${today.toISOString()}::date - INTERVAL '1 day')::date
              THEN ${userLearningStats.currentStreakDays} + 1
            ELSE 1
          END
        `,
        longestStreakDays: sql`
          GREATEST(
            ${userLearningStats.longestStreakDays},
            CASE
              WHEN ${userLearningStats.lastActivityAt}::date = ${today.toISOString()}::date
                THEN ${userLearningStats.currentStreakDays}
              WHEN ${userLearningStats.lastActivityAt}::date = (${today.toISOString()}::date - INTERVAL '1 day')::date
                THEN ${userLearningStats.currentStreakDays} + 1
              ELSE 1
            END
          )
        `,
      },
    });
}

/**
 * Increment attempt count when a user starts a new exercise attempt.
 */
export async function updateLearningStatsOnAttemptStart(userId: string): Promise<void> {
  await db
    .insert(userLearningStats)
    .values({
      userId,
      totalExercisesCompleted: 0,
      totalExercisesAttempted: 1,
      totalTimeSpentSeconds: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActivityAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userLearningStats.userId,
      set: {
        totalExercisesAttempted: sql`${userLearningStats.totalExercisesAttempted} + 1`,
        lastActivityAt: new Date(),
      },
    });
}
