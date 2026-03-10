import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { TeachingService } from '@/lib/services/teaching/teaching.service';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

interface ExplainRequestBody {
  submissionId: string;
  exerciseTitle: string;
  exerciseDescription: string;
  exerciseDifficulty: string;
  userCode: string;
  testsPassed: number;
  testsTotal: number;
  testResults: { name: string; passed: boolean; error?: string }[];
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireCurrentUser();
    const { exerciseId } = await params;

    const body = (await request.json()) as ExplainRequestBody;

    if (!body.submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }

    if (!body.userCode) {
      return NextResponse.json({ error: 'userCode is required' }, { status: 400 });
    }

    // Don't explain passing submissions
    if (body.testsPassed === body.testsTotal && body.testsTotal > 0) {
      return NextResponse.json(
        { error: 'All tests passed — no explanation needed' },
        { status: 400 }
      );
    }

    const teachingService = new TeachingService();
    const explanation = await teachingService.getOrGenerateExplanation({
      userId: user.id,
      exerciseId,
      submissionId: body.submissionId,
      exerciseTitle: body.exerciseTitle,
      exerciseDescription: body.exerciseDescription,
      exerciseDifficulty: body.exerciseDifficulty,
      userCode: body.userCode,
      testsPassed: body.testsPassed,
      testsTotal: body.testsTotal,
      testResults: body.testResults,
      attemptNumber: 1, // Service will determine actual attempt number
    });

    return NextResponse.json({ explanation });
  } catch (error) {
    return handleError(error);
  }
}
