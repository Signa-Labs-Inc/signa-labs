import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const data = await adminService.restoreExercise(exerciseId);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
