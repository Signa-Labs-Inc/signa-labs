/**
 * Submissions Writer
 *
 * All database writes related to submissions, attempts, events,
 * and learning stats updates.
 */

import { eq, ne, and, sql } from 'drizzle-orm';
import { db } from '@/index';
import { exerciseSubmissions } from '@/db/schema/tables/exercise_submissions';
import { submissionFiles } from '@/db/schema/tables/submission_files';
import { exerciseAttempts } from '@/db/schema/tables/exercise_attempts';
import { exerciseEvents } from '@/db/schema/tables/exercise_events';
import { userLearningStats } from '@/db/schema/tables/user_learning_stats';
import type {
  CreateAttemptResult,
  CreateSubmissionInput,
  CreateSubmissionResult,
  SubmissionFileInput,
  UpdateSubmissionResultsInput,
} from './submissions.types';

/** Transaction-compatible db handle. Accepts either the global db or a transaction. */
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | Tx;

// ============================================================
// Submission writes
// ============================================================

export async function createSubmission(
  data: CreateSubmissionInput,
  txOrDb: DbOrTx = db
): Promise<CreateSubmissionResult> {
  const [submission] = await txOrDb
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
  files: SubmissionFileInput[],
  txOrDb: DbOrTx = db
): Promise<void> {
  if (files.length === 0) return;

  await txOrDb.insert(submissionFiles).values(
    files.map((f) => ({
      submissionId,
      filePath: f.filePath,
      content: f.content,
    }))
  );
}

export async function updateSubmissionResults(
  submissionId: string,
  data: UpdateSubmissionResultsInput,
  txOrDb: DbOrTx = db
): Promise<void> {
  await txOrDb
    .update(exerciseSubmissions)
    .set(data)
    .where(eq(exerciseSubmissions.id, submissionId));
}

// ============================================================
// Event writes
// ============================================================

export async function emitExerciseEvent(
  attemptId: string,
  userId: string,
  eventType: string,
  payload: Record<string, unknown> = {},
  txOrDb: DbOrTx = db
): Promise<void> {
  await txOrDb.insert(exerciseEvents).values({
    attemptId,
    userId,
    eventType,
    payload,
  });
}

// ============================================================
// Attempt writes
// ============================================================

export async function markAttemptCompleted(
  attemptId: string,
  txOrDb: DbOrTx = db
): Promise<boolean> {
  const result = await txOrDb
    .update(exerciseAttempts)
    .set({
      status: 'completed',
      completedAt: new Date(),
    })
    .where(and(eq(exerciseAttempts.id, attemptId), ne(exerciseAttempts.status, 'completed')))
    .returning({ id: exerciseAttempts.id });

  return result.length > 0;
}

// ============================================================
// Learning stats writes
// ============================================================

/**
 * Increment completion stats and update streak.
 * Uses upsert so it works even if the user doesn't have a stats row yet.
 */
export async function updateLearningStatsOnCompletion(
  userId: string,
  txOrDb: DbOrTx = db
): Promise<void> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  await txOrDb
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
export async function updateLearningStatsOnAttemptStart(
  userId: string,
  txOrDb: DbOrTx = db
): Promise<void> {
  await txOrDb
    .insert(userLearningStats)
    .values({
      userId,
      totalExercisesCompleted: 0,
      totalExercisesAttempted: 1,
      totalTimeSpentSeconds: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
    })
    .onConflictDoUpdate({
      target: userLearningStats.userId,
      set: {
        totalExercisesAttempted: sql`${userLearningStats.totalExercisesAttempted} + 1`,
      },
    });
}

/**
 * Create a new exercise attempt for a user.
 * Returns null if a unique constraint conflict occurs (e.g. concurrent duplicate).
 */
export async function createAttempt(
  userId: string,
  exerciseId: string,
  txOrDb: DbOrTx = db
): Promise<CreateAttemptResult | null> {
  const result = await txOrDb
    .insert(exerciseAttempts)
    .values({
      userId,
      exerciseId,
      status: 'in_progress',
    })
    .onConflictDoNothing()
    .returning({ id: exerciseAttempts.id });

  return result[0] ?? null;
}

/**
 * Update streak tracking on any submission (pass or fail).
 * Rewards practice, not just completion.
 */
export async function updateStreakOnSubmission(userId: string, txOrDb: DbOrTx = db): Promise<void> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  await txOrDb
    .insert(userLearningStats)
    .values({
      userId,
      totalExercisesCompleted: 0,
      totalExercisesAttempted: 0,
      totalTimeSpentSeconds: 0,
      currentStreakDays: 1,
      longestStreakDays: 1,
      lastActivityAt: now,
    })
    .onConflictDoUpdate({
      target: userLearningStats.userId,
      set: {
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
 * Save draft code for an in-progress attempt.
 */
export async function saveDraftCode(
  attemptId: string,
  userId: string,
  exerciseId: string,
  draftCode: Record<string, string>
): Promise<boolean> {
  const result = await db
    .update(exerciseAttempts)
    .set({ draftCode })
    .where(
      and(
        eq(exerciseAttempts.id, attemptId),
        eq(exerciseAttempts.userId, userId),
        eq(exerciseAttempts.exerciseId, exerciseId),
        eq(exerciseAttempts.status, 'in_progress')
      )
    )
    .returning({ id: exerciseAttempts.id });

  return result.length > 0;
}
