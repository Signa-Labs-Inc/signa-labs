/**
 * HTTP Wrapper for Node.js Sandbox Images
 *
 * Replaces the direct test runner CMD. This script:
 *   1. Starts an HTTP server on port 8080
 *   2. Spawns the original test runner as an async child process
 *   3. Captures its stdout (the JSON test results)
 *   4. Serves the results at GET /results
 *   5. Serves readiness at GET /health
 *
 * IMPORTANT: Tests run via async exec (not execSync) so the event loop
 * stays free to serve HTTP requests while vitest is running.
 */

const http = require('http');
const { exec } = require('child_process');
const path = require('path');

const PORT = parseInt(process.env.WRAPPER_PORT || '8080', 10);
const TEST_RUNNER = process.env.TEST_RUNNER || '/workspace/run_tests.mjs';
const MAX_EXECUTION_SECONDS = parseInt(process.env.MAX_EXECUTION_SECONDS || '30', 10);

let results = null;
let done = false;

function log(msg) {
  process.stderr.write(`[http-wrapper] ${msg}\n`);
}

function runTests() {
  const ext = path.extname(TEST_RUNNER);
  let cmd;

  if (ext === '.mjs' || ext === '.js') {
    cmd = `node ${TEST_RUNNER}`;
  } else if (ext === '.sh') {
    cmd = `bash ${TEST_RUNNER}`;
  } else {
    cmd = TEST_RUNNER;
  }

  log(`Running: ${cmd} (timeout: ${MAX_EXECUTION_SECONDS}s)`);

  exec(
    cmd,
    {
      timeout: MAX_EXECUTION_SECONDS * 1000,
      encoding: 'utf-8',
      env: {
        ...process.env,
        MAX_EXECUTION_SECONDS: String(MAX_EXECUTION_SECONDS),
      },
    },
    (err, stdout, stderr) => {
      log(`exec callback: err=${!!err}, stdout=${stdout?.length || 0}b, stderr=${stderr?.length || 0}b`);

      if (stdout && stdout.trim()) {
        results = stdout.trim();
      } else if (err && err.stdout && err.stdout.trim()) {
        results = err.stdout.trim();
      } else {
        const error = stderr ? stderr.trim() : err ? err.message : 'Test runner failed with no output';
        log(`Test runner error: ${error.slice(0, 500)}`);
        results = JSON.stringify({
          status: 'error',
          error_type: 'runner_error',
          error_message: (error || 'Test runner failed with no output').slice(0, 2000),
          tests_passed: 0,
          tests_failed: 0,
          tests_total: 0,
          execution_time_ms: 0,
          results: [],
        });
      }
      done = true;
      log('Tests complete, done=true');
    }
  );
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ready: done }));
    return;
  }

  if (req.method === 'GET' && req.url === '/results') {
    if (!done) {
      res.writeHead(202, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'running' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(results || JSON.stringify({
      status: 'error',
      error_type: 'runner_error',
      error_message: 'Test runner produced no results',
      tests_passed: 0,
      tests_failed: 0,
      tests_total: 0,
      execution_time_ms: 0,
      results: [],
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  log(`Listening on 0.0.0.0:${PORT}`);
  runTests();
});

// Safety exit: kill the process after 5 minutes if the client fails to clean up
setTimeout(
  () => {
    process.exit(0);
  },
  5 * 60 * 1000
);
