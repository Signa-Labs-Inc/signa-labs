/**
 * FlyExecutionClient
 *
 * Creates ephemeral Fly Machines to execute user code in production.
 * Each submission gets its own Firecracker microVM that boots, runs tests,
 * and serves results via HTTP.
 *
 * Flow:
 *   1. Encode all files as base64
 *   2. POST to Fly Machines API to create a machine with files + HTTP service
 *   3. Wait for the machine to reach "started" state
 *   4. Poll GET /health until the test runner finishes
 *   5. GET /results to fetch the JSON output
 *   6. Delete the machine
 */

import type { ExecutionClient, ExecutionRequest, ExecutionResponse, SandboxResult } from './types';

interface FlyExecutionConfig {
  apiToken: string;
  apiHostname: string; // https://api.machines.dev
  appName: string; // signa-labs-sandboxes
  region: string; // ewr
}

interface FlyMachineResponse {
  id: string;
  state: string;
  instance_id: string;
}

const WRAPPER_PORT = 8080;
const HEALTH_POLL_INTERVAL_MS = 500;
const MACHINE_STARTUP_TIMEOUT_S = 30;
const RESULT_FETCH_BUFFER_S = 30;

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
      appName: process.env.FLY_SANDBOX_APP || 'signa-labs-sandboxes',
      region: process.env.FLY_SANDBOX_REGION || 'ewr',
    });
  }

  async executeSubmission(request: ExecutionRequest): Promise<ExecutionResponse> {
    const startTime = Date.now();
    let machineId: string | null = null;

    try {
      const files = this.buildFilesPayload(request);

      // Create machine with HTTP service
      // CMD is baked into the Docker image — no need to override via init.cmd.
      // The image CMD points to /opt/sandbox/http-wrapper.{py,cjs}.
      const machine = await this.createMachine({
        image: request.image,
        files,
        timeoutSeconds: request.timeoutSeconds,
        memoryMb: request.memoryMb || 512,
      });

      machineId = machine.id;

      // Wait for machine to be started (HTTP service ready)
      await this.waitForMachine(
        machineId,
        machine.instance_id,
        'started',
        MACHINE_STARTUP_TIMEOUT_S
      );

      // Poll /health until tests are done, then fetch results
      const output = await this.fetchResults(machineId, request.timeoutSeconds);

      const result = this.parseOutput(output);

      return {
        success: true,
        result,
        error: null,
        totalDurationMs: Date.now() - startTime,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`[Fly] executeSubmission error: ${error}`);

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
      if (machineId) {
        this.deleteMachine(machineId).catch(() => {});
      }
    }
  }

  // ============================================================
  // File encoding
  // ============================================================

  private buildFilesPayload(
    request: ExecutionRequest
  ): { guest_path: string; raw_value: string }[] {
    const encode = (dir: string, files: { filePath: string; content: string }[]) =>
      files.map((f) => ({
        guest_path: `/workspace/${dir}/${f.filePath}`,
        raw_value: Buffer.from(f.content, 'utf-8').toString('base64'),
      }));

    return [
      ...encode('submission', request.submissionFiles),
      ...encode('tests', request.testFiles),
      ...encode('support', request.supportFiles ?? []),
    ];
  }

  // ============================================================
  // Machine lifecycle
  // ============================================================

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
        auto_destroy: false,
        restart: { policy: 'no' },
        guest: {
          cpu_kind: 'shared',
          cpus: 1,
          memory_mb: config.memoryMb,
        },
        env: {
          MAX_EXECUTION_SECONDS: String(config.timeoutSeconds),
          TEST_RUNNER: this.getTestRunnerPath(config.image),
        },
        files: config.files,
        services: [
          {
            ports: [
              {
                port: 443,
                handlers: ['tls', 'http'],
              },
              {
                port: 80,
                handlers: ['http'],
              },
            ],
            protocol: 'tcp',
            internal_port: WRAPPER_PORT,
            autostop: 'off',
            autostart: false,
          },
        ],
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
   * Resolve the test runner path based on the sandbox image.
   * This is set as the TEST_RUNNER env var so the HTTP wrapper knows
   * which script to execute.
   */
  private getTestRunnerPath(image: string): string {
    const imageLower = image.toLowerCase();

    // Go sandbox uses a shell script
    if (imageLower.includes('go')) {
      return '/usr/local/bin/run_tests.sh';
    }

    // Python-based sandboxes
    if (imageLower.includes('python') || imageLower.includes('sql')) {
      return '/usr/local/bin/run_tests.py';
    }

    // Node-based sandboxes
    return '/usr/local/bin/run_tests.mjs';
  }

  private async waitForMachine(
    machineId: string,
    instanceId: string,
    targetState: 'started' | 'stopped',
    maxWaitSeconds: number
  ): Promise<void> {
    const url = `${this.config.apiHostname}/v1/apps/${this.config.appName}/machines/${machineId}/wait?state=${targetState}&timeout=${maxWaitSeconds}&instance_id=${instanceId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
      },
      signal: AbortSignal.timeout(maxWaitSeconds * 1000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 408) {
        throw new Error('Machine execution timed out');
      }
      throw new Error(`Failed to wait for machine: ${response.status} ${errorBody}`);
    }
  }

  private async deleteMachine(machineId: string): Promise<void> {
    // Stop the machine first (it's still running the HTTP server)
    const stopUrl = `${this.config.apiHostname}/v1/apps/${this.config.appName}/machines/${machineId}/stop`;
    await fetch(stopUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.config.apiToken}` },
    }).catch(() => {});

    // Then delete
    const deleteUrl = `${this.config.apiHostname}/v1/apps/${this.config.appName}/machines/${machineId}?force=true`;
    await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.config.apiToken}` },
    }).catch(() => {});
  }

  // ============================================================
  // Results fetching via HTTP
  // ============================================================

  /**
   * Poll the machine's HTTP endpoint until tests complete, then fetch results.
   * Uses Fly's proxy: https://{app_name}.fly.dev with fly-force-instance-id header.
   */
  private async fetchResults(machineId: string, timeoutSeconds: number): Promise<string> {
    const baseUrl = `https://${this.config.appName}.fly.dev`;
    const deadline = Date.now() + (timeoutSeconds + RESULT_FETCH_BUFFER_S) * 1000;

    // Poll /health until ready
    while (Date.now() < deadline) {
      try {
        const healthResponse = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          headers: {
            'fly-force-instance-id': machineId,
          },
          signal: AbortSignal.timeout(5000),
        });

        if (healthResponse.ok) {
          const health = (await healthResponse.json()) as { ready: boolean };
          if (health.ready) {
            break;
          }
        }
      } catch {
        // Transient network errors during polling are expected; retry on next iteration
      }

      await new Promise((resolve) => setTimeout(resolve, HEALTH_POLL_INTERVAL_MS));
    }

    if (Date.now() >= deadline) {
      throw new Error('TIMEOUT: Test execution exceeded time limit');
    }

    // Fetch results
    const resultsResponse = await fetch(`${baseUrl}/results`, {
      method: 'GET',
      headers: {
        'fly-force-instance-id': machineId,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!resultsResponse.ok) {
      throw new Error(`Failed to fetch results: ${resultsResponse.status}`);
    }

    return await resultsResponse.text();
  }

  // ============================================================
  // Output parsing
  // ============================================================

  private parseOutput(output: string): SandboxResult {
    // Try to parse the output directly as JSON first
    try {
      const parsed = JSON.parse(output.trim()) as SandboxResult;
      if (parsed.status && typeof parsed.tests_passed === 'number') {
        return parsed;
      }
    } catch {
      // Not direct JSON — try line-by-line
    }

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
      error_message: 'Could not parse test runner output',
      stderr: output.slice(0, 2000),
      tests_passed: 0,
      tests_failed: 0,
      tests_total: 0,
      execution_time_ms: 0,
      results: [],
    };
  }
}
