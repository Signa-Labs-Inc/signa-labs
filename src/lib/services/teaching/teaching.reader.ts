/**
 * Teaching Reader
 *
 * Database reads for the teaching layer.
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/index';
import { submissionExplanations } from '@/db/schema/tables/submission_explanations';
import { exercises } from '@/db/schema/tables/exercises';
import type { FailureExplanation } from './teaching.types';

/**
 * Get explanation for a specific submission.
 */
export async function getExplanationBySubmissionId(submissionId: string) {
  const [result] = await db
    .select()
    .from(submissionExplanations)
    .where(eq(submissionExplanations.submissionId, submissionId))
    .limit(1);

  return result ?? null;
}

/**
 * Get all previous explanations for a user on a specific exercise.
 * Used for progressive hinting — later attempts get more specific help.
 */
export async function getPreviousExplanations(
  userId: string,
  exerciseId: string
): Promise<FailureExplanation[]> {
  const results = await db
    .select({ explanation: submissionExplanations.explanation })
    .from(submissionExplanations)
    .where(
      and(
        eq(submissionExplanations.userId, userId),
        eq(submissionExplanations.exerciseId, exerciseId)
      )
    )
    .orderBy(desc(submissionExplanations.createdAt))
    .limit(5);

  return results.map((r) => r.explanation as FailureExplanation);
}

/**
 * Count how many explanations exist for a user on an exercise.
 * This is the attempt number for progressive hinting.
 */
export async function getExplanationCount(userId: string, exerciseId: string): Promise<number> {
  const results = await db
    .select({ id: submissionExplanations.id })
    .from(submissionExplanations)
    .where(
      and(
        eq(submissionExplanations.userId, userId),
        eq(submissionExplanations.exerciseId, exerciseId)
      )
    );

  return results.length;
}

/**
 * Get lesson content for an exercise.
 */
export async function getLessonContent(exerciseId: string) {
  const [result] = await db
    .select({
      lessonContent: exercises.lessonContent,
    })
    .from(exercises)
    .where(eq(exercises.id, exerciseId))
    .limit(1);

  return result?.lessonContent ?? null;
}
