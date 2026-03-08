/**
 * SubmissionService
 *
 * Orchestrates the full code submission pipeline using the reader
 * and writer modules for database access and the ExecutionClient
 * for sandbox execution.
 */

import { createExecutionClient } from '@/lib/sandboxes/execution_clients';
import type { ExecutionClient } from '@/lib/sandboxes/execution_clients';
import type { SandboxResult } from '@/lib/sandboxes/types';
import { db } from '@/index';
import * as reader from './submissions.reader';
import * as writer from './submissions.writer';
import { SubmissionError, SUPPORTED_LANGUAGES } from './submissions.types';
import type {
  AttemptRecord,
  SubmitSolutionInput,
  SubmitSolutionResult,
  SubmissionDetail,
  SubmissionHistoryItem,
  SubmissionFileInput,
  SupportedLanguage,
} from './submissions.types';

export class SubmissionService {
  private executionClient: ExecutionClient;

  constructor(executionClient?: ExecutionClient) {
    this.executionClient = executionClient ?? createExecutionClient();
  }

  /**
   * Submit a solution for an exercise attempt.
   * Main entry point called by the API route.
   */
  async submitSolution(input: SubmitSolutionInput): Promise<SubmitSolutionResult> {
    const { userId, exerciseId, attemptId, files } = input;

    // 1. Validate attempt ownership, status, and exercise scoping
    const attempt = await reader.getAttemptByIdAndUser(attemptId, userId);
    if (!attempt) {
      throw new SubmissionError('ATTEMPT_NOT_FOUND', 'Exercise attempt not found');
    }
    if (attempt.exerciseId !== exerciseId) {
      throw new SubmissionError('ATTEMPT_NOT_FOUND', 'Exercise attempt not found');
    }
    if (attempt.status === 'abandoned') {
      throw new SubmissionError('ATTEMPT_ABANDONED', 'This attempt has been abandoned');
    }

    // 2. Load exercise + environment
    const exercise = await reader.getExerciseById(attempt.exerciseId);
    if (!exercise) {
      throw new SubmissionError('EXERCISE_NOT_FOUND', 'Exercise not found');
    }

    const environment = await reader.getEnvironmentById(exercise.environmentId);
    if (!environment) {
      throw new SubmissionError('ENVIRONMENT_NOT_FOUND', 'Exercise environment not configured');
    }

    // 3. Validate file constraints and language support
    this.validateFiles(files, {
      maxFiles: environment.maxFiles,
      maxFileSizeBytes: environment.maxFileSizeBytes,
    });

    if (!SUPPORTED_LANGUAGES.includes(exercise.language as SupportedLanguage)) {
      throw new SubmissionError(
        'ENVIRONMENT_NOT_FOUND',
        `Unsupported language: ${exercise.language}`
      );
    }

    // 4. Create submission record + persist files
    const submission = await writer.createSubmission({ attemptId, userId });
    await writer.createSubmissionFiles(submission.id, files);

    // 5. Emit code_submitted event
    await writer.emitExerciseEvent(attemptId, userId, 'code_submitted', {
      submissionId: submission.id,
      fileCount: files.length,
    });

    // 6. Load test + support files for the exercise
    const testFiles = await reader.getExerciseFilesByType(exercise.id, 'test');
    const supportFiles = await reader.getExerciseFilesByType(exercise.id, 'support');

    // 7. Execute in sandbox
    const response = await this.executionClient.executeSubmission({
      image: environment.baseImage,
      language: exercise.language as SupportedLanguage,
      submissionFiles: files.map((f) => ({ filePath: f.filePath, content: f.content })),
      testFiles: testFiles.map((f) => ({ filePath: f.filePath, content: f.content })),
      supportFiles: supportFiles.map((f) => ({ filePath: f.filePath, content: f.content })),
      timeoutSeconds: environment.maxExecutionSeconds,
    });

    // 8. Process results
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

    // 9. Update submission with results (transactional with completion side-effects)
    const isPassing =
      result.status === 'completed' && result.tests_failed === 0 && result.tests_total > 0;

    await db.transaction(async (tx) => {
      await writer.updateSubmissionResults(
        submission.id,
        {
          testsPassed: result.tests_passed,
          testsFailed: result.tests_failed,
          testsTotal: result.tests_total,
          testOutput: JSON.stringify(result),
          executionTimeMs: result.execution_time_ms,
          isPassing,
        },
        tx
      );

      // 10. Emit test result event
      await writer.emitExerciseEvent(
        attemptId,
        userId,
        isPassing ? 'tests_passed' : 'tests_failed',
        {
          submissionId: submission.id,
          testsPassed: result.tests_passed,
          testsFailed: result.tests_failed,
          testsTotal: result.tests_total,
        },
        tx
      );

      // Update streak on every submission (rewards practice, not just completion)
      await writer.updateStreakOnSubmission(userId, tx);

      // 11. If passing for the first time, complete the attempt and update stats
      if (isPassing && attempt.status === 'in_progress') {
        const transitioned = await writer.markAttemptCompleted(attemptId, tx);
        if (transitioned) {
          await writer.emitExerciseEvent(
            attemptId,
            userId,
            'attempt_completed',
            { submissionId: submission.id },
            tx
          );
          await writer.updateLearningStatsOnCompletion(userId, tx);
        }
      }
    });

    return {
      submissionId: submission.id,
      isPassing,
      testsPassed: result.tests_passed,
      testsFailed: result.tests_failed,
      testsTotal: result.tests_total,
      testOutput: result.status === 'error' ? (result.error_message ?? null) : null,
      executionTimeMs: result.execution_time_ms,
      results: result.results,
      error: result.status === 'error' ? (result.error_message ?? null) : null,
    };
  }

  async getAttempt(attemptId: string, userId: string): Promise<AttemptRecord | null> {
    return reader.getAttemptByIdAndUser(attemptId, userId);
  }

  async getSubmission(submissionId: string, userId: string): Promise<SubmissionDetail | null> {
    return reader.getSubmissionByIdAndUser(submissionId, userId);
  }

  async getAttemptSubmissions(attemptId: string, userId: string): Promise<SubmissionHistoryItem[]> {
    return reader.getSubmissionsByAttempt(attemptId, userId);
  }

  async getCompletedExerciseIds(userId: string, exerciseIds: string[]): Promise<Set<string>> {
    return reader.getCompletedExerciseIds(userId, exerciseIds);
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private validateFiles(
    files: SubmissionFileInput[],
    limits: { maxFiles: number; maxFileSizeBytes: number }
  ): void {
    if (files.length === 0) {
      throw new SubmissionError('NO_FILES', 'At least one file is required');
    }

    if (files.length > limits.maxFiles) {
      throw new SubmissionError(
        'TOO_MANY_FILES',
        `Maximum ${limits.maxFiles} files allowed, got ${files.length}`
      );
    }

    const seenPaths = new Set<string>();
    for (const file of files) {
      if (seenPaths.has(file.filePath)) {
        throw new SubmissionError('DUPLICATE_FILE_PATH', `Duplicate file path: "${file.filePath}"`);
      }
      seenPaths.add(file.filePath);

      const sizeBytes = Buffer.byteLength(file.content, 'utf-8');
      if (sizeBytes > limits.maxFileSizeBytes) {
        throw new SubmissionError(
          'FILE_TOO_LARGE',
          `File "${file.filePath}" exceeds ${Math.round(limits.maxFileSizeBytes / 1024)}KB limit`
        );
      }

      if (file.filePath.includes('..') || file.filePath.startsWith('/')) {
        throw new SubmissionError('INVALID_FILE_PATH', `Invalid file path: "${file.filePath}"`);
      }
    }
  }

  /**
   * Get or create an active attempt for an exercise.
   * If the user has an in_progress attempt, return it.
   * Otherwise, create a new one and update learning stats.
   */
  async getOrCreateAttempt(
    userId: string,
    exerciseId: string
  ): Promise<{ attemptId: string; isNew: boolean }> {
    // Check for existing active attempt
    const existing = await reader.getActiveAttemptForExercise(userId, exerciseId);
    if (existing) {
      return { attemptId: existing.id, isNew: false };
    }

    // Create new attempt with event + stats in a single transaction.
    // The unique partial index on (userId, exerciseId) WHERE status='in_progress'
    // prevents duplicates. createAttempt uses onConflictDoNothing and returns
    // null if a concurrent request already created the attempt.
    const attempt = await db.transaction(async (tx) => {
      const created = await writer.createAttempt(userId, exerciseId, tx);
      if (!created) return null;

      await writer.emitExerciseEvent(
        created.id,
        userId,
        'attempt_started',
        {
          exerciseId,
        },
        tx
      );

      await writer.updateLearningStatsOnAttemptStart(userId, tx);

      return created;
    });

    if (!attempt) {
      // Conflict — a concurrent request created the attempt; re-read it
      const raced = await reader.getActiveAttemptForExercise(userId, exerciseId);
      if (raced) {
        return { attemptId: raced.id, isNew: false };
      }
      throw new SubmissionError('ATTEMPT_NOT_FOUND', 'Failed to create or find active attempt');
    }

    return { attemptId: attempt.id, isNew: true };
  }

  /**
   * Get the draft code for an attempt.
   * Returns an empty object if no draft has been saved yet.
   */
  /**
   * Get the saved draft code for the user's attempt.
   */
  async getDraftCode(userId: string, attemptId: string): Promise<Record<string, string> | null> {
    return reader.getAttemptDraftCode(attemptId, userId);
  }

  /**
   * Save draft code for the user's active attempt.
   */
  async saveDraftCode(
    userId: string,
    exerciseId: string,
    attemptId: string,
    files: Record<string, string>
  ): Promise<boolean> {
    return writer.saveDraftCode(attemptId, userId, exerciseId, files);
  }
}
