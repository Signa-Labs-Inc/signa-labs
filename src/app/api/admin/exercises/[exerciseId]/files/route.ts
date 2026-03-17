import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const body = await req.json();
    const file = await adminService.createExerciseFile(exerciseId, body);
    return Response.json(file, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
