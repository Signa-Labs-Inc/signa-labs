import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { ValidationError } from '@/lib/utils/errors';
import * as adminWriter from '@/lib/services/admin/admin.writer';
import type { generateExerciseTask } from '@/trigger/generate-exercise';
import type { GenerateExerciseInput } from '@/lib/services/generation/generation.types';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    if (body.mode === 'generate') {
      // AI generation mode — trigger background task
      const validLanguages = ['python', 'javascript', 'typescript', 'sql', 'go'];
      if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length < 10) {
        throw new ValidationError('Prompt must be at least 10 characters');
      }
      if (!body.language || !validLanguages.includes(body.language)) {
        throw new ValidationError(`Language must be one of: ${validLanguages.join(', ')}`);
      }

      const handle = await tasks.trigger<typeof generateExerciseTask>('generate-exercise', {
        userId: admin.id,
        userPrompt: body.prompt.trim(),
        language: body.language as GenerateExerciseInput['language'],
        difficulty: body.difficulty as GenerateExerciseInput['difficulty'],
        exerciseType: body.exerciseType as GenerateExerciseInput['exerciseType'],
      });

      return NextResponse.json(
        { runId: handle.id, publicAccessToken: handle.publicAccessToken },
        { status: 202 }
      );
    }

    if (body.mode === 'manual') {
      // Manual creation mode — directly create platform exercise
      if (!body.title || !body.description || !body.language || !body.environmentId) {
        throw new ValidationError('title, description, language, and environmentId are required');
      }

      const exercise = await adminWriter.createPlatformExercise(
        {
          title: body.title,
          description: body.description,
          difficulty: body.difficulty ?? 'medium',
          language: body.language,
          environmentId: body.environmentId,
          tags: body.tags ?? [],
          hints: body.hints ?? [],
          isValidated: body.isValidated ?? false,
          isPublic: body.isPublic ?? false,
        },
        body.files ?? []
      );

      return NextResponse.json(exercise, { status: 201 });
    }

    throw new ValidationError('mode must be "generate" or "manual"');
  } catch (error) {
    return handleError(error);
  }
}
