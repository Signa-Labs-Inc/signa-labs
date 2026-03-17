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
    const { files } = await req.json();
    const result = await adminService.replaceExerciseFiles(exerciseId, files);
    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
