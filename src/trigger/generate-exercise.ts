/**
 * Exercise Generation Task
 *
 * Trigger.dev task that runs exercise generation in the background.
 * Replaces the entire BullMQ + worker + SSE infrastructure.
 *
 * File: trigger/generate-exercise.ts
 */

import { task, metadata } from '@trigger.dev/sdk/v3';
import { ExerciseGenerationService } from '@/lib/services/generation/generation.service';
import type { GenerateExerciseInput } from '@/lib/services/generation/generation.types';
import { insertNotification } from '@/lib/services/notifications/notifications.writer';

export type GenerateExercisePayload = GenerateExerciseInput;

export interface GenerateExerciseOutput {
  exerciseId: string;
  attemptId: string;
  title: string;
}

export const generateExerciseTask = task({
  id: 'generate-exercise',
  maxDuration: 300, // 5 minutes max
  retry: { maxAttempts: 1 }, // Not idempotent — retries would create duplicates

  run: async (payload: GenerateExercisePayload): Promise<GenerateExerciseOutput> => {
    const { userId, userPrompt, language, difficulty, exerciseType, templateId, pathContext } =
      payload;

    metadata.set('step', 'generating');
    metadata.set('progress', 'AI is generating your exercise...');

    const generationService = new ExerciseGenerationService();

    const result = await generationService.generateExercise({
      userId,
      userPrompt,
      language,
      difficulty,
      exerciseType,
      templateId,
      pathContext,
    });

    metadata.set('step', 'completed');
    metadata.set('progress', 'Exercise created!');

    await insertNotification({
      userId,
      type: 'job_completed',
      channel: 'in_app',
      subject: 'Exercise ready!',
      body: `Your exercise "${result.title}" has been generated.`,
      metadata: { url: `/exercises/${result.exerciseId}`, jobType: 'generate-exercise' },
    }).catch(() => {}); // Best-effort — don't fail the task if notification insert fails

    return {
      exerciseId: result.exerciseId,
      attemptId: result.attemptId,
      title: result.title,
    };
  },
});
