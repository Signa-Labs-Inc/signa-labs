import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { requireUsageLimit } from '@/lib/services/subscriptions/subscriptions.gate';
import { PathService } from '@/lib/services/paths/paths.service';
import { PathError } from '@/lib/services/paths/paths.types';
import { handleError } from '@/lib/utils/api.handler-errors';
import { NotFoundError } from '@/lib/utils/errors';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    await requireUsageLimit(user.id, 'paths');

    let body: { featuredPathId?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (typeof body.featuredPathId !== 'string' || !UUID_RE.test(body.featuredPathId)) {
      return NextResponse.json({ error: 'featuredPathId must be a valid UUID' }, { status: 400 });
    }

    const pathService = new PathService();
    const { pathId } = await pathService.startFeaturedPath(user.id, body.featuredPathId);

    return NextResponse.json({ pathId }, { status: 201 });
  } catch (error) {
    if (error instanceof PathError) {
      return handleError(new NotFoundError('Featured path', (error as PathError).code));
    }
    return handleError(error);
  }
}
