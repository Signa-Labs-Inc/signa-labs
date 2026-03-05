import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { exerciseId } = await params;

    // Get attemptId from query params
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('attemptId');

    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId query parameter is required' }, { status: 400 });
    }

    // Validate attempt belongs to this exercise and user
    const service = new SubmissionService();
    const attempt = await service.getAttempt(attemptId, user.id);

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.exerciseId !== exerciseId) {
      return NextResponse.json(
        { error: 'Attempt does not belong to this exercise' },
        { status: 400 }
      );
    }

    const submissions = await service.getAttemptSubmissions(attemptId, user.id);

    return NextResponse.json({ submissions });
  } catch (error) {
    return handleError(error);
  }
}
