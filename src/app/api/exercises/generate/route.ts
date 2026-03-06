import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { ExerciseGenerationService } from '@/lib/services/generation/generation.service';
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
    const body = (await request.json()) as GenerateRequestBody;

    // Validate required fields
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const validLanguages = ['python', 'javascript', 'typescript'];
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

    const service = new ExerciseGenerationService();
    const result = await service.generateExercise({
      userId: user.id,
      userPrompt: body.prompt,
      language: body.language as 'python' | 'javascript' | 'typescript',
      difficulty:
        (body.difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'expert') ?? undefined,
      exerciseType: body.exerciseType as GenerateExerciseInput['exerciseType'],
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
