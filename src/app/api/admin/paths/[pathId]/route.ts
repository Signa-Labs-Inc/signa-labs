import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { updatePathFeatured } from '@/lib/services/paths/paths.writer';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pathId: string }> }
) {
  try {
    await requireAdmin();
    const { pathId } = await params;

    let body: { isFeatured?: boolean; featuredOrder?: number | null };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (typeof body.isFeatured !== 'boolean') {
      return NextResponse.json({ error: 'isFeatured (boolean) is required' }, { status: 400 });
    }

    await updatePathFeatured(pathId, body.isFeatured, body.featuredOrder ?? null);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
