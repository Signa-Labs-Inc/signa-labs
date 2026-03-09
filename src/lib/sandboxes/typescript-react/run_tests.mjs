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
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const WORKSPACE = '/workspace';
const SUBMISSION_DIR = `${WORKSPACE}/submission`;
const TESTS_DIR = `${WORKSPACE}/tests`;
const SUPPORT_DIR = `${WORKSPACE}/support`;
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

/**
 * Check for package.json in submission, tests, or deps.json in workspace root.
 * Install packages if found. Returns error message on failure, null on success.
 */
function installDependencies() {
  const packagePaths = [
    `${SUBMISSION_DIR}/package.json`,
    `${TESTS_DIR}/package.json`,
    `${SUPPORT_DIR}/deps.json`,
    `${WORKSPACE}/deps.json`,
  ];

  let packageFile = null;
  for (const path of packagePaths) {
    if (existsSync(path)) {
      try {
        const content = readFileSync(path, 'utf-8').trim();
        if (content.length > 2) {
          packageFile = path;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  if (!packageFile) return null;

  try {
    const pkg = JSON.parse(readFileSync(packageFile, 'utf-8'));
    const deps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };

    const packages = Object.entries(deps)
      .map(([name, version]) => `${name}@${version}`)
      .filter((pkg) => {
        const pkgName = pkg.split('@')[0];
        try {
          require.resolve(pkgName);
          return false;
        } catch {
          return true;
        }
      });

    if (packages.length === 0) return null;

    // Install into /opt/sandbox (where node_modules lives) instead of /workspace.
    // /workspace/node_modules is a symlink to /opt/sandbox/node_modules — npm
    // destroys that symlink if we install with cwd /workspace, wiping all
    // pre-installed packages (react, vitest, testing-library, etc.).
    execSync(`npm install --no-save --no-audit --no-fund ${packages.join(' ')}`, {
      cwd: '/opt/sandbox',
      timeout: 60_000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        npm_config_loglevel: 'error',
      },
    });

    return null;
  } catch (err) {
    if (err.killed) {
      return 'Package installation timed out (60s limit)';
    }
    const stderr = err.stderr ?? err.message ?? String(err);
    return `Package installation failed: ${stderr.slice(0, 500)}`;
  }
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
    f.match(/\.(test|spec)\.(js|mjs|cjs|ts|mts|tsx|jsx)$/)
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

  // Install dependencies if package.json or deps.json exists
  const installError = installDependencies();
  if (installError) {
    return {
      status: 'error',
      error_type: 'dependency_error',
      error_message: installError,
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
      `npx vitest run --config /opt/sandbox/vitest.config.mjs --reporter=json --outputFile=${REPORT_PATH}`,
      {
        cwd: WORKSPACE,
        timeout: (MAX_EXECUTION_SECONDS + 5) * 1000,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          NODE_PATH: process.env.NODE_PATH || '',
        },
      }
    );
  } catch (err) {
    stdout = err.stdout ?? '';
    stderr = err.stderr ?? err.message ?? String(err);
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
    const assertions = suite.assertionResults ?? [];

    if (assertions.length === 0 && suite.message) {
      failed++;
      results.push({
        name: sanitizeOutput(suite.name ?? 'unknown suite'),
        passed: false,
        time_ms: 0,
        error: sanitizeOutput(suite.message),
      });
      continue;
    }

    for (const test of assertions) {
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