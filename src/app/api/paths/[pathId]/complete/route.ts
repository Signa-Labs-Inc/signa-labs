import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { PathService } from '@/lib/services/paths/paths.service';
import { handleError } from '@/lib/utils/api.handler-errors';

interface RouteParams {
  params: Promise<{ pathId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { pathId } = await params;

    let body: {
      pathExerciseId?: string;
      exerciseId?: string;
      attemptId?: string;
      testsPassed?: unknown;
      testsTotal?: unknown;
      timeSpentSeconds?: unknown;
      hintsUsed?: unknown;
      userSolutionCode?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!body.pathExerciseId || !body.exerciseId || !body.attemptId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numericFields = {
      testsPassed: body.testsPassed,
      testsTotal: body.testsTotal,
      timeSpentSeconds: body.timeSpentSeconds,
      hintsUsed: body.hintsUsed,
    };

    for (const [key, value] of Object.entries(numericFields)) {
      if (value !== undefined) {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
          return NextResponse.json(
            { error: `Invalid value for ${key}: must be a finite number >= 0` },
            { status: 400 }
          );
        }
      }
    }

    if (body.userSolutionCode !== undefined && typeof body.userSolutionCode !== 'string') {
      return NextResponse.json({ error: 'userSolutionCode must be a string' }, { status: 400 });
    }

    const pathService = new PathService();
    const result = await pathService.recordExerciseCompletion({
      pathId,
      pathExerciseId: body.pathExerciseId,
      exerciseId: body.exerciseId,
      attemptId: body.attemptId,
      testsPassed: (body.testsPassed as number) ?? 0,
      testsTotal: (body.testsTotal as number) ?? 0,
      timeSpentSeconds: (body.timeSpentSeconds as number) ?? 0,
      hintsUsed: (body.hintsUsed as number) ?? 0,
      userSolutionCode: (body.userSolutionCode as string) ?? '',
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
