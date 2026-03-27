import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { PathService } from '@/lib/services/paths/paths.service';
import { handleError } from '@/lib/utils/api.handler-errors';

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();

    let body: { featuredPathId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!body.featuredPathId) {
      return NextResponse.json({ error: 'featuredPathId is required' }, { status: 400 });
    }

    const pathService = new PathService();
    const { pathId } = await pathService.startFeaturedPath(user.id, body.featuredPathId);

    return NextResponse.json({ pathId }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
