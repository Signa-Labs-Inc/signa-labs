/**
 * FlyExecutionClient
 *
 * Creates ephemeral Fly Machines to execute user code in production.
 * Each submission gets its own Firecracker microVM that boots, runs tests,
 * and auto-destroys.
 *
 * Flow:
 *   1. Encode all files as base64
 *   2. POST to Fly Machines API to create a machine with files + auto_destroy
 *   3. Poll the machine's status until it reaches "stopped" or "destroyed"
 *   4. Fetch machine logs to get the JSON output
 *   5. Parse and return structured results
 */

import type { ExecutionClient, ExecutionRequest, ExecutionResponse, SandboxResult } from './types';

interface FlyExecutionConfig {
  apiToken: string;
  apiHostname: string; // https://api.machines.dev
  appName: string; // codeforge-sandboxes
  region: string; // ewr
}

interface FlyMachineResponse {
  id: string;
  state: string;
  instance_id: string;
}

export class FlyExecutionClient implements ExecutionClient {
  private config: FlyExecutionConfig;

  constructor(config: FlyExecutionConfig) {
    this.config = config;
  }

  static fromEnv(): FlyExecutionClient {
    const apiToken = process.env.FLY_API_TOKEN;
    if (!apiToken) {
      throw new Error(
        'FLY_API_TOKEN is required for FlyExecutionClient. Set it in your .env file.'
      );
    }

    return new FlyExecutionClient({
      apiToken,
      apiHostname: process.env.FLY_API_HOSTNAME || 'https://api.machines.dev',
      appName: process.env.FLY_SANDBOX_APP || 'codeforge-sandboxes',
      region: process.env.FLY_SANDBOX_REGION || 'ewr',
    });
  }

  async executeSubmission(request: ExecutionRequest): Promise<ExecutionResponse> {
    const startTime = Date.now();
    let machineId: string | null = null;

    try {
      // Build the files array for the Fly Machines API
      const files = this.buildFilesPayload(request);

      // Create and start the machine
      const machine = await this.createMachine({
        image: request.image,
        files,
        timeoutSeconds: request.timeoutSeconds,
        memoryMb: request.memoryMb || 256,
      });

      machineId = machine.id;

      // Wait for the machine to finish executing
      await this.waitForMachine(machineId, request.timeoutSeconds + 15);

      // Fetch logs to get the JSON output
      const output = await this.getMachineLogs(machineId);

      // Parse the output
      const result = this.parseOutput(output);

      return {
        success: true,
        result,
        error: null,
        totalDurationMs: Date.now() - startTime,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);

      if (error.includes('timed out') || error.includes('TIMEOUT')) {
        return {
          success: true,
          result: {
            status: 'error',
            error_type: 'timeout',
            error_message: `Execution exceeded ${request.timeoutSeconds}s time limit`,
            tests_passed: 0,
            tests_failed: 0,
            tests_total: 0,
            execution_time_ms: Date.now() - startTime,
            results: [],
          },
          error: null,
          totalDurationMs: Date.now() - startTime,
        };
      }

      return {
        success: false,
        result: null,
        error: `Fly execution failed: ${error}`,
        totalDurationMs: Date.now() - startTime,
      };
    } finally {
      // Best-effort cleanup — auto_destroy should handle this,
      // but force delete if the machine is still around
      if (machineId) {
        this.deleteMachine(machineId).catch(() => {});
      }
    }
  }

  /**
   * Convert submission/test/support files into Fly Machines API files format.
   * Each file becomes { guest_path, raw_value } where raw_value is base64.
   */
  private buildFilesPayload(
    request: ExecutionRequest
  ): { guest_path: string; raw_value: string }[] {
    const files: { guest_path: string; raw_value: string }[] = [];

    for (const file of request.submissionFiles) {
      files.push({
        guest_path: `/workspace/submission/${file.filePath}`,
        raw_value: Buffer.from(file.content, 'utf-8').toString('base64'),
      });
    }

    for (const file of request.testFiles) {
      files.push({
        guest_path: `/workspace/tests/${file.filePath}`,
        raw_value: Buffer.from(file.content, 'utf-8').toString('base64'),
      });
    }

    if (request.supportFiles) {
      for (const file of request.supportFiles) {
        files.push({
          guest_path: `/workspace/support/${file.filePath}`,
          raw_value: Buffer.from(file.content, 'utf-8').toString('base64'),
        });
      }
    }

    return files;
  }

  /**
   * Create an ephemeral Fly Machine with the sandbox image and injected files.
   */
  private async createMachine(config: {
    image: string;
    files: { guest_path: string; raw_value: string }[];
    timeoutSeconds: number;
    memoryMb: number;
  }): Promise<FlyMachineResponse> {
    const url = `${this.config.apiHostname}/v1/apps/${this.config.appName}/machines`;

    const body = {
      region: this.config.region,
      config: {
        image: config.image,
        auto_destroy: true,
        restart: { policy: 'no' },
        guest: {
          cpu_kind: 'shared',
          cpus: 1,
          memory_mb: config.memoryMb,
        },
        env: {
          MAX_EXECUTION_SECONDS: String(config.timeoutSeconds),
        },
        files: config.files,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to create Fly Machine: ${response.status} ${errorBody}`);
    }

    return (await response.json()) as FlyMachineResponse;
  }

  /**
   * Poll the machine status until it reaches a terminal state.
   */
  private async waitForMachine(machineId: string, maxWaitSeconds: number): Promise<void> {
    const url = `${this.config.apiHostname}/v1/apps/${this.config.appName}/machines/${machineId}/wait?state=stopped&timeout=${maxWaitSeconds}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
      },
      signal: AbortSignal.timeout(maxWaitSeconds * 1000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      // 408 means the machine didn't reach the target state in time
      if (response.status === 408) {
        throw new Error('Machine execution timed out');
      }
      throw new Error(`Failed to wait for machine: ${response.status} ${errorBody}`);
    }
  }

  /**
   * Fetch stdout logs from the machine to get the JSON test results.
   */
  private async getMachineLogs(machineId: string): Promise<string> {
    // Fly's nats-based log endpoint
    const url = `${this.config.apiHostname}/v1/apps/${this.config.appName}/machines/${machineId}/logs?nats=true`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch machine logs: ${response.status}`);
    }

    const text = await response.text();

    // Fly logs return NATS-formatted lines. Extract the message payloads.
    // Each line is a JSON object with a "message" field containing the actual log line.
    const lines = text.split('\n').filter((line) => line.trim());
    const messages: string[] = [];

    for (const line of lines) {
      try {
        const logEntry = JSON.parse(line);
        if (logEntry.message) {
          messages.push(logEntry.message);
        }
      } catch {
        // Some lines might not be JSON (headers, etc.)
        messages.push(line);
      }
    }

    return messages.join('\n');
  }

  /**
   * Force-delete a machine. Best effort — auto_destroy handles most cases.
   */
  private async deleteMachine(machineId: string): Promise<void> {
    const url = `${this.config.apiHostname}/v1/apps/${this.config.appName}/machines/${machineId}?force=true`;

    await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
      },
    });
  }

  private parseOutput(output: string): SandboxResult {
    const lines = output.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed) as SandboxResult;
          if (parsed.status && typeof parsed.tests_passed === 'number') {
            return parsed;
          }
        } catch {
          continue;
        }
      }
    }

    return {
      status: 'error',
      error_type: 'parse_error',
      error_message: 'Could not parse test runner output from Fly Machine logs',
      stderr: output.slice(0, 2000),
      tests_passed: 0,
      tests_failed: 0,
      tests_total: 0,
      execution_time_ms: 0,
      results: [],
    };
  }
}
