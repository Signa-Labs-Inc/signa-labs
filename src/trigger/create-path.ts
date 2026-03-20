/**
 * Path Creation Task
 *
 * Trigger.dev task that creates a learning path in the background.
 * AI generates the plan with milestones, then persists it.
 */

import { task, metadata } from '@trigger.dev/sdk/v3';
import { PathService } from '@/lib/services/paths/paths.service';
import type { CreatePathInput, CreatePathResult } from '@/lib/services/paths/paths.types';
import { insertNotification } from '@/lib/services/notifications/notifications.writer';

export type CreatePathPayload = CreatePathInput;
export type CreatePathOutput = CreatePathResult;

export const createPathTask = task({
  id: 'create-path',
  maxDuration: 120, // 2 minutes — plan generation is a single LLM call
  retry: { maxAttempts: 1 },

  run: async (payload: CreatePathPayload): Promise<CreatePathOutput> => {
    metadata.set('step', 'planning');
    metadata.set('progress', 'AI is designing your curriculum...');

    const pathService = new PathService();
    const result = await pathService.createPath(payload);

    metadata.set('step', 'completed');
    metadata.set('progress', 'Learning path created!');

    await insertNotification({
      userId: payload.userId,
      type: 'job_completed',
      channel: 'in_app',
      subject: 'Learning path created!',
      body: `Your path "${result.title}" with ${result.totalMilestones} milestones is ready.`,
      metadata: { url: `/paths/${result.pathId}`, jobType: 'create-path' },
    }).catch((err) => console.error('Failed to insert notification:', err));

    return result;
  },
});
