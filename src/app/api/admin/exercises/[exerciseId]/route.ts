import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminReader from '@/lib/services/admin/admin.reader';
import * as adminWriter from '@/lib/services/admin/admin.writer';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const data = await adminReader.getExerciseForAdmin(exerciseId);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const body = await req.json();
    const data = await adminWriter.adminUpdateExercise(exerciseId, body);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const data = await adminWriter.adminSoftDeleteExercise(exerciseId);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
