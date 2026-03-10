import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { PathService } from '@/lib/services/paths/paths.service';
import { handleError } from '@/lib/utils/api.handler-errors';

interface RouteParams {
  params: Promise<{ pathId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { pathId } = await params;

    const pathService = new PathService();
    const progress = await pathService.getPathProgress(pathId, user.id);

    return NextResponse.json(progress);
  } catch (error) {
    return handleError(error);
  }
}
