/**
 * CodeForge Execution Client — Types & Interfaces
 *
 * Defines the contract that both LocalExecutionClient and FlyExecutionClient
 * implement. The SubmissionService depends only on this interface, making
 * the execution backend swappable via configuration.
 */

// Re-export the sandbox output types
export type { SandboxResult, SandboxTestResult, SandboxErrorType } from '../types';

import type { SandboxResult } from '../types';

// ============================================================
// Execution Client Interface
// ============================================================

export interface ExecutionClient {
  /**
   * Execute user-submitted code against test files in an isolated sandbox.
   * Returns structured test results.
   */
  executeSubmission(request: ExecutionRequest): Promise<ExecutionResponse>;
}

export interface ExecutionRequest {
  /** Which sandbox image to use (maps to exercise_environments.base_image) */
  image: string;

  /** Language identifier for selecting the correct local image in dev mode */
  language: 'python' | 'javascript' | 'typescript';

  /** Files to inject into /workspace/submission/ */
  submissionFiles: SandboxFile[];

  /** Files to inject into /workspace/tests/ */
  testFiles: SandboxFile[];

  /** Files to inject into /workspace/support/ (optional) */
  supportFiles?: SandboxFile[];

  /** Max execution time in seconds (from exercise_environments.max_execution_seconds) */
  timeoutSeconds: number;

  /** Memory limit in MB (default 256) */
  memoryMb?: number;
}

export interface SandboxFile {
  /** Relative path within its directory (e.g. "solution.py", "test_solution.py") */
  filePath: string;

  /** File content as a string */
  content: string;
}

export interface ExecutionResponse {
  /** Whether the execution infrastructure itself succeeded */
  success: boolean;

  /** Parsed sandbox output (null if infrastructure failed) */
  result: SandboxResult | null;

  /** Infrastructure-level error message (null if success) */
  error: string | null;

  /** Total wall-clock time including machine boot (ms) */
  totalDurationMs: number;
}
