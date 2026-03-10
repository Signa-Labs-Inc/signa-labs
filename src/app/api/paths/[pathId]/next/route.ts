import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import type { generatePathExerciseTask } from '@/trigger/generate-path-exercise';

interface RouteParams {
  params: Promise<{ pathId: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { pathId } = await params;

    const handle = await tasks.trigger<typeof generatePathExerciseTask>('generate-path-exercise', {
      pathId,
      userId: user.id,
    });

    return NextResponse.json(
      { runId: handle.id, publicAccessToken: handle.publicAccessToken },
      { status: 202 }
    );
  } catch (error) {
    return handleError(error);
  }
}
