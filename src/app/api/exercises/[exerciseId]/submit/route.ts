import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { SubmissionError } from '@/lib/services/submissions/submissions.types';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';
import type { SubmitSolutionResult } from '@/lib/services/submissions/submissions.types';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

interface SubmitRequestBody {
  attemptId: string;
  files: { filePath: string; content: string }[];
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SubmitSolutionResult | { error: string; code?: string }>> {
  try {
    const user = await requireCurrentUser();
    await params; // validate route params are resolved

    // Parse and validate request body
    const body = (await request.json()) as SubmitRequestBody;

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
    const result: SubmitSolutionResult = await service.submitSolution({
      userId: user.id,
      attemptId: body.attemptId,
      files: body.files,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SubmissionError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('[POST /api/exercises/[exerciseId]/submit]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
