import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminWriter from '@/lib/services/admin/admin.writer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string; fileId: string }> }
) {
  try {
    await requireAdmin();
    const { fileId } = await params;
    const body = await req.json();
    const updated = await adminWriter.updateExerciseFile(fileId, body);
    return Response.json(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string; fileId: string }> }
) {
  try {
    await requireAdmin();
    const { fileId } = await params;
    const deleted = await adminWriter.deleteExerciseFile(fileId);
    return Response.json(deleted);
  } catch (error) {
    return handleError(error);
  }
}
