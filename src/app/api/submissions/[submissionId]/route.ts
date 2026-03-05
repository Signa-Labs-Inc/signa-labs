import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';

interface RouteParams {
  params: Promise<{ submissionId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { submissionId } = await params;

    const service = new SubmissionService();
    const submission = await service.getSubmission(submissionId, user.id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    return handleError(error);
  }
}
