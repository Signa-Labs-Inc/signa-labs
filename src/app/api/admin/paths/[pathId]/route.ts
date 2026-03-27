import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { getPathById } from '@/lib/services/paths/paths.reader';
import { updatePathFeatured } from '@/lib/services/paths/paths.writer';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pathId: string }> }
) {
  try {
    await requireAdmin();
    const { pathId } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (body === null || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { isFeatured, featuredOrder } = body as {
      isFeatured?: unknown;
      featuredOrder?: unknown;
    };

    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json({ error: 'isFeatured (boolean) is required' }, { status: 400 });
    }

    if (
      featuredOrder !== undefined &&
      featuredOrder !== null &&
      (!Number.isInteger(featuredOrder) || (featuredOrder as number) < 0)
    ) {
      return NextResponse.json(
        { error: 'featuredOrder must be null or a non-negative integer' },
        { status: 400 }
      );
    }

    const path = await getPathById(pathId);
    if (!path) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 });
    }

    const resolvedOrder = (featuredOrder as number | null) ?? null;
    const updated = await updatePathFeatured(pathId, isFeatured, resolvedOrder);

    if (!updated) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      isFeatured,
      featuredOrder: resolvedOrder,
    });
  } catch (error) {
    return handleError(error);
  }
}
