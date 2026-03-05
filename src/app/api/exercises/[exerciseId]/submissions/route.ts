import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';
import type { SubmissionHistoryItem } from '@/lib/services/submissions/submissions.types';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ submissions: SubmissionHistoryItem[] } | { error: string }>> {
  try {
    const user = await requireCurrentUser();
    await params; // validate route params are resolved

    // Get attemptId from query params
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('attemptId');

    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId query parameter is required' }, { status: 400 });
    }

    const service = new SubmissionService();
    const submissions: SubmissionHistoryItem[] = await service.getAttemptSubmissions(
      attemptId,
      user.id
    );

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('[GET /api/exercises/[exerciseId]/submissions]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
