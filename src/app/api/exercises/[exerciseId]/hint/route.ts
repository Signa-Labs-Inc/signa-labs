// src/app/api/exercises/[exerciseId]/hint/route.ts
import { NextRequest } from 'next/server';
import * as exerciseService from '@/lib/services/exercises/exercises.service';
import { handleError } from '@/lib/utils/api.handler-errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    const { exerciseId } = await params;
    const index = Number(req.nextUrl.searchParams.get('index') ?? '0');

    const hint = await exerciseService.getExerciseHint(exerciseId, index);

    return Response.json(hint);
  } catch (error) {
    return handleError(error);
  }
}
