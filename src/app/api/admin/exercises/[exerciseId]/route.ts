import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const data = await adminService.getExercise(exerciseId);
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
    const data = await adminService.updateExercise(exerciseId, body);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const data = await adminService.softDeleteExercise(exerciseId);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
