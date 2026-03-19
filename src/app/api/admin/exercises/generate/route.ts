import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { ValidationError } from '@/lib/utils/errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    if (body.mode === 'generate') {
      const result = await adminService.generateExercise(admin.id, {
        prompt: body.prompt,
        language: body.language,
        difficulty: body.difficulty,
        exerciseType: body.exerciseType,
      });
      return NextResponse.json(result, { status: 202 });
    }

    if (body.mode === 'manual') {
      const exercise = await adminService.createExerciseManually(
        {
          title: body.title,
          description: body.description,
          difficulty: body.difficulty,
          language: body.language,
          environmentId: body.environmentId,
          tags: body.tags,
          hints: body.hints,
          isValidated: body.isValidated,
          isPublic: body.isPublic,
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
