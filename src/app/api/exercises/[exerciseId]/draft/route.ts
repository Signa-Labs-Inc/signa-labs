import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const user = await requireCurrentUser();
    const { exerciseId } = await params;

    const body = (await request.json()) as {
      attemptId: string;
      files: Record<string, string>;
    };

    if (!body.attemptId || !body.files || typeof body.files !== 'object') {
      return NextResponse.json({ error: 'Missing attemptId or files' }, { status: 400 });
    }

    const submissionService = new SubmissionService();
    const saved = await submissionService.saveDraftCode(
      user.id,
      exerciseId,
      body.attemptId,
      body.files
    );

    if (!saved) {
      return NextResponse.json(
        { error: 'No active attempt found for this exercise' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUT /api/exercises/[exerciseId]/draft]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
