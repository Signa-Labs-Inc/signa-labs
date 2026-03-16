import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/utils/api.handler-errors';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { getExerciseById, getExerciseFilesByType } from '@/lib/services/exercises/exercises.reader';
import { incrementPublicAttemptCount } from '@/lib/services/exercises/exercises.service';
import { createExecutionClient } from '@/lib/sandboxes/execution_clients';
import type { SandboxResult } from '@/lib/sandboxes/types';
import { db } from '@/index';
import { exerciseEnvironments } from '@/db/schema/tables';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ exerciseId: string }>;
}

interface TryRequestBody {
  files: { filePath: string; content: string }[];
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { exerciseId } = await params;

    // Parse and validate request body
    let body: TryRequestBody;
    try {
      body = (await request.json()) as TryRequestBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
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

    // Load exercise
    const exercise = await getExerciseById(exerciseId);
    if (!exercise) {
      throw new NotFoundError('Exercise', exerciseId);
    }

    // Access check: must be platform exercise or public user exercise
    if (exercise.origin !== 'platform' && !exercise.isPublic) {
      throw new ForbiddenError('This exercise is not publicly accessible');
    }

    // Load environment
    const [environment] = await db
      .select()
      .from(exerciseEnvironments)
      .where(eq(exerciseEnvironments.id, exercise.environment.id));

    if (!environment) {
      throw new NotFoundError('Exercise environment');
    }

    // Load test + support files
    const testFiles = await getExerciseFilesByType(exercise.id, 'test');
    const supportFiles = await getExerciseFilesByType(exercise.id, 'support');

    // Execute in sandbox
    const executionClient = createExecutionClient();
    const response = await executionClient.executeSubmission({
      image: environment.baseImage,
      language: exercise.language as 'python' | 'javascript' | 'typescript' | 'go' | 'sql',
      submissionFiles: body.files.map((f) => ({ filePath: f.filePath, content: f.content })),
      testFiles: testFiles.map((f) => ({ filePath: f.filePath, content: f.content })),
      supportFiles: supportFiles.map((f) => ({ filePath: f.filePath, content: f.content })),
      timeoutSeconds: environment.maxExecutionSeconds,
    });

    // Process results
    let result: SandboxResult;
    if (!response.success || !response.result) {
      result = {
        status: 'error',
        error_type: 'runner_error',
        error_message: response.error || 'Execution failed',
        tests_passed: 0,
        tests_failed: 0,
        tests_total: 0,
        execution_time_ms: response.totalDurationMs,
        results: [],
      };
    } else {
      result = response.result;
    }

    const isPassing =
      result.status === 'completed' && result.tests_failed === 0 && result.tests_total > 0;

    // Fire-and-forget: increment public attempt count
    if (exercise.isPublic) {
      incrementPublicAttemptCount(exerciseId).catch(() => {});
    }

    return NextResponse.json({
      isPassing,
      testsPassed: result.tests_passed,
      testsFailed: result.tests_failed,
      testsTotal: result.tests_total,
      executionTimeMs: result.execution_time_ms,
      results: result.results,
      error: result.status === 'error' ? (result.error_message ?? null) : null,
    });
  } catch (error) {
    return handleError(error);
  }
}
