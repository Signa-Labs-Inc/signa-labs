import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const { hints } = await req.json();
    const updated = await adminService.updateExerciseHints(exerciseId, hints);
    return Response.json(updated);
  } catch (error) {
    return handleError(error);
  }
}
