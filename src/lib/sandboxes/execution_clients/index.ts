/**
 * Execution Client Factory
 *
 * Returns the appropriate ExecutionClient based on environment configuration.
 * - Development: LocalExecutionClient (Docker on your machine)
 * - Production:  FlyExecutionClient (ephemeral Fly Machines)
 *
 * Usage in your service layer:
 *
 *   import { createExecutionClient } from "@/lib/sandboxes";
 *
 *   const client = createExecutionClient();
 *   const response = await client.executeSubmission({ ... });
 */

import type { ExecutionClient } from './types';
import { LocalExecutionClient } from './local-execution-client';
import { FlyExecutionClient } from './fly-execution-client';

export type ExecutionMode = 'local' | 'fly';

/**
 * Create an ExecutionClient based on the current environment.
 *
 * Reads SANDBOX_EXECUTION_MODE from environment:
 *   - "local" (default): Uses Docker directly
 *   - "fly": Uses Fly Machines API (requires FLY_API_TOKEN)
 */
export function createExecutionClient(): ExecutionClient {
  const mode = (process.env.SANDBOX_EXECUTION_MODE || 'local') as ExecutionMode;

  switch (mode) {
    case 'fly':
      return FlyExecutionClient.fromEnv();

    case 'local':
    default:
      return new LocalExecutionClient();
  }
}

// Re-export everything consumers need
export { LocalExecutionClient } from './local-execution-client';
export { FlyExecutionClient } from './fly-execution-client';
export type { ExecutionClient, ExecutionRequest, ExecutionResponse, SandboxFile } from './types';
export type { SandboxResult, SandboxTestResult, SandboxErrorType } from './types';
