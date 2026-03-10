/**
 * Teaching Service
 *
 * Orchestrates the teaching layer:
 *   - Generate contextual failure explanations
 *   - Read existing explanations
 *   - Progressive hinting based on attempt history
 */

import * as reader from './teaching.reader';
import * as writer from './teaching.writer';
import { generateExplanation } from './explanation-generator';
import type { FailureExplanation, GenerateExplanationInput } from './teaching.types';

export class TeachingService {
  /**
   * Get or generate an explanation for a failed submission.
   * Returns cached explanation if one exists, otherwise generates a new one.
   */
  async getOrGenerateExplanation(input: GenerateExplanationInput): Promise<FailureExplanation> {
    // Check if explanation already exists for this submission
    const existing = await reader.getExplanationBySubmissionId(input.submissionId);
    if (existing) {
      return existing.explanation as FailureExplanation;
    }

    // Get previous explanations for progressive hinting
    const previousExplanations = await reader.getPreviousExplanations(
      input.userId,
      input.exerciseId
    );

    // Get attempt number
    const attemptNumber = (await reader.getExplanationCount(input.userId, input.exerciseId)) + 1;

    // Get lesson title if available
    const lessonContent = await reader.getLessonContent(input.exerciseId);
    const lessonTitle = lessonContent?.title ?? null;

    // Generate explanation
    const { explanation, generationTimeMs, llmModel } = await generateExplanation({
      ...input,
      attemptNumber,
      previousExplanations,
      lessonTitle,
    });

    // Store for caching
    await writer.createExplanation({
      submissionId: input.submissionId,
      userId: input.userId,
      exerciseId: input.exerciseId,
      attemptNumber,
      explanation,
      llmModel,
      generationTimeMs,
    });

    return explanation;
  }

  /**
   * Get an existing explanation for a submission (no generation).
   */
  async getExplanation(submissionId: string): Promise<FailureExplanation | null> {
    const result = await reader.getExplanationBySubmissionId(submissionId);
    if (!result) return null;
    return result.explanation as FailureExplanation;
  }
}
