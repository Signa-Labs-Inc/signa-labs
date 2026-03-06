#!/usr/bin/env python3
"""
Executes pytest against user-submitted code and outputs structured JSON results.
This script is the entrypoint for the Python sandbox Fly Machine.

Expected filesystem layout (files injected via Fly Machines API):
  /workspace/submission/  - User's submitted .py files
  /workspace/tests/       - Exercise test files (e.g. test_solution.py)
  /workspace/support/     - Support files (helpers, fixtures, data files)
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path

WORKSPACE = Path("/workspace")
SUBMISSION_DIR = WORKSPACE / "submission"
TESTS_DIR = WORKSPACE / "tests"
SUPPORT_DIR = WORKSPACE / "support"
REPORT_PATH = WORKSPACE / ".report.json"

MAX_EXECUTION_SECONDS = int(os.environ.get("MAX_EXECUTION_SECONDS", "30"))


def run_tests() -> dict:
    """Run pytest and return structured results."""
    start_time = time.time()

    # Ensure all directories exist
    for d in [SUBMISSION_DIR, TESTS_DIR, SUPPORT_DIR]:
        d.mkdir(parents=True, exist_ok=True)

    # Verify test files exist
    test_files = list(TESTS_DIR.glob("*.py"))
    if not test_files:
        return {
            "status": "error",
            "error_type": "configuration_error",
            "error_message": "No test files found in /workspace/tests/",
            "tests_passed": 0,
            "tests_failed": 0,
            "tests_total": 0,
            "execution_time_ms": _elapsed_ms(start_time),
            "results": [],
        }

    # Build PYTHONPATH so test files can import from submission and support dirs
    python_path_parts = [
        str(SUBMISSION_DIR),
        str(SUPPORT_DIR),
        str(WORKSPACE),
    ]
    env = os.environ.copy()
    env["PYTHONPATH"] = ":".join(python_path_parts)

    # Run pytest with JSON report
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        str(TESTS_DIR),
        f"--timeout={MAX_EXECUTION_SECONDS}",
        "--tb=short",
        "--no-header",
        "-q",
        f"--json-report-file={REPORT_PATH}",
        "--json-report",
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=MAX_EXECUTION_SECONDS + 5,  # Buffer beyond pytest's own timeout
            env=env,
            cwd=str(WORKSPACE),
        )
    except subprocess.TimeoutExpired:
        return {
            "status": "error",
            "error_type": "timeout",
            "error_message": f"Execution exceeded {MAX_EXECUTION_SECONDS}s time limit",
            "tests_passed": 0,
            "tests_failed": 0,
            "tests_total": 0,
            "execution_time_ms": _elapsed_ms(start_time),
            "results": [],
        }

    # Parse the JSON report if it exists
    if REPORT_PATH.exists():
        try:
            report = json.loads(REPORT_PATH.read_text())
            return _parse_pytest_report(report, start_time)
        except (json.JSONDecodeError, KeyError) as e:
            # Fall through to stderr-based error handling
            pass

    # If no report, check for import/syntax errors in stderr
    stderr = result.stderr.strip()
    stdout = result.stdout.strip()

    if result.returncode != 0 and not REPORT_PATH.exists():
        # Likely a syntax error or import error that prevented pytest from running
        error_output = stderr or stdout
        return {
            "status": "error",
            "error_type": _classify_error(error_output),
            "error_message": _sanitize_output(error_output),
            "stderr": _sanitize_output(stderr),
            "tests_passed": 0,
            "tests_failed": 0,
            "tests_total": 0,
            "execution_time_ms": _elapsed_ms(start_time),
            "results": [],
        }

    # Fallback: should not reach here normally
    return {
        "status": "error",
        "error_type": "unknown_error",
        "error_message": "Test runner completed but could not parse results",
        "stderr": _sanitize_output(stderr),
        "tests_passed": 0,
        "tests_failed": 0,
        "tests_total": 0,
        "execution_time_ms": _elapsed_ms(start_time),
        "results": [],
    }


def _parse_pytest_report(report: dict, start_time: float) -> dict:
    """Parse pytest-json-report output into CodeForge's result format."""
    tests = report.get("tests", [])
    results = []
    passed = 0
    failed = 0

    for test in tests:
        test_name = test.get("nodeid", "unknown")
        # Clean up node ID to be more readable: "tests/test_solution.py::test_name" -> "test_name"
        if "::" in test_name:
            test_name = test_name.split("::")[-1]

        outcome = test.get("outcome", "failed")
        is_passed = outcome == "passed"

        if is_passed:
            passed += 1
        else:
            failed += 1

        test_result = {
            "name": test_name,
            "passed": is_passed,
            "time_ms": int((test.get("duration", 0)) * 1000),
        }

        # Add failure details if test failed
        if not is_passed:
            call_info = test.get("call", {})
            longrepr = call_info.get("longrepr", "")
            crash = call_info.get("crash", {})

            test_result["error"] = _sanitize_output(crash.get("message", str(longrepr)))

            # Try to extract expected/actual from assertion messages
            expected, actual = _extract_assertion_values(str(longrepr))
            if expected is not None:
                test_result["expected"] = expected
            if actual is not None:
                test_result["actual"] = actual

        results.append(test_result)

    total = passed + failed

    return {
        "status": "completed",
        "tests_passed": passed,
        "tests_failed": failed,
        "tests_total": total,
        "execution_time_ms": _elapsed_ms(start_time),
        "results": results,
    }


def _extract_assertion_values(longrepr: str) -> tuple:
    """Try to extract expected and actual values from pytest assertion output."""
    expected = None
    actual = None

    lines = longrepr.split("\n")
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("assert ") or stripped.startswith("AssertionError:"):
            # Common patterns: "assert X == Y", "AssertionError: assert X == Y"
            if " == " in stripped:
                parts = stripped.split(" == ", 1)
                if len(parts) == 2:
                    actual = parts[0].split("assert ")[-1].strip()
                    expected = parts[1].strip()
            elif " != " in stripped:
                parts = stripped.split(" != ", 1)
                if len(parts) == 2:
                    actual = parts[0].split("assert ")[-1].strip()
                    expected = f"not {parts[1].strip()}"

    return expected, actual


def _classify_error(output: str) -> str:
    """Classify an error based on its output."""
    output_lower = output.lower()
    if "syntaxerror" in output_lower:
        return "syntax_error"
    if "importerror" in output_lower or "modulenotfounderror" in output_lower:
        return "import_error"
    if "nameerror" in output_lower:
        return "name_error"
    if "typeerror" in output_lower:
        return "type_error"
    if "timeout" in output_lower:
        return "timeout"
    return "runtime_error"


def _sanitize_output(text: str) -> str:
    """Remove system paths and container-specific info from output."""
    if not text:
        return ""
    # Remove absolute paths that reveal container structure
    sanitized = text.replace("/workspace/submission/", "")
    sanitized = sanitized.replace("/workspace/tests/", "tests/")
    sanitized = sanitized.replace("/workspace/support/", "")
    sanitized = sanitized.replace("/workspace/", "")
    sanitized = sanitized.replace("/usr/local/lib/python3.12/", "<stdlib>/")
    sanitized = sanitized.replace("/home/runner/", "")
    return sanitized.strip()


def _elapsed_ms(start_time: float) -> int:
    """Calculate elapsed time in milliseconds."""
    return int((time.time() - start_time) * 1000)


if __name__ == "__main__":
    try:
        output = run_tests()
    except Exception as e:
        output = {
            "status": "error",
            "error_type": "runner_error",
            "error_message": f"Test runner crashed: {str(e)}",
            "tests_passed": 0,
            "tests_failed": 0,
            "tests_total": 0,
            "execution_time_ms": 0,
            "results": [],
        }

    # Output ONLY valid JSON to stdout — this is the contract
    print(json.dumps(output))
