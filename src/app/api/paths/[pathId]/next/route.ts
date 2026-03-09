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

    const pathService = new PathService();
    const result = await pathService.getNextExercise(pathId, user.id);

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
