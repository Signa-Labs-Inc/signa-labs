import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';
import { handleError } from '@/lib/utils/api.handler-errors';

interface RouteParams {
  params: Promise<{ exerciseId: string; attemptId: string }>;
}

/**
 * PUT /api/exercises/[exerciseId]/attempts/[attemptId]/time
 * Increment the time spent on an attempt.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { exerciseId, attemptId } = await params;

    let body: { seconds?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const seconds = body?.seconds;
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) {
      return NextResponse.json({ error: 'Invalid seconds value' }, { status: 400 });
    }

    // Cap at 5 minutes per sync to prevent abuse
    const cappedSeconds = Math.min(seconds, 300);

    const submissionService = new SubmissionService();
    await submissionService.addTimeSpent(user.id, exerciseId, attemptId, cappedSeconds);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
