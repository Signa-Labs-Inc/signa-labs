#!/bin/bash
set -e

# CodeForge Go Test Runner
#
# Runs `go test` against user-submitted code and converts the output
# to the structured JSON format expected by the CodeForge pipeline.
#
# Expected layout:
#   /workspace/submission/  - User's .go files
#   /workspace/tests/       - Test files (*_test.go)
#   /workspace/support/     - Support/helper files

MAX_EXECUTION_SECONDS="${MAX_EXECUTION_SECONDS:-30}"
START_TIME=$(date +%s%N)

elapsed_ms() {
  local now=$(date +%s%N)
  echo $(( (now - START_TIME) / 1000000 ))
}

output_json() {
  echo "$1"
  exit 0
}

# Set up a temporary Go module workspace
WORKDIR="/workspace/run"
mkdir -p "$WORKDIR"

# Initialize a Go module
cd "$WORKDIR"
go mod init codeforge-exercise > /dev/null 2>&1

# Copy all files into the module directory
cp /workspace/submission/*.go "$WORKDIR/" 2>/dev/null || true
cp /workspace/tests/*.go "$WORKDIR/" 2>/dev/null || true
cp /workspace/support/*.go "$WORKDIR/" 2>/dev/null || true

# Check if test files exist
TEST_FILES=$(find "$WORKDIR" -name "*_test.go" -type f 2>/dev/null)
if [ -z "$TEST_FILES" ]; then
  output_json "{\"status\":\"error\",\"error_type\":\"configuration_error\",\"error_message\":\"No test files found\",\"tests_passed\":0,\"tests_failed\":0,\"tests_total\":0,\"execution_time_ms\":$(elapsed_ms),\"results\":[]}"
fi

# Run go test with JSON output
TEST_OUTPUT=$(timeout "${MAX_EXECUTION_SECONDS}s" go test -v -json -timeout "${MAX_EXECUTION_SECONDS}s" ./... 2>&1) || true

# Check for timeout
if [ $? -eq 124 ]; then
  output_json "{\"status\":\"error\",\"error_type\":\"timeout\",\"error_message\":\"Execution exceeded ${MAX_EXECUTION_SECONDS}s time limit\",\"tests_passed\":0,\"tests_failed\":0,\"tests_total\":0,\"execution_time_ms\":$(elapsed_ms),\"results\":[]}"
fi

# Check for compilation errors (no JSON output means compile failed)
if ! echo "$TEST_OUTPUT" | head -1 | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
  # Not JSON — likely a compilation error
  # Sanitize the output
  CLEAN_OUTPUT=$(echo "$TEST_OUTPUT" | sed 's|/workspace/run/||g' | sed 's|/workspace/||g' | head -20)
  ESCAPED=$(echo "$CLEAN_OUTPUT" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")
  output_json "{\"status\":\"error\",\"error_type\":\"syntax_error\",\"error_message\":${ESCAPED},\"tests_passed\":0,\"tests_failed\":0,\"tests_total\":0,\"execution_time_ms\":$(elapsed_ms),\"results\":[]}"
fi

# Parse go test -json output into CodeForge format
python3 -c "
import json
import sys

lines = '''${TEST_OUTPUT}'''.strip().split('\n')

tests = {}
passed = 0
failed = 0

for line in lines:
    line = line.strip()
    if not line:
        continue
    try:
        event = json.loads(line)
    except json.JSONDecodeError:
        continue

    action = event.get('Action', '')
    test_name = event.get('Test', '')
    
    if not test_name:
        continue

    if action == 'run':
        tests[test_name] = {'name': test_name, 'passed': False, 'time_ms': 0}
    elif action == 'pass':
        if test_name in tests:
            tests[test_name]['passed'] = True
            tests[test_name]['time_ms'] = int(event.get('Elapsed', 0) * 1000)
            passed += 1
    elif action == 'fail':
        if test_name in tests:
            tests[test_name]['passed'] = False
            tests[test_name]['time_ms'] = int(event.get('Elapsed', 0) * 1000)
            failed += 1
    elif action == 'output' and test_name in tests and not tests[test_name].get('passed', False):
        output_text = event.get('Output', '').strip()
        if output_text and not output_text.startswith('===') and not output_text.startswith('---'):
            existing = tests[test_name].get('error', '')
            tests[test_name]['error'] = (existing + '\n' + output_text).strip()

results = list(tests.values())
total = passed + failed

# Clean error messages
for r in results:
    if 'error' in r:
        r['error'] = r['error'].replace('/workspace/run/', '').replace('/workspace/', '')[:2000]

output = {
    'status': 'completed',
    'tests_passed': passed,
    'tests_failed': failed,
    'tests_total': total,
    'execution_time_ms': $(elapsed_ms),
    'results': results,
}

print(json.dumps(output))
" 2>/dev/null

# If python parsing failed, return a generic error
if [ $? -ne 0 ]; then
  output_json "{\"status\":\"error\",\"error_type\":\"parse_error\",\"error_message\":\"Failed to parse test output\",\"tests_passed\":0,\"tests_failed\":0,\"tests_total\":0,\"execution_time_ms\":$(elapsed_ms),\"results\":[]}"
fi