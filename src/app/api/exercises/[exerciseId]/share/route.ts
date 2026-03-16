import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { shareExercise, unshareExercise } from '@/lib/services/exercises/exercises.service';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { exerciseId } = await params;

    const { slug } = await shareExercise(exerciseId, user.id);

    return NextResponse.json({
      slug,
      shareUrl: `/e/${slug}`,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { exerciseId } = await params;

    await unshareExercise(exerciseId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
