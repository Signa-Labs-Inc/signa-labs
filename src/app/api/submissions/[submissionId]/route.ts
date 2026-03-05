import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';
import type { SubmissionDetail } from '@/lib/services/submissions/submissions.types';

interface RouteParams {
  params: Promise<{ submissionId: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SubmissionDetail | { error: string }>> {
  try {
    const user = await requireCurrentUser();
    const { submissionId } = await params;

    const service = new SubmissionService();
    const submission: SubmissionDetail | null = await service.getSubmission(submissionId, user.id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('[GET /api/submissions/[submissionId]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
