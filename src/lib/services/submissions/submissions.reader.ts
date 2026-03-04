/**
 * Submissions Reader
 *
 * All database reads related to submissions, attempts, exercises,
 * environments, and exercise files needed by the submission pipeline.
 */

import { eq, and, sql, inArray } from 'drizzle-orm';
import { db } from '@/index';
import { exerciseSubmissions } from '@/db/schema/tables/exercise_submissions';
import { submissionFiles } from '@/db/schema/tables/submission_files';
import { exerciseAttempts } from '@/db/schema/tables/exercise_attempts';
import { exerciseFiles } from '@/db/schema/tables/exercise_files';
import { exercises } from '@/db/schema/tables/exercises';
import { exerciseEnvironments } from '@/db/schema/tables/exercise_environments';
import type { SandboxResult } from '@/lib/sandboxes/types';
import type {
  AttemptRecord,
  ExerciseRecord,
  EnvironmentRecord,
  ExerciseFileRecord,
  SubmissionDetail,
  SubmissionHistoryItem,
  SubmissionFileRecord,
} from './submissions.types';

// ============================================================
// Attempt reads
// ============================================================

export async function getAttemptByIdAndUser(
  attemptId: string,
  userId: string
): Promise<AttemptRecord | null> {
  const [attempt] = await db
    .select({
      id: exerciseAttempts.id,
      userId: exerciseAttempts.userId,
      exerciseId: exerciseAttempts.exerciseId,
      status: exerciseAttempts.status,
      hintsRevealed: exerciseAttempts.hintsRevealed,
      solutionViewed: exerciseAttempts.solutionViewed,
      startedAt: exerciseAttempts.startedAt,
      completedAt: exerciseAttempts.completedAt,
      timeSpentSeconds: exerciseAttempts.timeSpentSeconds,
      createdAt: exerciseAttempts.createdAt,
      updatedAt: exerciseAttempts.updatedAt,
    })
    .from(exerciseAttempts)
    .where(and(eq(exerciseAttempts.id, attemptId), eq(exerciseAttempts.userId, userId)))
    .limit(1);

  return attempt ?? null;
}

// ============================================================
// Exercise reads
// ============================================================

export async function getExerciseById(exerciseId: string): Promise<ExerciseRecord | null> {
  const [exercise] = await db
    .select({
      id: exercises.id,
      origin: exercises.origin,
      environmentId: exercises.environmentId,
      language: exercises.language,
      title: exercises.title,
      description: exercises.description,
      difficulty: exercises.difficulty,
    })
    .from(exercises)
    .where(eq(exercises.id, exerciseId))
    .limit(1);

  return exercise ?? null;
}

export async function getEnvironmentById(environmentId: string): Promise<EnvironmentRecord | null> {
  const [environment] = await db
    .select({
      id: exerciseEnvironments.id,
      name: exerciseEnvironments.name,
      baseImage: exerciseEnvironments.baseImage,
      maxExecutionSeconds: exerciseEnvironments.maxExecutionSeconds,
      maxFiles: exerciseEnvironments.maxFiles,
      maxFileSizeBytes: exerciseEnvironments.maxFileSizeBytes,
    })
    .from(exerciseEnvironments)
    .where(eq(exerciseEnvironments.id, environmentId))
    .limit(1);

  return environment ?? null;
}

export async function getExerciseFilesByType(
  exerciseId: string,
  fileType: 'test' | 'support' | 'starter'
): Promise<ExerciseFileRecord[]> {
  return db
    .select({
      filePath: exerciseFiles.filePath,
      content: exerciseFiles.content,
    })
    .from(exerciseFiles)
    .where(and(eq(exerciseFiles.exerciseId, exerciseId), eq(exerciseFiles.fileType, fileType)))
    .orderBy(exerciseFiles.sortOrder);
}

// ============================================================
// Submission reads
// ============================================================

export async function getSubmissionByIdAndUser(
  submissionId: string,
  userId: string
): Promise<SubmissionDetail | null> {
  const [submission] = await db
    .select({
      id: exerciseSubmissions.id,
      attemptId: exerciseSubmissions.attemptId,
      isPassing: exerciseSubmissions.isPassing,
      testsPassed: exerciseSubmissions.testsPassed,
      testsFailed: exerciseSubmissions.testsFailed,
      testsTotal: exerciseSubmissions.testsTotal,
      testOutput: exerciseSubmissions.testOutput,
      executionTimeMs: exerciseSubmissions.executionTimeMs,
      submittedAt: exerciseSubmissions.submittedAt,
    })
    .from(exerciseSubmissions)
    .where(and(eq(exerciseSubmissions.id, submissionId), eq(exerciseSubmissions.userId, userId)))
    .limit(1);

  if (!submission) return null;

  let parsedOutput: SandboxResult | null = null;
  if (submission.testOutput) {
    try {
      parsedOutput = JSON.parse(submission.testOutput) as SandboxResult;
    } catch {
      console.error(`Failed to parse testOutput for submission ${submission.id}`);
    }
  }

  return {
    id: submission.id,
    attemptId: submission.attemptId,
    isPassing: submission.isPassing,
    testsPassed: submission.testsPassed,
    testsFailed: submission.testsFailed,
    testsTotal: submission.testsTotal,
    executionTimeMs: submission.executionTimeMs,
    submittedAt: submission.submittedAt,
    results: parsedOutput?.results ?? [],
    error: parsedOutput?.status === 'error' ? (parsedOutput.error_message ?? null) : null,
  };
}

export async function getSubmissionsByAttempt(
  attemptId: string,
  userId: string
): Promise<SubmissionHistoryItem[]> {
  return db
    .select({
      id: exerciseSubmissions.id,
      isPassing: exerciseSubmissions.isPassing,
      testsPassed: exerciseSubmissions.testsPassed,
      testsFailed: exerciseSubmissions.testsFailed,
      testsTotal: exerciseSubmissions.testsTotal,
      executionTimeMs: exerciseSubmissions.executionTimeMs,
      submittedAt: exerciseSubmissions.submittedAt,
    })
    .from(exerciseSubmissions)
    .where(
      and(eq(exerciseSubmissions.attemptId, attemptId), eq(exerciseSubmissions.userId, userId))
    )
    .orderBy(sql`${exerciseSubmissions.submittedAt} DESC`);
}

export async function getSubmissionFiles(submissionId: string): Promise<SubmissionFileRecord[]> {
  return db
    .select({
      filePath: submissionFiles.filePath,
      content: submissionFiles.content,
    })
    .from(submissionFiles)
    .where(eq(submissionFiles.submissionId, submissionId));
}

/**
 * Check if a user has any passing submission for an exercise.
 */
export async function hasPassingSubmission(userId: string, exerciseId: string): Promise<boolean> {
  const [result] = await db
    .select({ id: exerciseSubmissions.id })
    .from(exerciseSubmissions)
    .innerJoin(exerciseAttempts, eq(exerciseSubmissions.attemptId, exerciseAttempts.id))
    .where(
      and(
        eq(exerciseSubmissions.userId, userId),
        eq(exerciseAttempts.exerciseId, exerciseId),
        eq(exerciseSubmissions.isPassing, true)
      )
    )
    .limit(1);

  return !!result;
}

/**
 * Batch check completion status for multiple exercises.
 * Returns a Set of exerciseIds that the user has completed.
 */
export async function getCompletedExerciseIds(
  userId: string,
  exerciseIds: string[]
): Promise<Set<string>> {
  if (exerciseIds.length === 0) return new Set<string>();

  const completed = await db
    .select({ exerciseId: exerciseAttempts.exerciseId })
    .from(exerciseAttempts)
    .where(
      and(
        eq(exerciseAttempts.userId, userId),
        eq(exerciseAttempts.status, 'completed'),
        inArray(exerciseAttempts.exerciseId, exerciseIds)
      )
    );

  return new Set(completed.map((r) => r.exerciseId));
}
