import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import type { generateExerciseTask } from '@/trigger/generate-exercise';
import type { GenerateExerciseInput } from '@/lib/services/generation/generation.types';

interface GenerateRequestBody {
  prompt: string;
  language: string;
  difficulty?: string;
  exerciseType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();

    let body: GenerateRequestBody;
    try {
      body = (await request.json()) as GenerateRequestBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    // Validate required fields
    if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'prompt is required and must be at least 10 characters' },
        { status: 400 }
      );
    }

    const validLanguages = ['python', 'javascript', 'typescript', 'sql', 'go'];
    if (!body.language || !validLanguages.includes(body.language)) {
      return NextResponse.json(
        { error: `language must be one of: ${validLanguages.join(', ')}` },
        { status: 400 }
      );
    }

    const validDifficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    if (body.difficulty && !validDifficulties.includes(body.difficulty)) {
      return NextResponse.json(
        { error: `difficulty must be one of: ${validDifficulties.join(', ')}` },
        { status: 400 }
      );
    }

    const validExerciseTypes = [
      'algorithm',
      'debugging',
      'build',
      'refactor',
      'query',
      'api',
      'data_pipeline',
      'config',
    ];
    if (body.exerciseType && !validExerciseTypes.includes(body.exerciseType)) {
      return NextResponse.json(
        { error: `exerciseType must be one of: ${validExerciseTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Trigger the background task — returns immediately
    const handle = await tasks.trigger<typeof generateExerciseTask>('generate-exercise', {
      userId: user.id,
      userPrompt: body.prompt.trim(),
      language: body.language as GenerateExerciseInput['language'],
      difficulty:
        (body.difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'expert') ?? undefined,
      exerciseType: body.exerciseType as GenerateExerciseInput['exerciseType'],
    });

    return NextResponse.json(
      {
        runId: handle.id,
        publicAccessToken: handle.publicAccessToken,
      },
      { status: 202 }
    );
  } catch (error) {
    return handleError(error);
  }
}
