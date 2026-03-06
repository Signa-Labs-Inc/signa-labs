import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { softDeleteUserExercise } from '@/lib/services/exercises/exercises.reader';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { exerciseId } = await params;

    const deleted = await softDeleteUserExercise(exerciseId, user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Exercise not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
