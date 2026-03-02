// src/db/seed/exercises.ts
// Run with: npx tsx src/db/seeds/exercises.ts

import 'dotenv/config';
import { db } from '@/index';
import { exerciseEnvironments, exercises, exerciseFiles } from '@/db/schema/tables';
import { eq, and } from 'drizzle-orm';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function upsertEnvironment(tx: Tx, values: typeof exerciseEnvironments.$inferInsert) {
  const [inserted] = await tx
    .insert(exerciseEnvironments)
    .values(values)
    .onConflictDoNothing()
    .returning();
  if (inserted) return inserted;
  const [existing] = await tx
    .select()
    .from(exerciseEnvironments)
    .where(eq(exerciseEnvironments.name, values.name));
  if (!existing) throw new Error(`Environment '${values.name}' not found after conflict`);
  return existing;
}

async function seed() {
  await db.transaction(async (tx) => {
    // Clean up previous seed data (exercises cascade-delete their files)
    await tx
      .delete(exercises)
      .where(and(eq(exercises.origin, 'platform'), eq(exercises.llmModel, 'seed')));

    console.log('🌱 Seeding exercise environments...');

    // =========================================================================
    // ENVIRONMENTS
    // =========================================================================

    const pythonCore = await upsertEnvironment(tx, {
      name: 'python_core',
      displayName: 'Python',
      description: 'Standard Python environment with pytest',
      baseImage: 'python:3.12-slim',
      preinstalledPackages: ['pytest'],
      supportedLanguages: ['python'],
      maxExecutionSeconds: 30,
    });

    const nodeCore = await upsertEnvironment(tx, {
      name: 'node_core',
      displayName: 'Node.js',
      description: 'Node.js with Jest and TypeScript',
      baseImage: 'node:20-slim',
      preinstalledPackages: ['jest', 'typescript', 'ts-jest', '@types/jest'],
      supportedLanguages: ['typescript', 'javascript'],
      maxExecutionSeconds: 30,
    });

    const goCore = await upsertEnvironment(tx, {
      name: 'go_core',
      displayName: 'Go',
      description: 'Go standard library with built-in testing',
      baseImage: 'golang:1.22-alpine',
      preinstalledPackages: [],
      supportedLanguages: ['go'],
      maxExecutionSeconds: 30,
    });

    console.log('✅ Environments seeded');
    console.log('🌱 Seeding exercises...');

    // =========================================================================
    // EXERCISE 1: Two Sum (Python)
    // =========================================================================

    const [ex1] = await tx
      .insert(exercises)
      .values({
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Two Sum',
        description:
          'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n### Examples\n\n```\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1] (because nums[0] + nums[1] = 2 + 7 = 9)\n\nInput: nums = [3, 2, 4], target = 6\nOutput: [1, 2]\n```',
        difficulty: 'easy',
        language: 'python',
        hints: [
          'Think about what value you need to find for each number to reach the target.',
          'A hash map can help you look up complements in O(1) time.',
          'As you iterate, check if the complement (target - current) already exists in your map.',
        ],
        isValidated: true,
        tags: ['arrays', 'hash-map', 'algorithms'],
      })
      .returning();

    await tx.insert(exerciseFiles).values([
      {
        exerciseId: ex1.id,
        fileType: 'starter',
        filePath: 'solution.py',
        fileName: 'solution.py',
        content: `def two_sum(nums: list[int], target: int) -> list[int]:
    """
    Return indices of two numbers that add up to target.
    
    Args:
        nums: List of integers
        target: Target sum
    
    Returns:
        List of two indices
    """
    pass
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex1.id,
        fileType: 'solution',
        filePath: 'solution.py',
        fileName: 'solution.py',
        content: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex1.id,
        fileType: 'test',
        filePath: 'test_solution.py',
        fileName: 'test_solution.py',
        content: `from solution import two_sum

def test_basic():
    result = two_sum([2, 7, 11, 15], 9)
    assert sorted(result) == [0, 1]

def test_middle_elements():
    result = two_sum([3, 2, 4], 6)
    assert sorted(result) == [1, 2]

def test_negative_numbers():
    result = two_sum([-1, -2, -3, -4, -5], -8)
    assert sorted(result) == [2, 4]

def test_same_value():
    result = two_sum([3, 3], 6)
    assert sorted(result) == [0, 1]

def test_large_numbers():
    result = two_sum([1000000, 500000, 500000], 1000000)
    assert sorted(result) == [1, 2]
`,
        sortOrder: 0,
      },
    ]);

    // =========================================================================
    // EXERCISE 2: FizzBuzz (Python)
    // =========================================================================

    const [ex2] = await tx
      .insert(exercises)
      .values({
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'FizzBuzz',
        description:
          'Write a function that returns a list of strings from 1 to `n`.\n\nFor each number:\n- If the number is divisible by 3, use `"Fizz"`\n- If divisible by 5, use `"Buzz"`\n- If divisible by both 3 and 5, use `"FizzBuzz"`\n- Otherwise, use the string representation of the number\n\n### Examples\n\n```\nInput: n = 5\nOutput: ["1", "2", "Fizz", "4", "Buzz"]\n\nInput: n = 15\nOutput: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]\n```',
        difficulty: 'beginner',
        language: 'python',
        hints: [
          'Check divisibility by both 3 and 5 first, before checking each individually.',
          'Use the modulo operator (%) to check divisibility.',
          'Build the result list by iterating from 1 to n inclusive.',
        ],
        isValidated: true,
        tags: ['loops', 'conditionals', 'beginner'],
      })
      .returning();

    await tx.insert(exerciseFiles).values([
      {
        exerciseId: ex2.id,
        fileType: 'starter',
        filePath: 'solution.py',
        fileName: 'solution.py',
        content: `def fizzbuzz(n: int) -> list[str]:
    """
    Return FizzBuzz sequence from 1 to n.
    
    Args:
        n: Upper bound (inclusive)
    
    Returns:
        List of FizzBuzz strings
    """
    pass
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex2.id,
        fileType: 'solution',
        filePath: 'solution.py',
        fileName: 'solution.py',
        content: `def fizzbuzz(n: int) -> list[str]:
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex2.id,
        fileType: 'test',
        filePath: 'test_solution.py',
        fileName: 'test_solution.py',
        content: `from solution import fizzbuzz

def test_small():
    assert fizzbuzz(5) == ["1", "2", "Fizz", "4", "Buzz"]

def test_fizzbuzz_at_15():
    result = fizzbuzz(15)
    assert result[14] == "FizzBuzz"

def test_length():
    assert len(fizzbuzz(100)) == 100

def test_single():
    assert fizzbuzz(1) == ["1"]

def test_fizz_positions():
    result = fizzbuzz(15)
    assert result[2] == "Fizz"
    assert result[5] == "Fizz"
    assert result[8] == "Fizz"
`,
        sortOrder: 0,
      },
    ]);

    // =========================================================================
    // EXERCISE 3: Reverse Linked List (Python)
    // =========================================================================

    const [ex3] = await tx
      .insert(exercises)
      .values({
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Reverse a Linked List',
        description:
          'Given the head of a singly linked list, reverse the list and return the new head.\n\nA `ListNode` class is provided with `val` and `next` attributes.\n\n### Examples\n\n```\nInput: 1 -> 2 -> 3 -> 4 -> 5\nOutput: 5 -> 4 -> 3 -> 2 -> 1\n\nInput: 1 -> 2\nOutput: 2 -> 1\n\nInput: (empty)\nOutput: (empty)\n```',
        difficulty: 'medium',
        language: 'python',
        hints: [
          "You need to change each node's next pointer to point to the previous node.",
          'Use three pointers: prev, current, and next_node to track your position.',
          'Initialize prev as None and iterate through the list, reversing pointers as you go.',
        ],
        isValidated: true,
        tags: ['linked-list', 'pointers', 'data-structures'],
      })
      .returning();

    await tx.insert(exerciseFiles).values([
      {
        exerciseId: ex3.id,
        fileType: 'starter',
        filePath: 'solution.py',
        fileName: 'solution.py',
        content: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def reverse_list(head: ListNode | None) -> ListNode | None:
    """
    Reverse a singly linked list.
    
    Args:
        head: Head node of the linked list
    
    Returns:
        New head of the reversed list
    """
    pass
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex3.id,
        fileType: 'solution',
        filePath: 'solution.py',
        fileName: 'solution.py',
        content: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def reverse_list(head: ListNode | None) -> ListNode | None:
    prev = None
    current = head
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    return prev
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex3.id,
        fileType: 'test',
        filePath: 'test_solution.py',
        fileName: 'test_solution.py',
        content: `from solution import ListNode, reverse_list

def to_list(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

def from_list(values):
    if not values:
        return None
    head = ListNode(values[0])
    current = head
    for val in values[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

def test_five_elements():
    head = from_list([1, 2, 3, 4, 5])
    assert to_list(reverse_list(head)) == [5, 4, 3, 2, 1]

def test_two_elements():
    head = from_list([1, 2])
    assert to_list(reverse_list(head)) == [2, 1]

def test_single():
    head = from_list([1])
    assert to_list(reverse_list(head)) == [1]

def test_empty():
    assert reverse_list(None) is None
`,
        sortOrder: 0,
      },
    ]);

    // =========================================================================
    // EXERCISE 4: Valid Palindrome (TypeScript)
    // =========================================================================

    const [ex4] = await tx
      .insert(exercises)
      .values({
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Valid Palindrome',
        description:
          'Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring case.\n\n### Examples\n\n```\nInput: "A man, a plan, a canal: Panama"\nOutput: true\n\nInput: "race a car"\nOutput: false\n\nInput: " "\nOutput: true (empty string is a palindrome)\n```',
        difficulty: 'easy',
        language: 'typescript',
        hints: [
          'First, strip all non-alphanumeric characters and convert to lowercase.',
          'Compare the cleaned string to its reverse.',
          'Alternatively, use two pointers from both ends moving inward.',
        ],
        isValidated: true,
        tags: ['strings', 'two-pointers', 'algorithms'],
      })
      .returning();

    await tx.insert(exerciseFiles).values([
      {
        exerciseId: ex4.id,
        fileType: 'starter',
        filePath: 'solution.ts',
        fileName: 'solution.ts',
        content: `/**
 * Determine if a string is a valid palindrome,
 * considering only alphanumeric characters and ignoring case.
 */
export function isPalindrome(s: string): boolean {
  // Your code here
}
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex4.id,
        fileType: 'solution',
        filePath: 'solution.ts',
        fileName: 'solution.ts',
        content: `export function isPalindrome(s: string): boolean {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === cleaned.split("").reverse().join("");
}
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex4.id,
        fileType: 'test',
        filePath: 'solution.test.ts',
        fileName: 'solution.test.ts',
        content: `import { isPalindrome } from "./solution";

test("classic palindrome with punctuation", () => {
  expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
});

test("not a palindrome", () => {
  expect(isPalindrome("race a car")).toBe(false);
});

test("empty string", () => {
  expect(isPalindrome(" ")).toBe(true);
});

test("single character", () => {
  expect(isPalindrome("a")).toBe(true);
});

test("numbers", () => {
  expect(isPalindrome("12321")).toBe(true);
});

test("mixed case", () => {
  expect(isPalindrome("RaceCar")).toBe(true);
});
`,
        sortOrder: 0,
      },
    ]);

    // =========================================================================
    // EXERCISE 5: Flatten Nested Array (JavaScript)
    // =========================================================================

    const [ex5] = await tx
      .insert(exercises)
      .values({
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Flatten Nested Array',
        description:
          'Write a function that takes a deeply nested array and returns a new flat array with all values at the top level.\n\nDo not use the built-in `Array.prototype.flat()` method.\n\n### Examples\n\n```\nInput: [1, [2, [3, [4]], 5]]\nOutput: [1, 2, 3, 4, 5]\n\nInput: [[1, 2], [3, [4, 5]]]\nOutput: [1, 2, 3, 4, 5]\n\nInput: [1, 2, 3]\nOutput: [1, 2, 3]\n```',
        difficulty: 'medium',
        language: 'javascript',
        hints: [
          'Recursion is a natural fit — if an element is an array, flatten it too.',
          'Use Array.isArray() to check if an element is an array.',
          'Build a result array and use concat or spread to combine flattened sub-arrays.',
        ],
        isValidated: true,
        tags: ['arrays', 'recursion', 'algorithms'],
      })
      .returning();

    await tx.insert(exerciseFiles).values([
      {
        exerciseId: ex5.id,
        fileType: 'starter',
        filePath: 'solution.js',
        fileName: 'solution.js',
        content: `/**
 * Flatten a deeply nested array into a single-level array.
 * Do not use Array.prototype.flat().
 *
 * @param {Array} arr - A nested array
 * @returns {Array} - A flat array
 */
function flatten(arr) {
  // Your code here
}

module.exports = { flatten };
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex5.id,
        fileType: 'solution',
        filePath: 'solution.js',
        fileName: 'solution.js',
        content: `function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

module.exports = { flatten };
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex5.id,
        fileType: 'test',
        filePath: 'solution.test.js',
        fileName: 'solution.test.js',
        content: `const { flatten } = require("./solution");

test("nested array", () => {
  expect(flatten([1, [2, [3, [4]], 5]])).toEqual([1, 2, 3, 4, 5]);
});

test("two-level nesting", () => {
  expect(flatten([[1, 2], [3, [4, 5]]])).toEqual([1, 2, 3, 4, 5]);
});

test("already flat", () => {
  expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
});

test("empty array", () => {
  expect(flatten([])).toEqual([]);
});

test("deeply nested single value", () => {
  expect(flatten([[[[[[1]]]]]])).toEqual([1]);
});
`,
        sortOrder: 0,
      },
    ]);

    // =========================================================================
    // EXERCISE 6: Stack with Min (TypeScript)
    // =========================================================================

    const [ex6] = await tx
      .insert(exercises)
      .values({
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Stack with Minimum',
        description:
          'Design a stack that supports `push`, `pop`, `top`, and `getMin` operations, all in O(1) time.\n\n### Methods\n\n- `push(val)` — Push a value onto the stack\n- `pop()` — Remove and return the top element\n- `top()` — Return the top element without removing it\n- `getMin()` — Return the minimum element in the stack\n\n### Example\n\n```\nconst stack = new MinStack();\nstack.push(-2);\nstack.push(0);\nstack.push(-3);\nstack.getMin(); // returns -3\nstack.pop();    // removes -3\nstack.top();    // returns 0\nstack.getMin(); // returns -2\n```',
        difficulty: 'medium',
        language: 'typescript',
        hints: [
          "A single stack can't track the minimum efficiently. Consider using a second stack.",
          'The auxiliary stack tracks the minimum at each level of the main stack.',
          'When you push, also push the new minimum (min of value and current min) onto the min stack.',
        ],
        isValidated: true,
        tags: ['stack', 'data-structures', 'design'],
      })
      .returning();

    await tx.insert(exerciseFiles).values([
      {
        exerciseId: ex6.id,
        fileType: 'starter',
        filePath: 'solution.ts',
        fileName: 'solution.ts',
        content: `export class MinStack {
  constructor() {
    // Initialize your data structures here
  }

  push(val: number): void {
    // Your code here
  }

  pop(): number {
    // Your code here
    return 0;
  }

  top(): number {
    // Your code here
    return 0;
  }

  getMin(): number {
    // Your code here
    return 0;
  }
}
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex6.id,
        fileType: 'solution',
        filePath: 'solution.ts',
        fileName: 'solution.ts',
        content: `export class MinStack {
  private stack: number[] = [];
  private minStack: number[] = [];

  push(val: number): void {
    this.stack.push(val);
    const currentMin = this.minStack.length === 0
      ? val
      : Math.min(val, this.minStack[this.minStack.length - 1]);
    this.minStack.push(currentMin);
  }

  pop(): number {
    this.minStack.pop();
    return this.stack.pop()!;
  }

  top(): number {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.minStack[this.minStack.length - 1];
  }
}
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex6.id,
        fileType: 'test',
        filePath: 'solution.test.ts',
        fileName: 'solution.test.ts',
        content: `import { MinStack } from "./solution";

test("basic operations", () => {
  const stack = new MinStack();
  stack.push(-2);
  stack.push(0);
  stack.push(-3);
  expect(stack.getMin()).toBe(-3);
  stack.pop();
  expect(stack.top()).toBe(0);
  expect(stack.getMin()).toBe(-2);
});

test("single element", () => {
  const stack = new MinStack();
  stack.push(42);
  expect(stack.top()).toBe(42);
  expect(stack.getMin()).toBe(42);
});

test("ascending order", () => {
  const stack = new MinStack();
  stack.push(1);
  stack.push(2);
  stack.push(3);
  expect(stack.getMin()).toBe(1);
  stack.pop();
  expect(stack.getMin()).toBe(1);
});

test("descending order", () => {
  const stack = new MinStack();
  stack.push(3);
  stack.push(2);
  stack.push(1);
  expect(stack.getMin()).toBe(1);
  stack.pop();
  expect(stack.getMin()).toBe(2);
});

test("duplicate minimums", () => {
  const stack = new MinStack();
  stack.push(1);
  stack.push(1);
  expect(stack.getMin()).toBe(1);
  stack.pop();
  expect(stack.getMin()).toBe(1);
});
`,
        sortOrder: 0,
      },
    ]);

    // =========================================================================
    // EXERCISE 7: Binary Search (Go)
    // =========================================================================

    const [ex7] = await tx
      .insert(exercises)
      .values({
        origin: 'platform',
        environmentId: goCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Binary Search',
        description:
          'Implement binary search on a sorted array of integers.\n\nGiven a sorted array and a target value, return the index of the target if found, or -1 if not found.\n\n### Examples\n\n```\nInput: nums = [-1, 0, 3, 5, 9, 12], target = 9\nOutput: 4\n\nInput: nums = [-1, 0, 3, 5, 9, 12], target = 2\nOutput: -1\n```',
        difficulty: 'easy',
        language: 'go',
        hints: [
          'Maintain two pointers, left and right, representing the search boundaries.',
          'Calculate the midpoint and compare the value there to the target.',
          'If the target is less than the midpoint value, search the left half. Otherwise, search the right half.',
        ],
        isValidated: true,
        tags: ['binary-search', 'arrays', 'algorithms'],
      })
      .returning();

    await tx.insert(exerciseFiles).values([
      {
        exerciseId: ex7.id,
        fileType: 'starter',
        filePath: 'solution.go',
        fileName: 'solution.go',
        content: `package solution

// BinarySearch returns the index of target in a sorted slice,
// or -1 if target is not found.
func BinarySearch(nums []int, target int) int {
	// Your code here
	return -1
}
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex7.id,
        fileType: 'solution',
        filePath: 'solution.go',
        fileName: 'solution.go',
        content: `package solution

func BinarySearch(nums []int, target int) int {
	left, right := 0, len(nums)-1
	for left <= right {
		mid := left + (right-left)/2
		if nums[mid] == target {
			return mid
		} else if nums[mid] < target {
			left = mid + 1
		} else {
			right = mid - 1
		}
	}
	return -1
}
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex7.id,
        fileType: 'test',
        filePath: 'solution_test.go',
        fileName: 'solution_test.go',
        content: `package solution

import "testing"

func TestFound(t *testing.T) {
	result := BinarySearch([]int{-1, 0, 3, 5, 9, 12}, 9)
	if result != 4 {
		t.Errorf("Expected 4, got %d", result)
	}
}

func TestNotFound(t *testing.T) {
	result := BinarySearch([]int{-1, 0, 3, 5, 9, 12}, 2)
	if result != -1 {
		t.Errorf("Expected -1, got %d", result)
	}
}

func TestFirstElement(t *testing.T) {
	result := BinarySearch([]int{1, 2, 3, 4, 5}, 1)
	if result != 0 {
		t.Errorf("Expected 0, got %d", result)
	}
}

func TestLastElement(t *testing.T) {
	result := BinarySearch([]int{1, 2, 3, 4, 5}, 5)
	if result != 4 {
		t.Errorf("Expected 4, got %d", result)
	}
}

func TestSingleElement(t *testing.T) {
	result := BinarySearch([]int{42}, 42)
	if result != 0 {
		t.Errorf("Expected 0, got %d", result)
	}
}

func TestEmpty(t *testing.T) {
	result := BinarySearch([]int{}, 1)
	if result != -1 {
		t.Errorf("Expected -1, got %d", result)
	}
}
`,
        sortOrder: 0,
      },
    ]);

    // =========================================================================
    // EXERCISE 8: Debounce Function (TypeScript)
    // =========================================================================

    const [ex8] = await tx
      .insert(exercises)
      .values({
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Implement Debounce',
        description:
          'Implement a `debounce` function that delays invoking the provided function until after `delay` milliseconds have elapsed since the last time it was called.\n\nIf the debounced function is called again before the delay has elapsed, the previous timer is cancelled and a new one starts.\n\n### Example\n\n```typescript\nconst log = debounce((msg: string) => console.log(msg), 300);\nlog("a"); // timer starts\nlog("b"); // cancels previous, restarts timer\n// after 300ms, "b" is logged ("a" is never logged)\n```',
        difficulty: 'medium',
        language: 'typescript',
        hints: [
          'You need to store a reference to the timer so you can cancel it.',
          'Use setTimeout to delay the function call and clearTimeout to cancel it.',
          'Return a new function that wraps this logic, capturing the timer in a closure.',
        ],
        isValidated: true,
        tags: ['closures', 'timers', 'javascript-patterns'],
      })
      .returning();

    await tx.insert(exerciseFiles).values([
      {
        exerciseId: ex8.id,
        fileType: 'starter',
        filePath: 'solution.ts',
        fileName: 'solution.ts',
        content: `/**
 * Creates a debounced version of the provided function.
 * The function will only be called after \`delay\` ms have
 * passed since the last invocation.
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  // Your code here
  return fn;
}
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex8.id,
        fileType: 'solution',
        filePath: 'solution.ts',
        fileName: 'solution.ts',
        content: `export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
}
`,
        sortOrder: 0,
      },
      {
        exerciseId: ex8.id,
        fileType: 'test',
        filePath: 'solution.test.ts',
        fileName: 'solution.test.ts',
        content: `import { debounce } from "./solution";

jest.useFakeTimers();

test("calls function after delay", () => {
  const fn = jest.fn();
  const debounced = debounce(fn, 300);

  debounced();
  expect(fn).not.toHaveBeenCalled();

  jest.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("resets timer on subsequent calls", () => {
  const fn = jest.fn();
  const debounced = debounce(fn, 300);

  debounced();
  jest.advanceTimersByTime(200);
  debounced();
  jest.advanceTimersByTime(200);

  expect(fn).not.toHaveBeenCalled();

  jest.advanceTimersByTime(100);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("passes arguments to the function", () => {
  const fn = jest.fn();
  const debounced = debounce(fn, 100);

  debounced("hello", "world");
  jest.advanceTimersByTime(100);

  expect(fn).toHaveBeenCalledWith("hello", "world");
});

test("only calls with latest arguments", () => {
  const fn = jest.fn();
  const debounced = debounce(fn, 100);

  debounced("a");
  debounced("b");
  debounced("c");
  jest.advanceTimersByTime(100);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("c");
});
`,
        sortOrder: 0,
      },
    ]);

    console.log('✅ Exercises seeded');
    console.log(`
Seeded:
  - 3 environments (python_core, node_core, go_core)
  - 8 exercises:
    1. Two Sum (Python, easy)
    2. FizzBuzz (Python, beginner)
    3. Reverse Linked List (Python, medium)
    4. Valid Palindrome (TypeScript, easy)
    5. Flatten Nested Array (JavaScript, medium)
    6. Stack with Minimum (TypeScript, medium)
    7. Binary Search (Go, easy)
    8. Implement Debounce (TypeScript, medium)
  `);
  }); // end transaction

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
