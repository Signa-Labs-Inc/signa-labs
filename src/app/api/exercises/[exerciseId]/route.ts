import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { softDeleteUserExercise } from '@/lib/services/exercises/exercises.reader';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
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
    console.error('[DELETE /api/exercises/[exerciseId]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
