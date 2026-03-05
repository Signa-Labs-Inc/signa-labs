/**
 * Submissions Types
 *
 * Shared types and error class for the submissions service.
 */

import type { SandboxResult } from '@/lib/sandboxes/types';
import { AppError } from '@/lib/utils/errors';

// ============================================================
// Constants
// ============================================================

export const SUPPORTED_LANGUAGES = ['python', 'javascript', 'typescript'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ============================================================
// Input types
// ============================================================

export interface SubmitSolutionInput {
  userId: string;
  exerciseId: string;
  attemptId: string;
  files: SubmissionFileInput[];
}

export interface SubmissionFileInput {
  filePath: string;
  content: string;
}

// ============================================================
// Service output types
// ============================================================

export interface SubmitSolutionResult {
  submissionId: string;
  isPassing: boolean;
  testsPassed: number;
  testsFailed: number;
  testsTotal: number;
  testOutput: string | null;
  executionTimeMs: number;
  results: SandboxResult['results'];
  error: string | null;
}

export interface SubmissionDetail {
  id: string;
  attemptId: string;
  isPassing: boolean;
  testsPassed: number;
  testsFailed: number;
  testsTotal: number;
  executionTimeMs: number | null;
  submittedAt: Date;
  results: SandboxResult['results'];
  error: string | null;
}

export interface SubmissionHistoryItem {
  id: string;
  isPassing: boolean;
  testsPassed: number;
  testsFailed: number;
  testsTotal: number;
  executionTimeMs: number | null;
  submittedAt: Date;
}

// ============================================================
// Reader return types
// ============================================================

export interface AttemptRecord {
  id: string;
  userId: string;
  exerciseId: string;
  status: string;
  hintsRevealed: number;
  solutionViewed: boolean;
  startedAt: Date;
  completedAt: Date | null;
  timeSpentSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseRecord {
  id: string;
  origin: string;
  environmentId: string;
  language: string;
  title: string;
  description: string;
  difficulty: string;
}

export interface EnvironmentRecord {
  id: string;
  name: string;
  baseImage: string;
  maxExecutionSeconds: number;
  maxFiles: number;
  maxFileSizeBytes: number;
}

export interface ExerciseFileRecord {
  filePath: string;
  content: string;
}

export interface SubmissionFileRecord {
  filePath: string;
  content: string;
}

// ============================================================
// Writer input types
// ============================================================

export interface CreateSubmissionInput {
  attemptId: string;
  userId: string;
}

export interface CreateSubmissionResult {
  id: string;
}

export interface UpdateSubmissionResultsInput {
  testsPassed: number;
  testsFailed: number;
  testsTotal: number;
  testOutput: string;
  executionTimeMs: number;
  isPassing: boolean;
}

// ============================================================
// Error handling
// ============================================================

export type SubmissionErrorCode =
  | 'ATTEMPT_NOT_FOUND'
  | 'ATTEMPT_ABANDONED'
  | 'EXERCISE_NOT_FOUND'
  | 'ENVIRONMENT_NOT_FOUND'
  | 'NO_FILES'
  | 'TOO_MANY_FILES'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_PATH'
  | 'DUPLICATE_FILE_PATH'
  | 'RATE_LIMITED';

const SUBMISSION_ERROR_STATUS: Record<SubmissionErrorCode, number> = {
  ATTEMPT_NOT_FOUND: 404,
  EXERCISE_NOT_FOUND: 404,
  ENVIRONMENT_NOT_FOUND: 404,
  ATTEMPT_ABANDONED: 400,
  NO_FILES: 400,
  TOO_MANY_FILES: 400,
  FILE_TOO_LARGE: 400,
  INVALID_FILE_PATH: 400,
  DUPLICATE_FILE_PATH: 400,
  RATE_LIMITED: 429,
};

export class SubmissionError extends AppError {
  constructor(code: SubmissionErrorCode, message: string) {
    super(message, code, SUBMISSION_ERROR_STATUS[code] ?? 500);
    this.name = 'SubmissionError';
  }
}

export interface CreateAttemptResult {
  id: string;
}
