import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';
import { handleError } from '@/lib/utils/api.handler-errors';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { exerciseId } = await params;

    const body = (await request.json()) as {
      attemptId: string;
      files: Record<string, string>;
    };

    if (
      !body.attemptId ||
      !body.files ||
      typeof body.files !== 'object' ||
      Array.isArray(body.files)
    ) {
      return NextResponse.json({ error: 'Missing attemptId or files' }, { status: 400 });
    }

    if (!Object.values(body.files).every((v) => typeof v === 'string')) {
      return NextResponse.json(
        { error: 'Invalid files: all values must be strings' },
        { status: 400 }
      );
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
    return handleError(error);
  }
}
