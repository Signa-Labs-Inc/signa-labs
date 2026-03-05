import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

interface SubmitRequestBody {
  attemptId: string;
  files: { filePath: string; content: string }[];
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { exerciseId } = await params;

    // Parse and validate request body
    let body: SubmitRequestBody;
    try {
      body = (await request.json()) as SubmitRequestBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (!body.attemptId || typeof body.attemptId !== 'string') {
      return NextResponse.json({ error: 'attemptId is required' }, { status: 400 });
    }

    if (!Array.isArray(body.files) || body.files.length === 0) {
      return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });
    }

    for (const file of body.files) {
      if (!file.filePath || typeof file.filePath !== 'string') {
        return NextResponse.json(
          { error: 'Each file must have a filePath string' },
          { status: 400 }
        );
      }
      if (typeof file.content !== 'string') {
        return NextResponse.json(
          { error: `File "${file.filePath}" must have a content string` },
          { status: 400 }
        );
      }
    }

    // Submit solution
    const service = new SubmissionService();
    const result = await service.submitSolution({
      userId: user.id,
      exerciseId,
      attemptId: body.attemptId,
      files: body.files,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
