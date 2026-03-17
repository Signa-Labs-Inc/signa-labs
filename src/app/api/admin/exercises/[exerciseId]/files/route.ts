import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminWriter from '@/lib/services/admin/admin.writer';
import * as adminReader from '@/lib/services/admin/admin.reader';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    await requireAdmin();
    const { exerciseId } = await params;
    const body = await req.json();
    const file = await adminWriter.createExerciseFile(exerciseId, body);
    return Response.json(file, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
