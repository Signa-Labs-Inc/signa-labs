import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminWriter from '@/lib/services/admin/admin.writer';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const { hints } = await req.json();
    const updated = await adminWriter.adminUpdateHints(exerciseId, hints);
    return Response.json(updated);
  } catch (error) {
    return handleError(error);
  }
}
