/**
 * Integration test for the LocalExecutionClient.
 *
 * Run with: npx tsx lib/sandboxes/__tests__/local-execution-client.test.ts
 *
 * Prerequisites: Docker running + sandbox images built (./scripts/build-sandboxes.sh)
 */

import { LocalExecutionClient } from '../local-execution-client';
import type { ExecutionRequest } from '../types';

const client = new LocalExecutionClient();

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err instanceof Error ? err.message : err}`);
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// ============================================================
// Tests
// ============================================================

async function main() {
  console.log('\nLocalExecutionClient Integration Tests\n');

  // ---- Python ----
  console.log('Python:');

  await test('passing solution returns all tests passed', async () => {
    const request: ExecutionRequest = {
      image: 'codeforge-sandbox-python:latest',
      language: 'python',
      submissionFiles: [
        {
          filePath: 'solution.py',
          content: `
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
        },
      ],
      testFiles: [
        {
          filePath: 'test_solution.py',
          content: `
from solution import two_sum

def test_basic():
    assert two_sum([2, 7, 11, 15], 9) == [0, 1]

def test_middle():
    assert two_sum([3, 2, 4], 6) == [1, 2]
`,
        },
      ],
      timeoutSeconds: 10,
    };

    const response = await client.executeSubmission(request);
    assert(response.success, `Expected success, got error: ${response.error}`);
    assert(response.result !== null, 'Expected result to be non-null');
    assert(
      response.result!.status === 'completed',
      `Expected completed, got ${response.result!.status}`
    );
    assert(
      response.result!.tests_passed === 2,
      `Expected 2 passed, got ${response.result!.tests_passed}`
    );
    assert(
      response.result!.tests_failed === 0,
      `Expected 0 failed, got ${response.result!.tests_failed}`
    );
  });

  await test('failing solution returns correct pass/fail counts', async () => {
    const request: ExecutionRequest = {
      image: 'codeforge-sandbox-python:latest',
      language: 'python',
      submissionFiles: [
        {
          filePath: 'solution.py',
          content: `
def two_sum(nums, target):
    return [0, 1]  # wrong
`,
        },
      ],
      testFiles: [
        {
          filePath: 'test_solution.py',
          content: `
from solution import two_sum

def test_basic():
    assert two_sum([2, 7, 11, 15], 9) == [0, 1]

def test_middle():
    assert two_sum([3, 2, 4], 6) == [1, 2]
`,
        },
      ],
      timeoutSeconds: 10,
    };

    const response = await client.executeSubmission(request);
    assert(response.success, `Expected success, got error: ${response.error}`);
    assert(
      response.result!.status === 'completed',
      `Expected completed, got ${response.result!.status}`
    );
    assert(
      response.result!.tests_passed === 1,
      `Expected 1 passed, got ${response.result!.tests_passed}`
    );
    assert(
      response.result!.tests_failed === 1,
      `Expected 1 failed, got ${response.result!.tests_failed}`
    );
  });

  await test('syntax error returns error status', async () => {
    const request: ExecutionRequest = {
      image: 'codeforge-sandbox-python:latest',
      language: 'python',
      submissionFiles: [
        {
          filePath: 'solution.py',
          content: `
def two_sum(nums, target)
    return []
`,
        },
      ],
      testFiles: [
        {
          filePath: 'test_solution.py',
          content: `
from solution import two_sum

def test_basic():
    assert two_sum([2, 7, 11, 15], 9) == [0, 1]
`,
        },
      ],
      timeoutSeconds: 10,
    };

    const response = await client.executeSubmission(request);
    assert(response.success, `Expected success, got error: ${response.error}`);
    assert(response.result !== null, 'Expected result to be non-null');
    assert(
      response.result!.tests_passed === 0,
      `Expected 0 passed, got ${response.result!.tests_passed}`
    );
    assert(
      response.result!.tests_total === 0,
      `Expected 0 total, got ${response.result!.tests_total}`
    );
  });

  // ---- JavaScript ----
  console.log('\nJavaScript:');

  await test('passing solution returns all tests passed', async () => {
    const request: ExecutionRequest = {
      image: 'codeforge-sandbox-javascript:latest',
      language: 'javascript',
      submissionFiles: [
        {
          filePath: 'solution.mjs',
          content: `
export function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return [];
}
`,
        },
      ],
      testFiles: [
        {
          filePath: 'solution.test.mjs',
          content: `
import { describe, it, expect } from "vitest";
import { twoSum } from "../submission/solution.mjs";

describe("twoSum", () => {
  it("handles basic case", () => {
    expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
  });
  it("handles middle elements", () => {
    expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]);
  });
});
`,
        },
      ],
      timeoutSeconds: 15,
    };

    const response = await client.executeSubmission(request);
    assert(response.success, `Expected success, got error: ${response.error}`);
    assert(
      response.result!.status === 'completed',
      `Expected completed, got ${response.result!.status}`
    );
    assert(
      response.result!.tests_passed === 2,
      `Expected 2 passed, got ${response.result!.tests_passed}`
    );
  });

  // ---- TypeScript ----
  console.log('\nTypeScript:');

  await test('passing solution with types returns all tests passed', async () => {
    const request: ExecutionRequest = {
      image: 'codeforge-sandbox-typescript:latest',
      language: 'typescript',
      submissionFiles: [
        {
          filePath: 'solution.ts',
          content: `
export function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement)!, i];
    seen.set(nums[i], i);
  }
  return [];
}
`,
        },
      ],
      testFiles: [
        {
          filePath: 'solution.test.ts',
          content: `
import { describe, it, expect } from "vitest";
import { twoSum } from "../submission/solution";

describe("twoSum", () => {
  it("handles basic case", () => {
    expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
  });
  it("handles middle elements", () => {
    expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]);
  });
});
`,
        },
      ],
      timeoutSeconds: 15,
    };

    const response = await client.executeSubmission(request);
    assert(response.success, `Expected success, got error: ${response.error}`);
    assert(
      response.result!.status === 'completed',
      `Expected completed, got ${response.result!.status}`
    );
    assert(
      response.result!.tests_passed === 2,
      `Expected 2 passed, got ${response.result!.tests_passed}`
    );
  });

  // ---- Summary ----
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(40));

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
