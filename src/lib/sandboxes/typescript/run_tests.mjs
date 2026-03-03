#!/usr/bin/env node
/**
 * Executes vitest against user-submitted code and outputs structured JSON results.
 * This script is the entrypoint for the JavaScript/TypeScript sandbox container.
 *
 * Expected filesystem layout:
 *   /workspace/submission/  - User's submitted files
 *   /workspace/tests/       - Exercise test files (e.g. solution.test.js)
 *   /workspace/support/     - Support files (helpers, data files)
 *   /workspace/vitest.config.mjs - Vitest configuration
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const WORKSPACE = '/workspace';
const TESTS_DIR = `${WORKSPACE}/tests`;
const REPORT_PATH = `${WORKSPACE}/.report.json`;
const MAX_EXECUTION_SECONDS = parseInt(process.env.MAX_EXECUTION_SECONDS || '30', 10);

function elapsedMs(start) {
  return Math.round(performance.now() - start);
}

function sanitizeOutput(text) {
  if (!text) return '';
  return text
    .replace(/\/workspace\/submission\//g, '')
    .replace(/\/workspace\/tests\//g, 'tests/')
    .replace(/\/workspace\/support\//g, '')
    .replace(/\/workspace\//g, '')
    .trim();
}

function classifyError(output) {
  const lower = output.toLowerCase();
  if (lower.includes('syntaxerror')) return 'syntax_error';
  if (lower.includes('referenceerror')) return 'reference_error';
  if (lower.includes('typeerror')) return 'type_error';
  if (lower.includes('cannot find module') || lower.includes('module not found'))
    return 'import_error';
  if (lower.includes('timeout')) return 'timeout';
  return 'runtime_error';
}

function runTests() {
  const start = performance.now();

  // Verify test files exist
  if (!existsSync(TESTS_DIR)) {
    return {
      status: 'error',
      error_type: 'configuration_error',
      error_message: 'No tests directory found at /workspace/tests/',
      tests_passed: 0,
      tests_failed: 0,
      tests_total: 0,
      execution_time_ms: elapsedMs(start),
      results: [],
    };
  }

  const testFiles = readdirSync(TESTS_DIR).filter((f) =>
    f.match(/\.(test|spec)\.(js|mjs|cjs|ts|mts)$/)
  );

  if (testFiles.length === 0) {
    return {
      status: 'error',
      error_type: 'configuration_error',
      error_message: 'No test files found in /workspace/tests/',
      tests_passed: 0,
      tests_failed: 0,
      tests_total: 0,
      execution_time_ms: elapsedMs(start),
      results: [],
    };
  }

  // Run vitest
  let stdout = '';
  let stderr = '';

  try {
    stdout = execSync(
      `vitest run --config ${WORKSPACE}/vitest.config.mjs --reporter=json --outputFile=${REPORT_PATH}`,
      {
        cwd: WORKSPACE,
        timeout: (MAX_EXECUTION_SECONDS + 5) * 1000,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_PATH: '/usr/local/lib/node_modules' },
      }
    );
  } catch (err) {
    stdout = err.stdout ?? '';
    stderr = err.stderr ?? '';
  }

  // Parse the JSON report if it exists
  if (existsSync(REPORT_PATH)) {
    try {
      const report = JSON.parse(readFileSync(REPORT_PATH, 'utf-8'));
      return parseVitestReport(report, start);
    } catch {
      // Fall through to error handling
    }
  }

  // No report generated — likely a syntax/import error
  const errorOutput = stderr || stdout;
  return {
    status: 'error',
    error_type: classifyError(errorOutput),
    error_message: sanitizeOutput(errorOutput),
    stderr: sanitizeOutput(stderr),
    tests_passed: 0,
    tests_failed: 0,
    tests_total: 0,
    execution_time_ms: elapsedMs(start),
    results: [],
  };
}

function parseVitestReport(report, start) {
  const testResults = report.testResults ?? [];
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const suite of testResults) {
    for (const test of suite.assertionResults ?? []) {
      const isPassed = test.status === 'passed';
      if (isPassed) passed++;
      else failed++;

      const result = {
        name: test.title ?? test.fullName ?? 'unknown',
        passed: isPassed,
        time_ms: Math.round(test.duration ?? 0),
      };

      if (!isPassed) {
        const messages = test.failureMessages ?? [];
        result.error = sanitizeOutput(messages.join('\n'));
      }

      results.push(result);
    }
  }

  const total = passed + failed;

  return {
    status: 'completed',
    tests_passed: passed,
    tests_failed: failed,
    tests_total: total,
    execution_time_ms: elapsedMs(start),
    results,
  };
}

// Main
try {
  const output = runTests();
  console.log(JSON.stringify(output));
} catch (err) {
  console.log(
    JSON.stringify({
      status: 'error',
      error_type: 'runner_error',
      error_message: `Test runner crashed: ${err.message}`,
      tests_passed: 0,
      tests_failed: 0,
      tests_total: 0,
      execution_time_ms: 0,
      results: [],
    })
  );
}
