/**
 * LocalExecutionClient
 *
 * Runs sandbox containers locally via Docker for development and testing.
 * This is the default execution mode — no Fly.io account needed.
 *
 * Behavior mirrors what the FlyExecutionClient does in production:
 *   1. Creates a Docker container from the sandbox image
 *   2. Mounts user code + test files into the container
 *   3. Runs the test runner entrypoint
 *   4. Captures JSON output from stdout
 *   5. Parses and returns structured results
 *
 * Instead of using the Fly Machines files API, this client writes files
 * to a temporary directory and bind-mounts them into the container.
 */

import { execFile } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'fs';
import { join, dirname, resolve, sep } from 'path';
import { tmpdir } from 'os';
import type {
  ExecutionClient,
  ExecutionRequest,
  ExecutionResponse,
  SandboxFile,
  SandboxResult,
} from './types';

/** Map language to local Docker image name (built by build-sandboxes.sh) */
const LOCAL_IMAGE_MAP: Record<string, string> = {
  python: 'signa-labs-sandbox-python:latest',
  javascript: 'signa-labs-sandbox-javascript:latest',
  typescript: 'signa-labs-sandbox-typescript:latest',
  sql: 'signa-labs-sandbox-sql:latest',
  go: 'signa-labs-sandbox-go:latest',
  'javascript-react': 'signa-labs-sandbox-javascript-react:latest',
  'typescript-react': 'signa-labs-sandbox-typescript-react:latest',
  'typescript-express': 'signa-labs-sandbox-typescript-express:latest',
  'python-web': 'signa-labs-sandbox-python-web:latest',
  'python-data-science': 'signa-labs-sandbox-python-data-science:latest',
  'python-bio': 'signa-labs-sandbox-python-bio:latest',
};

export class LocalExecutionClient implements ExecutionClient {
  async executeSubmission(request: ExecutionRequest): Promise<ExecutionResponse> {
    const startTime = Date.now();
    const workDir = mkdtempSync(join(tmpdir(), 'codeforge-'));

    try {
      // Create workspace directories and write files
      const submissionDir = join(workDir, 'submission');
      const testsDir = join(workDir, 'tests');
      const supportDir = join(workDir, 'support');

      mkdirSync(submissionDir, { recursive: true });
      mkdirSync(testsDir, { recursive: true });
      mkdirSync(supportDir, { recursive: true });

      this.writeFiles(submissionDir, request.submissionFiles);
      this.writeFiles(testsDir, request.testFiles);
      if (request.supportFiles?.length) {
        this.writeFiles(supportDir, request.supportFiles);
      }

      // Resolve the Docker image
      const image = this.resolveLocalImage(request.image, request.language);

      // Build docker run command
      const memoryMb = request.memoryMb || 256;
      const dockerArgs = [
        'docker',
        'run',
        '--rm',
        '--network',
        'none',
        '--memory',
        `${memoryMb}m`,
        '--cpus',
        '0.5',
        '-e',
        `MAX_EXECUTION_SECONDS=${request.timeoutSeconds}`,
        '-v',
        `${submissionDir}:/workspace/submission:ro`,
        '-v',
        `${testsDir}:/workspace/tests:ro`,
        '-v',
        `${supportDir}:/workspace/support:ro`,
        image,
      ];

      // Execute with timeout (buffer beyond the sandbox's own timeout)
      const containerTimeout = (request.timeoutSeconds + 10) * 1000;
      const [command, ...args] = dockerArgs;
      const output = await this.runCommand(command, args, containerTimeout);

      // Parse the JSON output
      const result = this.parseOutput(output);

      return {
        success: true,
        result,
        error: null,
        totalDurationMs: Date.now() - startTime,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);

      // Check if it's a timeout
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
        error: `Local execution failed: ${error}`,
        totalDurationMs: Date.now() - startTime,
      };
    } finally {
      // Clean up temp directory
      try {
        rmSync(workDir, { recursive: true, force: true });
      } catch {
        // Best effort cleanup
      }
    }
  }

  private writeFiles(dir: string, files: SandboxFile[]): void {
    const resolvedDir = resolve(dir);
    for (const file of files) {
      const resolvedPath = resolve(dir, file.filePath);
      if (!resolvedPath.startsWith(resolvedDir + sep) && resolvedPath !== resolvedDir) {
        throw new Error(`Path traversal detected: ${file.filePath}`);
      }
      mkdirSync(dirname(resolvedPath), { recursive: true });
      writeFileSync(resolvedPath, file.content, 'utf-8');
    }
  }

  private runCommand(command: string, args: string[], timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(
        command,
        args,
        { timeout: timeoutMs, maxBuffer: 5 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            // Docker run exits non-zero when the container process exits non-zero.
            // Our test runners always exit 0, so a non-zero exit means Docker itself failed.
            // However, some test runners might output JSON to stdout even on error.
            if (stdout.trim()) {
              resolve(stdout.trim());
            } else {
              reject(new Error(stderr.trim() || error.message));
            }
          } else {
            resolve(stdout.trim());
          }
        }
      );
    });
  }

  private resolveLocalImage(registryImage: string, language: string): string {
    // Extract sandbox name from the Fly registry image path
    // e.g. "registry.fly.io/codeforge-sandboxes:sandbox-typescript-react" -> "typescript-react"
    const tagMatch = registryImage.match(/:sandbox-(.+)$/);
    if (tagMatch) {
      const sandboxName = tagMatch[1];
      if (LOCAL_IMAGE_MAP[sandboxName]) {
        return LOCAL_IMAGE_MAP[sandboxName];
      }
    }

    // Fall back to language-based lookup
    return LOCAL_IMAGE_MAP[language] || registryImage;
  }

  private parseOutput(output: string): SandboxResult {
    // The test runner should output exactly one line of JSON.
    // But stderr might leak into the output, so find the JSON line.
    const lines = output.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed) as SandboxResult;
          // Basic validation
          if (parsed.status && typeof parsed.tests_passed === 'number') {
            return parsed;
          }
        } catch {
          continue;
        }
      }
    }

    // If no valid JSON found, return an error result
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
