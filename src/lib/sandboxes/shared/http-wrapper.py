#!/usr/bin/env python3
"""
HTTP Wrapper for Python Sandbox Images

Replaces the direct test runner CMD. This script:
  1. Starts an HTTP server on port 8080
  2. Spawns the original test runner in a background thread
  3. Captures its stdout (the JSON test results)
  4. Serves the results at GET /results
  5. Serves readiness at GET /health
"""

import http.server
import json
import os
import subprocess
import sys
import threading

PORT = int(os.environ.get("WRAPPER_PORT", "8080"))
TEST_RUNNER = os.environ.get("TEST_RUNNER", "/workspace/run_tests.py")
MAX_EXECUTION_SECONDS = int(os.environ.get("MAX_EXECUTION_SECONDS", "30"))

# Safety exit: kill the process after 5 minutes if the client fails to clean up
AUTO_EXIT_SECONDS = 5 * 60

results = None
done = False
lock = threading.Lock()


def run_tests():
    global results, done

    try:
        ext = os.path.splitext(TEST_RUNNER)[1]

        if ext == ".py":
            cmd = [sys.executable, TEST_RUNNER]
        elif ext == ".sh":
            cmd = ["bash", TEST_RUNNER]
        else:
            cmd = [TEST_RUNNER]

        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=MAX_EXECUTION_SECONDS,
            env={**os.environ, "MAX_EXECUTION_SECONDS": str(MAX_EXECUTION_SECONDS)},
        )

        output = proc.stdout.strip()

        if output:
            with lock:
                results = output
                done = True
        else:
            error_msg = (
                proc.stderr.strip() if proc.stderr else "Test runner produced no output"
            )
            with lock:
                results = json.dumps(
                    {
                        "status": "error",
                        "error_type": "runner_error",
                        "error_message": error_msg[:2000],
                        "tests_passed": 0,
                        "tests_failed": 0,
                        "tests_total": 0,
                        "execution_time_ms": 0,
                        "results": [],
                    }
                )
                done = True

    except subprocess.TimeoutExpired:
        with lock:
            results = json.dumps(
                {
                    "status": "error",
                    "error_type": "timeout",
                    "error_message": f"Execution exceeded {MAX_EXECUTION_SECONDS}s time limit",
                    "tests_passed": 0,
                    "tests_failed": 0,
                    "tests_total": 0,
                    "execution_time_ms": MAX_EXECUTION_SECONDS * 1000,
                    "results": [],
                }
            )
            done = True

    except Exception as e:
        with lock:
            results = json.dumps(
                {
                    "status": "error",
                    "error_type": "runner_error",
                    "error_message": str(e)[:2000],
                    "tests_passed": 0,
                    "tests_failed": 0,
                    "tests_total": 0,
                    "execution_time_ms": 0,
                    "results": [],
                }
            )
            done = True


class ResultsHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            with lock:
                self.wfile.write(json.dumps({"ready": done}).encode())
            return

        if self.path == "/results":
            with lock:
                if not done:
                    self.send_response(202)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "running"}).encode())
                    return

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(results.encode() if results else b"{}")
            return

        self.send_response(404)
        self.end_headers()
        self.wfile.write(b"Not found")

    def log_message(self, format, *args):
        pass


def auto_exit():
    """Safety timer: exit after AUTO_EXIT_SECONDS if the machine isn't cleaned up."""
    threading.Event().wait(AUTO_EXIT_SECONDS)
    os._exit(0)


def main():
    server = http.server.HTTPServer(("0.0.0.0", PORT), ResultsHandler)

    # Start safety exit timer
    exit_thread = threading.Thread(target=auto_exit, daemon=True)
    exit_thread.start()

    test_thread = threading.Thread(target=run_tests, daemon=True)
    test_thread.start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
