#!/bin/bash
set -euo pipefail

# Test CodeForge sandbox images locally with sample exercises
# This simulates what the FlyExecutionClient will do in production:
#   1. Mount user code + test files into the container
#   2. Run the container
#   3. Capture JSON output from stdout
#
# Usage: ./scripts/test-sandboxes.sh [language]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SANDBOXES_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FIXTURES_DIR="$SANDBOXES_DIR/__fixtures__"

IMAGE_PREFIX="signa-labs-sandbox"
PASS_COUNT=0
FAIL_COUNT=0

run_test() {
  local lang="$1"
  local test_name="$2"
  local fixture_dir="$FIXTURES_DIR/$lang/$test_name"
  local image="$IMAGE_PREFIX-$lang:latest"

  echo ""
  echo "--- Testing: $lang / $test_name ---"

  if [ ! -d "$fixture_dir" ]; then
    echo "  SKIP: No fixture directory at $fixture_dir"
    return
  fi

  # Build volume mount args
  local docker_args=()
  
  if [ -d "$fixture_dir/submission" ]; then
    docker_args+=(-v "$fixture_dir/submission:/workspace/submission:ro")
  fi
  if [ -d "$fixture_dir/tests" ]; then
    docker_args+=(-v "$fixture_dir/tests:/workspace/tests:ro")
  fi
  if [ -d "$fixture_dir/support" ]; then
    docker_args+=(-v "$fixture_dir/support:/workspace/support:ro")
  fi

  # Run the container and capture output
  local output
  output=$(docker run --rm \
    --network none \
    --memory 256m \
    --cpus 0.5 \
    -e MAX_EXECUTION_SECONDS=10 \
    ${docker_args[@]+"${docker_args[@]}"} \
    "$image" 2>&1) || true

  # Validate JSON output
  if echo "$output" | python3 -m json.tool &>/dev/null; then
    local status
    status=$(echo "$output" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")
    local tests_passed
    tests_passed=$(echo "$output" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tests_passed', 0))")
    local tests_total
    tests_total=$(echo "$output" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tests_total', 0))")

    # Check expected outcome if specified
    local expected_file="$fixture_dir/expected.json"
    if [ -f "$expected_file" ]; then
      local expected_status
      expected_status=$(python3 -c "import json; print(json.load(open('$expected_file'))['status'])")
      local expected_passing
      expected_passing=$(python3 -c "import json; print(json.load(open('$expected_file')).get('tests_passed', 0))")

      if [ "$status" = "$expected_status" ] && [ "$tests_passed" = "$expected_passing" ]; then
        echo "  ✓ PASS — status=$status, passed=$tests_passed/$tests_total"
        PASS_COUNT=$((PASS_COUNT + 1))
      else
        echo "  ✗ FAIL — expected status=$expected_status passed=$expected_passing, got status=$status passed=$tests_passed"
        echo "  Output: $output"
        FAIL_COUNT=$((FAIL_COUNT + 1))
      fi
    else
      echo "  ✓ PASS (no expected.json) — status=$status, passed=$tests_passed/$tests_total"
      echo "  Output: $output"
      PASS_COUNT=$((PASS_COUNT + 1))
    fi
  else
    echo "  ✗ FAIL — Output is not valid JSON:"
    echo "  $output"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

LANGUAGES=(
  "python"
  "javascript"
  "typescript"
  "sql"
  "go"
  "javascript-react"
  "typescript-react"
  "typescript-express"
  "python-web"
  "python-data-science"
  "python-bio"
)

if [ $# -gt 0 ]; then
  LANGUAGES=("$1")
fi

# Build images first (only the selected languages)
echo "Building sandbox images..."
for lang in "${LANGUAGES[@]}"; do
  "$SCRIPT_DIR/build-sandboxes.sh" "$lang"
done
echo "Images built."

for lang in "${LANGUAGES[@]}"; do
  echo ""
  echo "=========================================="
  echo "Testing $lang sandbox"
  echo "=========================================="

  # Run each fixture test case
  if [ -d "$FIXTURES_DIR/$lang" ]; then
    for test_dir in "$FIXTURES_DIR/$lang"/*/; do
      test_name=$(basename "$test_dir")
      run_test "$lang" "$test_name"
    done
  else
    echo "  No fixtures found at $FIXTURES_DIR/$lang"
  fi
done

echo ""
echo "=========================================="
echo "Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi