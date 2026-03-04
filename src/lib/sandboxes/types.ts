/**
 * CodeForge Sandbox Output Contract
 *
 * Every sandbox test runner (Python, JavaScript, TypeScript) outputs
 * JSON to stdout conforming to this shape. The SubmissionService
 * parses this output to populate exercise_submissions rows.
 *
 * This file serves as the canonical type definition — keep it in sync
 * with the test runner implementations in sandboxes/{language}/.
 */

export interface SandboxResult {
  /** Whether the test run completed or hit an error */
  status: 'completed' | 'error';

  /** Total wall-clock execution time in milliseconds */
  execution_time_ms: number;

  /** Number of tests that passed */
  tests_passed: number;

  /** Number of tests that failed */
  tests_failed: number;

  /** Total number of tests discovered */
  tests_total: number;

  /** Per-test results (empty array on error) */
  results: SandboxTestResult[];

  /** Error type classification (only present when status === 'error') */
  error_type?: SandboxErrorType;

  /** Human-readable error message (only present when status === 'error') */
  error_message?: string;

  /** Raw stderr output, sanitized (only present when status === 'error') */
  stderr?: string;
}

export interface SandboxTestResult {
  /** Human-readable test name (e.g. "handles empty array") */
  name: string;

  /** Whether this individual test passed */
  passed: boolean;

  /** Execution time for this test in milliseconds */
  time_ms: number;

  /** Expected value (only present on failure, if extractable) */
  expected?: string;

  /** Actual value (only present on failure, if extractable) */
  actual?: string;

  /** Error message (only present on failure) */
  error?: string;
}

export type SandboxErrorType =
  | 'syntax_error'
  | 'import_error'
  | 'name_error'
  | 'reference_error'
  | 'type_error'
  | 'runtime_error'
  | 'timeout'
  | 'configuration_error'
  | 'parse_error'
  | 'runner_error'
  | 'unknown_error';
