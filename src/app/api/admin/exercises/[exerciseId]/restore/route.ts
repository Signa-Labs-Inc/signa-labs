import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminWriter from '@/lib/services/admin/admin.writer';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const data = await adminWriter.adminRestoreExercise(exerciseId);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
