/**
 * Path Exercise Generation Task
 *
 * Trigger.dev task that generates the next adaptive exercise in a learning path.
 * Analyzes performance, adapts difficulty, generates exercise, records it.
 */

import { task, metadata } from '@trigger.dev/sdk/v3';
import { PathService } from '@/lib/services/paths/paths.service';
import type { NextExerciseResult } from '@/lib/services/paths/paths.types';
import { insertNotification } from '@/lib/services/notifications/notifications.writer';

export interface GeneratePathExercisePayload {
  pathId: string;
  userId: string;
}

export type GeneratePathExerciseOutput = NextExerciseResult;

export const generatePathExerciseTask = task({
  id: 'generate-path-exercise',
  maxDuration: 300, // 5 minutes — includes AI generation + sandbox validation
  retry: { maxAttempts: 1 },

  run: async (payload: GeneratePathExercisePayload): Promise<GeneratePathExerciseOutput> => {
    metadata.set('step', 'generating');
    metadata.set('progress', 'Generating your next exercise...');

    const pathService = new PathService();
    const result = await pathService.getNextExercise(payload.pathId, payload.userId);

    metadata.set('step', 'completed');
    metadata.set('progress', 'Exercise ready!');

    await insertNotification({
      userId: payload.userId,
      type: 'job_completed',
      channel: 'in_app',
      subject: 'Exercise ready!',
      body: `Your next path exercise "${result.milestoneTitle}" is ready.`,
      metadata: { url: `/exercises/${result.exerciseId}`, jobType: 'generate-path-exercise' },
    }).catch((err) => console.error('Failed to insert notification:', err));

    return result;
  },
});
