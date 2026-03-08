import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';

interface RouteParams {
  params: Promise<{ exerciseId: string; attemptId: string }>;
}

/**
 * PUT /api/exercises/[exerciseId]/attempts/[attemptId]/time
 * Increment the time spent on an attempt.
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const user = await requireCurrentUser();
    const { exerciseId, attemptId } = await params;

    const body = (await request.json()) as { seconds: number };

    if (!body.seconds || typeof body.seconds !== 'number' || body.seconds <= 0) {
      return NextResponse.json({ error: 'Invalid seconds value' }, { status: 400 });
    }

    // Cap at 5 minutes per sync to prevent abuse
    const seconds = Math.min(body.seconds, 300);

    const submissionService = new SubmissionService();
    await submissionService.addTimeSpent(user.id, exerciseId, attemptId, seconds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUT /api/exercises/[exerciseId]/attempts/[attemptId]/time]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
