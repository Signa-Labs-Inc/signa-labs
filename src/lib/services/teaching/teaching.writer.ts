/**
 * Teaching Writer
 *
 * Database writes for the teaching layer.
 */

import { db } from '@/index';
import { submissionExplanations } from '@/db/schema/tables/submission_explanations';
import type { FailureExplanation } from './teaching.types';

export async function createExplanation(input: {
  submissionId: string;
  userId: string;
  exerciseId: string;
  attemptNumber: number;
  explanation: FailureExplanation;
  llmModel: string;
  generationTimeMs: number;
}): Promise<string> {
  const [result] = await db
    .insert(submissionExplanations)
    .values({
      submissionId: input.submissionId,
      userId: input.userId,
      exerciseId: input.exerciseId,
      attemptNumber: input.attemptNumber,
      explanation: input.explanation,
      llmModel: input.llmModel,
      generationTimeMs: input.generationTimeMs,
    })
    .onConflictDoNothing() // Don't fail if explanation already exists for this submission
    .returning({ id: submissionExplanations.id });

  return result?.id ?? '';
}
