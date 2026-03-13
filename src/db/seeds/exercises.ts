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

/** Insert an exercise + its files inside the transaction */
async function seedExercise(
  tx: Tx,
  values: typeof exercises.$inferInsert,
  files: { fileType: string; filePath: string; fileName: string; content: string; sortOrder: number }[]
) {
  const [ex] = await tx.insert(exercises).values(values).returning();
  await tx.insert(exerciseFiles).values(files.map((f) => ({ ...f, exerciseId: ex.id })));
  return ex;
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
    //  INTERVIEW PREP
    // =========================================================================

    // ── Two Sum ──────────────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Two Sum',
        description:
          'Given an array of integers and a target, return the indices of the two numbers that add up to the target. Each input has exactly one solution — you cannot use the same element twice.\n\n```\nnums = [2, 7, 11, 15], target = 9  →  [0, 1]\nnums = [3, 2, 4], target = 6       →  [1, 2]\n```\n\nThe brute-force approach checks every pair in O(n²). Can you do it in a single pass?',
        difficulty: 'easy',
        language: 'python',
        hints: [
          'For each number, you need its complement: target - num. How can you check if you have already seen it?',
          'A dictionary gives O(1) lookups. Store each number\'s index as you go.',
          'On each iteration: compute complement → check dict → if found, return both indices. Otherwise, record the current number.',
        ],
        isValidated: true,
        tags: ['arrays', 'hash-map', 'algorithms', 'interview'],
        lessonContent: {
          title: 'Hash Map Lookups: Trading Space for Speed',
          body: `When you need to find whether a complement or partner value exists in a collection, your first instinct might be to scan through every element. That works, but it's slow — O(n²) for the nested loop approach. Hash maps flip the problem around: instead of searching for what you need, you record what you've seen.

The core idea is simple. As you iterate through a list, you store each element in a dictionary. Before processing each new element, you check whether the value you're looking for is already in that dictionary. Dictionary lookups are O(1) on average, so your entire pass through the list becomes O(n).

This pattern shows up constantly in interview problems. Anytime you catch yourself writing a nested loop where the inner loop is just searching for something, pause and ask: "Could I use a hash map to remember what I've already seen?" The answer is almost always yes.

There's a subtle but important detail: the order in which you check and insert matters. If you check the map before inserting the current element, you naturally avoid using the same element twice. If you insert first, you might accidentally match an element with itself.

Hash maps do use extra memory — O(n) in the worst case, since you might store every element before finding your answer. This is the classic time-space tradeoff, and in interviews, the faster solution is almost always preferred unless the interviewer specifically constrains memory.

When you approach a problem like this, start by identifying what you're searching for at each step, then build a map keyed by that target. The value you store alongside it is whatever context you'll need when you find a match — often an index, sometimes a count, sometimes the element itself.`,
          codeExample: {
            code: `def find_pair_with_target_difference(nums, target):
    """Find two numbers whose difference equals target."""
    seen = {}
    for i, num in enumerate(nums):
        complement = num - target
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(find_pair_with_target_difference([2, 7, 11, 1, 8], 5))  # [0, 1]`,
            language: 'python',
            annotations: [
              { line: 3, text: 'Dictionary will map each value to its index for O(1) lookup' },
              { line: 5, text: 'Derive what partner value would satisfy our condition' },
              { line: 6, text: 'Check the map BEFORE inserting — avoids matching an element with itself' },
              { line: 8, text: 'Only store the element after checking, preserving correct pairing' },
            ],
          },
          keyTakeaways: [
            'When a brute-force solution uses a nested loop to search, replace the inner loop with a hash map lookup to go from O(n²) to O(n).',
            'Check the map before inserting the current element to avoid using the same element twice.',
            'Store whatever context you will need at match time (usually an index) as the map value.',
          ],
        },
        synthesisContent: {
          summary: 'You used a hash map to find a pair of elements satisfying a condition in a single pass through the array.',
          connections: 'The "check-then-insert" hash map pattern is foundational to dozens of interview problems, from finding duplicates to grouping elements. It demonstrates the most common time-space tradeoff in algorithm design: using O(n) extra memory to eliminate an O(n) inner loop.',
          realWorld: 'Hash map lookups power database indexing, caching layers, and request deduplication in production systems.',
          nextPreview: null,
        },
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def two_sum(nums: list[int], target: int) -> list[int]:
    """Return indices of two numbers that add up to target."""
    pass
`,
          sortOrder: 0,
        },
        {
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
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import two_sum

def test_basic():
    assert sorted(two_sum([2, 7, 11, 15], 9)) == [0, 1]

def test_middle_elements():
    assert sorted(two_sum([3, 2, 4], 6)) == [1, 2]

def test_negative_numbers():
    assert sorted(two_sum([-1, -2, -3, -4, -5], -8)) == [2, 4]

def test_duplicate_values():
    assert sorted(two_sum([3, 3], 6)) == [0, 1]

def test_large_numbers():
    assert sorted(two_sum([1000000, 500000, 500000], 1000000)) == [1, 2]
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Valid Palindrome ─────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Valid Palindrome',
        description:
          'Determine whether a string is a palindrome, ignoring everything except letters and digits.\n\n```\n"A man, a plan, a canal: Panama"  →  true\n"race a car"                      →  false\n" "                               →  true\n```\n\nCase does not matter. An empty or whitespace-only string counts as a palindrome.',
        difficulty: 'easy',
        language: 'typescript',
        hints: [
          'Strip non-alphanumeric characters first, then compare.',
          'Two pointers from both ends avoids creating a reversed copy.',
          'Remember to normalize case before comparing.',
        ],
        isValidated: true,
        tags: ['strings', 'two-pointers', 'algorithms', 'interview'],
        lessonContent: {
          title: 'The Two-Pointer Technique for String Comparison',
          body: `The two-pointer technique is one of the most elegant patterns in programming. Place one pointer at the start of a sequence and another at the end, then walk them toward each other. At each step, you compare or process the elements at both positions.

For string problems, two pointers are especially useful when you need to compare characters from opposite ends. Instead of reversing the string and checking equality (which allocates a whole new string), you can compare in-place with O(1) extra memory.

The tricky part in real interview problems is handling noise. Raw input is messy — strings might contain spaces, punctuation, mixed casing. Before comparing two characters, you often need to skip over irrelevant ones and normalize what remains.

Here's the general skeleton: while \`left < right\`, advance \`left\` past any characters you want to ignore, advance \`right\` backward past the same kind of characters, then compare. If the comparison fails, return false immediately.

A common mistake is forgetting boundary checks when skipping characters. If your string is entirely made up of non-alphanumeric characters, the pointers can cross each other during the skip phase. Always check \`left < right\` inside your skip loops, not just in the outer loop.

Two pointers work because they let you eliminate half the comparisons — you're checking both ends simultaneously. The technique extends far beyond palindromes: it's the basis for problems involving sorted arrays, partitioning, and container problems.`,
          codeExample: {
            code: `function isMirroredSequence(arr: number[]): boolean {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    while (left < right && arr[left] < 0) left++;
    while (left < right && arr[right] < 0) right--;

    if (arr[left] !== arr[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
            language: 'typescript',
            annotations: [
              { line: 2, text: 'Left pointer starts at the beginning of the sequence' },
              { line: 3, text: 'Right pointer starts at the end — they will converge toward the middle' },
              { line: 6, text: 'Skip over "noise" elements, but always guard with left < right' },
              { line: 9, text: 'Core comparison: if the values at both pointers differ, it is not mirrored' },
            ],
          },
          keyTakeaways: [
            'Two pointers converging from both ends let you compare a sequence in O(n) time with O(1) space.',
            'When skipping unwanted characters, always re-check the left < right boundary inside the skip loops.',
            'Normalize characters (e.g., lowercasing) before comparison so you test the property you actually care about.',
          ],
        },
        synthesisContent: {
          summary: 'You applied the two-pointer technique to verify a symmetry property of a string while filtering out irrelevant characters.',
          connections: 'Two pointers are a building block that appears in sorted-array search, partitioning algorithms like quicksort, and the container/water problem. Learning to skip and normalize within the pointer loop prepares you for messier real-world inputs.',
          realWorld: 'Input sanitization and normalization before comparison is routine in production — think username matching, search queries, or URL slug generation.',
          nextPreview: null,
        },
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export function isPalindrome(s: string): boolean {
  // Your code here
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export function isPalindrome(s: string): boolean {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let left = 0;
  let right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'solution.test.ts',
          fileName: 'solution.test.ts',
          content: `import { isPalindrome } from "./solution";

test("phrase with punctuation", () => {
  expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
});

test("not a palindrome", () => {
  expect(isPalindrome("race a car")).toBe(false);
});

test("whitespace only", () => {
  expect(isPalindrome(" ")).toBe(true);
});

test("single char", () => {
  expect(isPalindrome("a")).toBe(true);
});

test("numeric palindrome", () => {
  expect(isPalindrome("12321")).toBe(true);
});

test("mixed case", () => {
  expect(isPalindrome("RaceCar")).toBe(true);
});
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Group Anagrams ───────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Group Anagrams',
        description:
          'Given a list of strings, group the anagrams together. Two strings are anagrams if they contain the exact same characters in any order.\n\n```\n["eat", "tea", "tan", "ate", "nat", "bat"]\n→ [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]\n```\n\nThe output order between groups does not matter, but strings within each group should preserve their original order.',
        difficulty: 'medium',
        language: 'python',
        hints: [
          'Two words are anagrams if they produce the same result when sorted.',
          'Use a dictionary keyed by the sorted characters of each word.',
          'defaultdict(list) keeps this clean — append each word to the group matching its sorted key.',
        ],
        isValidated: true,
        tags: ['hash-map', 'sorting', 'algorithms', 'interview'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def group_anagrams(strs: list[str]) -> list[list[str]]:
    """Group a list of strings by anagram."""
    pass
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `from collections import defaultdict

def group_anagrams(strs: list[str]) -> list[list[str]]:
    groups = defaultdict(list)
    for s in strs:
        key = "".join(sorted(s))
        groups[key].append(s)
    return list(groups.values())
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import group_anagrams

def _normalize(groups):
    """Sort each group and sort the list of groups for comparison."""
    return sorted(sorted(g) for g in groups)

def test_basic():
    result = group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
    assert _normalize(result) == [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]

def test_single_string():
    assert group_anagrams(["hello"]) == [["hello"]]

def test_empty_strings():
    result = group_anagrams(["", ""])
    assert _normalize(result) == [["", ""]]

def test_no_anagrams():
    result = group_anagrams(["abc", "def", "ghi"])
    assert len(result) == 3

def test_all_same():
    result = group_anagrams(["ab", "ba", "ab"])
    assert _normalize(result) == [["ab", "ab", "ba"]]
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Merge Intervals ──────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Merge Intervals',
        description:
          'Given an array of intervals where `intervals[i] = [start, end]`, merge all overlapping intervals and return the result.\n\n```\n[[1,3],[2,6],[8,10],[15,18]]  →  [[1,6],[8,10],[15,18]]\n[[1,4],[4,5]]                 →  [[1,5]]\n```\n\nIntervals `[1,3]` and `[2,6]` overlap because 2 ≤ 3, so they merge into `[1,6]`.',
        difficulty: 'medium',
        language: 'typescript',
        hints: [
          'Sorting the intervals by start time makes overlaps easy to detect — you only need to compare adjacent pairs.',
          'After sorting, walk through the list. If the current interval overlaps with the last merged one, extend it. Otherwise, start a new group.',
          'Two intervals overlap when current.start <= lastMerged.end.',
        ],
        isValidated: true,
        tags: ['arrays', 'sorting', 'algorithms', 'interview'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export function merge(intervals: number[][]): number[][] {
  // Your code here
  return [];
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export function merge(intervals: number[][]): number[][] {
  if (intervals.length <= 1) return intervals;

  intervals.sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const curr = intervals[i];

    if (curr[0] <= last[1]) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }

  return merged;
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'solution.test.ts',
          fileName: 'solution.test.ts',
          content: `import { merge } from "./solution";

test("overlapping intervals", () => {
  expect(merge([[1,3],[2,6],[8,10],[15,18]])).toEqual([[1,6],[8,10],[15,18]]);
});

test("touching intervals", () => {
  expect(merge([[1,4],[4,5]])).toEqual([[1,5]]);
});

test("single interval", () => {
  expect(merge([[1,1]])).toEqual([[1,1]]);
});

test("no overlap", () => {
  expect(merge([[1,2],[4,5],[7,8]])).toEqual([[1,2],[4,5],[7,8]]);
});

test("unsorted input", () => {
  expect(merge([[3,4],[1,2],[2,3]])).toEqual([[1,4]]);
});

test("fully nested interval", () => {
  expect(merge([[1,10],[2,3],[4,5]])).toEqual([[1,10]]);
});
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Longest Substring Without Repeating Characters ───────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Longest Unique Substring',
        description:
          'Find the length of the longest substring that contains no repeated characters.\n\n```\n"abcabcbb"  →  3   ("abc")\n"bbbbb"     →  1   ("b")\n"pwwkew"    →  3   ("wke")\n""          →  0\n```\n\nA *substring* is a contiguous sequence of characters within the string.',
        difficulty: 'medium',
        language: 'python',
        hints: [
          'A sliding window approach lets you expand and contract a range without rescanning.',
          'Use a set to track characters in the current window. When you hit a duplicate, shrink from the left.',
          'Keep a running max of window size as you expand to the right.',
        ],
        isValidated: true,
        tags: ['hash-map', 'two-pointers', 'algorithms', 'interview'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def length_of_longest_substring(s: str) -> int:
    """Return the length of the longest substring without repeating characters."""
    pass
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def length_of_longest_substring(s: str) -> int:
    seen = {}
    left = 0
    longest = 0

    for right, char in enumerate(s):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1
        seen[char] = right
        longest = max(longest, right - left + 1)

    return longest
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import length_of_longest_substring

def test_basic():
    assert length_of_longest_substring("abcabcbb") == 3

def test_all_same():
    assert length_of_longest_substring("bbbbb") == 1

def test_overlap():
    assert length_of_longest_substring("pwwkew") == 3

def test_empty():
    assert length_of_longest_substring("") == 0

def test_single_char():
    assert length_of_longest_substring("a") == 1

def test_all_unique():
    assert length_of_longest_substring("abcdef") == 6

def test_repeat_at_end():
    assert length_of_longest_substring("abca") == 3

def test_spaces():
    assert length_of_longest_substring("a b c a") == 4
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Product of Array Except Self ─────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Product Except Self',
        description:
          'Given an integer array, return an array where each element is the product of every *other* element in the original. Solve it without using division.\n\n```\n[1, 2, 3, 4]  →  [24, 12, 8, 6]\n[-1, 1, 0, -3, 3]  →  [0, 0, 9, 0, 0]\n```\n\nYour solution should run in O(n) time.',
        difficulty: 'medium',
        language: 'typescript',
        hints: [
          'If you could divide, you would compute the total product and divide by each element. The challenge is doing it without division.',
          'For each index, the answer is (product of everything to its left) × (product of everything to its right).',
          'Build a prefix product array left-to-right, then sweep right-to-left multiplying in the suffix products.',
        ],
        isValidated: true,
        tags: ['arrays', 'algorithms', 'interview'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export function productExceptSelf(nums: number[]): number[] {
  // Your code here
  return [];
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const result = new Array(n).fill(1);

  // prefix pass: result[i] = product of nums[0..i-1]
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }

  // suffix pass: multiply in product of nums[i+1..n-1]
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }

  return result;
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'solution.test.ts',
          fileName: 'solution.test.ts',
          content: `import { productExceptSelf } from "./solution";

test("basic case", () => {
  expect(productExceptSelf([1, 2, 3, 4])).toEqual([24, 12, 8, 6]);
});

test("contains zero", () => {
  expect(productExceptSelf([-1, 1, 0, -3, 3])).toEqual([0, 0, 9, 0, 0]);
});

test("two elements", () => {
  expect(productExceptSelf([3, 5])).toEqual([5, 3]);
});

test("contains negatives", () => {
  expect(productExceptSelf([-1, -2, -3])).toEqual([6, 3, 2]);
});

test("all ones", () => {
  expect(productExceptSelf([1, 1, 1, 1])).toEqual([1, 1, 1, 1]);
});
`,
          sortOrder: 0,
        },
      ]
    );

    // =========================================================================
    //  DATA STRUCTURES & ALGORITHMS
    // =========================================================================

    // ── Reverse Linked List ──────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Reverse a Linked List',
        description:
          'Reverse a singly linked list in place and return the new head.\n\nA `ListNode` class is provided with `val` and `next` attributes.\n\n```\n1 → 2 → 3 → 4 → 5    becomes    5 → 4 → 3 → 2 → 1\n1 → 2                  becomes    2 → 1\nNone                   stays      None\n```\n\nDo it iteratively (a recursive solution works too, but try iterative first).',
        difficulty: 'medium',
        language: 'python',
        hints: [
          'You need three pointers: previous, current, and next_node.',
          'At each step, save current.next, point current.next to previous, then advance both pointers forward.',
          'When current reaches None, previous is the new head.',
        ],
        isValidated: true,
        tags: ['linked-list', 'data-structures'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def reverse_list(head: ListNode | None) -> ListNode | None:
    """Reverse a singly linked list and return the new head."""
    pass
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def reverse_list(head: ListNode | None) -> ListNode | None:
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import ListNode, reverse_list

def to_list(head):
    vals = []
    while head:
        vals.append(head.val)
        head = head.next
    return vals

def from_list(values):
    if not values:
        return None
    head = ListNode(values[0])
    curr = head
    for v in values[1:]:
        curr.next = ListNode(v)
        curr = curr.next
    return head

def test_five_elements():
    assert to_list(reverse_list(from_list([1, 2, 3, 4, 5]))) == [5, 4, 3, 2, 1]

def test_two_elements():
    assert to_list(reverse_list(from_list([1, 2]))) == [2, 1]

def test_single():
    assert to_list(reverse_list(from_list([42]))) == [42]

def test_empty():
    assert reverse_list(None) is None
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Stack with Minimum ───────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Min Stack',
        description:
          'Build a stack that supports `push`, `pop`, `top`, and `getMin` — all in O(1) time.\n\n```\nstack.push(-2)\nstack.push(0)\nstack.push(-3)\nstack.getMin()   // -3\nstack.pop()      // removes -3\nstack.top()      // 0\nstack.getMin()   // -2\n```\n\nThe trick is tracking the minimum efficiently as elements are added and removed.',
        difficulty: 'medium',
        language: 'typescript',
        hints: [
          'A single stack cannot track the minimum after a pop without re-scanning. You need auxiliary state.',
          'Maintain a second stack that mirrors the main stack but stores the running minimum at each level.',
          'On push: push min(value, currentMin) onto the min stack. On pop: pop both stacks.',
        ],
        isValidated: true,
        tags: ['stack', 'data-structures', 'design'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export class MinStack {
  constructor() {
    // Initialize your data structures
  }

  push(val: number): void {}

  pop(): number {
    return 0;
  }

  top(): number {
    return 0;
  }

  getMin(): number {
    return 0;
  }
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export class MinStack {
  private stack: number[] = [];
  private mins: number[] = [];

  push(val: number): void {
    this.stack.push(val);
    const min = this.mins.length === 0
      ? val
      : Math.min(val, this.mins[this.mins.length - 1]);
    this.mins.push(min);
  }

  pop(): number {
    this.mins.pop();
    return this.stack.pop()!;
  }

  top(): number {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.mins[this.mins.length - 1];
  }
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'solution.test.ts',
          fileName: 'solution.test.ts',
          content: `import { MinStack } from "./solution";

test("push, getMin, pop sequence", () => {
  const s = new MinStack();
  s.push(-2);
  s.push(0);
  s.push(-3);
  expect(s.getMin()).toBe(-3);
  s.pop();
  expect(s.top()).toBe(0);
  expect(s.getMin()).toBe(-2);
});

test("single element", () => {
  const s = new MinStack();
  s.push(42);
  expect(s.top()).toBe(42);
  expect(s.getMin()).toBe(42);
});

test("ascending push", () => {
  const s = new MinStack();
  s.push(1);
  s.push(2);
  s.push(3);
  expect(s.getMin()).toBe(1);
  s.pop();
  expect(s.getMin()).toBe(1);
});

test("descending push", () => {
  const s = new MinStack();
  s.push(3);
  s.push(2);
  s.push(1);
  expect(s.getMin()).toBe(1);
  s.pop();
  expect(s.getMin()).toBe(2);
});

test("duplicate minimums survive pop", () => {
  const s = new MinStack();
  s.push(1);
  s.push(1);
  expect(s.getMin()).toBe(1);
  s.pop();
  expect(s.getMin()).toBe(1);
});
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Binary Search ────────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: goCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Binary Search',
        description:
          'Implement binary search on a sorted integer slice. Return the index of the target, or -1 if it is not present.\n\n```\nnums = [-1, 0, 3, 5, 9, 12], target = 9   →  4\nnums = [-1, 0, 3, 5, 9, 12], target = 2   →  -1\n```\n\nYour solution must run in O(log n) time.',
        difficulty: 'easy',
        language: 'go',
        hints: [
          'Keep two pointers, left and right, representing the current search range.',
          'Compute mid as left + (right - left) / 2 to avoid overflow.',
          'Narrow the range by half each iteration until you find the target or the range is empty.',
        ],
        isValidated: true,
        tags: ['binary-search', 'arrays', 'data-structures', 'algorithms'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.go',
          fileName: 'solution.go',
          content: `package solution

// BinarySearch returns the index of target in a sorted slice,
// or -1 if not found.
func BinarySearch(nums []int, target int) int {
	// Your code here
	return -1
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.go',
          fileName: 'solution.go',
          content: `package solution

func BinarySearch(nums []int, target int) int {
	lo, hi := 0, len(nums)-1
	for lo <= hi {
		mid := lo + (hi-lo)/2
		switch {
		case nums[mid] == target:
			return mid
		case nums[mid] < target:
			lo = mid + 1
		default:
			hi = mid - 1
		}
	}
	return -1
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'solution_test.go',
          fileName: 'solution_test.go',
          content: `package solution

import "testing"

func TestFound(t *testing.T) {
	if got := BinarySearch([]int{-1, 0, 3, 5, 9, 12}, 9); got != 4 {
		t.Errorf("expected 4, got %d", got)
	}
}

func TestNotFound(t *testing.T) {
	if got := BinarySearch([]int{-1, 0, 3, 5, 9, 12}, 2); got != -1 {
		t.Errorf("expected -1, got %d", got)
	}
}

func TestFirst(t *testing.T) {
	if got := BinarySearch([]int{1, 2, 3, 4, 5}, 1); got != 0 {
		t.Errorf("expected 0, got %d", got)
	}
}

func TestLast(t *testing.T) {
	if got := BinarySearch([]int{1, 2, 3, 4, 5}, 5); got != 4 {
		t.Errorf("expected 4, got %d", got)
	}
}

func TestSingle(t *testing.T) {
	if got := BinarySearch([]int{7}, 7); got != 0 {
		t.Errorf("expected 0, got %d", got)
	}
}

func TestEmpty(t *testing.T) {
	if got := BinarySearch([]int{}, 1); got != -1 {
		t.Errorf("expected -1, got %d", got)
	}
}
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Flatten Nested Array ─────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Flatten Nested Array',
        description:
          'Take a deeply nested array and return a new flat array with all values at the top level. Do not use `Array.prototype.flat()`.\n\n```\n[1, [2, [3, [4]], 5]]   →  [1, 2, 3, 4, 5]\n[[1, 2], [3, [4, 5]]]   →  [1, 2, 3, 4, 5]\n[1, 2, 3]               →  [1, 2, 3]\n```',
        difficulty: 'medium',
        language: 'javascript',
        hints: [
          'Recursion fits naturally: if an element is an array, flatten it; otherwise keep it.',
          'Array.isArray() distinguishes arrays from values.',
          'Build a result array and spread in the recursive results.',
        ],
        isValidated: true,
        tags: ['arrays', 'recursion', 'data-structures'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.js',
          fileName: 'solution.js',
          content: `/**
 * Flatten a deeply nested array without using Array.prototype.flat().
 * @param {Array} arr
 * @returns {Array}
 */
function flatten(arr) {
  // Your code here
}

module.exports = { flatten };
`,
          sortOrder: 0,
        },
        {
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

test("empty", () => {
  expect(flatten([])).toEqual([]);
});

test("deeply nested single value", () => {
  expect(flatten([[[[[[1]]]]]])).toEqual([1]);
});
`,
          sortOrder: 0,
        },
      ]
    );

    // ── LRU Cache ────────────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'LRU Cache',
        description:
          'Implement a Least Recently Used (LRU) cache with a fixed capacity.\n\n- `get(key)` — return the value if it exists, otherwise -1. Marks the key as recently used.\n- `put(key, value)` — insert or update. If the cache exceeds capacity, evict the *least recently used* key before inserting.\n\nBoth operations must run in O(1) average time.\n\n```\ncache = new LRUCache(2)\ncache.put(1, 10)\ncache.put(2, 20)\ncache.get(1)       // 10\ncache.put(3, 30)   // evicts key 2\ncache.get(2)       // -1\n```',
        difficulty: 'hard',
        language: 'typescript',
        hints: [
          'A Map alone gives O(1) lookup but does not track ordering. You need a structure that maintains insertion/access order.',
          'A doubly linked list lets you move any node to the front in O(1) and remove the tail in O(1). Combine it with a Map for key → node lookup.',
          'JavaScript\'s built-in Map iterates in insertion order — you can also exploit this by deleting and re-inserting a key to "refresh" its position.',
        ],
        isValidated: true,
        tags: ['data-structures', 'design', 'hash-map'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export class LRUCache {
  constructor(capacity: number) {
    // Your code here
  }

  get(key: number): number {
    return -1;
  }

  put(key: number, value: number): void {
    // Your code here
  }
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key)!;
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first key in Map)
      const lruKey = this.cache.keys().next().value!;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'solution.test.ts',
          fileName: 'solution.test.ts',
          content: `import { LRUCache } from "./solution";

test("basic eviction", () => {
  const c = new LRUCache(2);
  c.put(1, 10);
  c.put(2, 20);
  expect(c.get(1)).toBe(10);
  c.put(3, 30); // evicts key 2
  expect(c.get(2)).toBe(-1);
  expect(c.get(3)).toBe(30);
});

test("update existing key does not evict", () => {
  const c = new LRUCache(2);
  c.put(1, 1);
  c.put(2, 2);
  c.put(1, 10); // update, not new entry
  c.put(3, 3);  // evicts key 2 (1 was refreshed)
  expect(c.get(1)).toBe(10);
  expect(c.get(2)).toBe(-1);
  expect(c.get(3)).toBe(3);
});

test("get refreshes access order", () => {
  const c = new LRUCache(2);
  c.put(1, 1);
  c.put(2, 2);
  c.get(1);     // refresh key 1
  c.put(3, 3);  // should evict key 2, not 1
  expect(c.get(1)).toBe(1);
  expect(c.get(2)).toBe(-1);
});

test("capacity of one", () => {
  const c = new LRUCache(1);
  c.put(1, 1);
  c.put(2, 2);
  expect(c.get(1)).toBe(-1);
  expect(c.get(2)).toBe(2);
});

test("miss returns -1", () => {
  const c = new LRUCache(3);
  expect(c.get(99)).toBe(-1);
});
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Validate Binary Search Tree ──────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Validate BST',
        description:
          'Determine whether a binary tree is a valid binary search tree (BST).\n\nA BST is valid when:\n- Every node in the left subtree has a value **strictly less** than the node.\n- Every node in the right subtree has a value **strictly greater** than the node.\n- Both subtrees are also valid BSTs.\n\n```\n    2\n   / \\\n  1   3      →  True\n\n    5\n   / \\\n  1   4\n     / \\\n    3   6   →  False  (3 < 5 but is in the right subtree)\n```',
        difficulty: 'medium',
        language: 'python',
        hints: [
          'Checking only parent-child relationships is not enough — a node deep in the right subtree could violate an ancestor\'s constraint.',
          'Pass down valid bounds (min, max) as you recurse. Each node must fall within its allowed range.',
          'For the left child, update the upper bound. For the right child, update the lower bound.',
        ],
        isValidated: true,
        tags: ['trees', 'recursion', 'data-structures'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def is_valid_bst(root: TreeNode | None) -> bool:
    """Return True if the binary tree rooted at 'root' is a valid BST."""
    pass
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def is_valid_bst(root: TreeNode | None) -> bool:
    def check(node, lo, hi):
        if node is None:
            return True
        if node.val <= lo or node.val >= hi:
            return False
        return check(node.left, lo, node.val) and check(node.right, node.val, hi)

    return check(root, float("-inf"), float("inf"))
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import TreeNode, is_valid_bst

def test_valid_simple():
    #   2
    #  / \\
    # 1   3
    root = TreeNode(2, TreeNode(1), TreeNode(3))
    assert is_valid_bst(root) is True

def test_invalid_right_subtree():
    #     5
    #    / \\
    #   1   4
    #      / \\
    #     3   6
    root = TreeNode(5, TreeNode(1), TreeNode(4, TreeNode(3), TreeNode(6)))
    assert is_valid_bst(root) is False

def test_single_node():
    assert is_valid_bst(TreeNode(1)) is True

def test_empty():
    assert is_valid_bst(None) is True

def test_left_heavy():
    root = TreeNode(3, TreeNode(2, TreeNode(1)))
    assert is_valid_bst(root) is True

def test_equal_values_invalid():
    # equal values violate strict ordering
    root = TreeNode(2, TreeNode(2), TreeNode(3))
    assert is_valid_bst(root) is False

def test_grandchild_violation():
    #   3
    #  / \\
    # 1   5
    #    /
    #   2   ← violates: 2 < 3, but is in right subtree
    root = TreeNode(3, TreeNode(1), TreeNode(5, TreeNode(2)))
    assert is_valid_bst(root) is False
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Queue from Two Stacks ────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Queue Using Two Stacks',
        description:
          'Implement a FIFO queue using only two stacks (Python lists with `append` / `pop`).\n\nSupport these operations:\n- `enqueue(val)` — add to the back\n- `dequeue()` — remove and return the front element\n- `peek()` — return the front element without removing\n- `is_empty()` — return whether the queue is empty\n\n```\nq = MyQueue()\nq.enqueue(1)\nq.enqueue(2)\nq.peek()     # 1\nq.dequeue()  # 1\nq.dequeue()  # 2\nq.is_empty() # True\n```\n\nAim for amortized O(1) per operation.',
        difficulty: 'easy',
        language: 'python',
        hints: [
          'One stack handles incoming items (push stack), the other serves outgoing items (pop stack).',
          'When the pop stack is empty and you need to dequeue, pour everything from the push stack into the pop stack — this reverses the order.',
          'Each element moves between stacks at most once, giving amortized O(1).',
        ],
        isValidated: true,
        tags: ['stack', 'data-structures', 'design'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `class MyQueue:
    def __init__(self):
        pass

    def enqueue(self, val: int) -> None:
        pass

    def dequeue(self) -> int:
        pass

    def peek(self) -> int:
        pass

    def is_empty(self) -> bool:
        pass
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `class MyQueue:
    def __init__(self):
        self._inbox = []
        self._outbox = []

    def enqueue(self, val: int) -> None:
        self._inbox.append(val)

    def _transfer(self):
        if not self._outbox:
            while self._inbox:
                self._outbox.append(self._inbox.pop())

    def dequeue(self) -> int:
        self._transfer()
        return self._outbox.pop()

    def peek(self) -> int:
        self._transfer()
        return self._outbox[-1]

    def is_empty(self) -> bool:
        return not self._inbox and not self._outbox
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import MyQueue

def test_fifo_order():
    q = MyQueue()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    assert q.dequeue() == 1
    assert q.dequeue() == 2
    assert q.dequeue() == 3

def test_peek():
    q = MyQueue()
    q.enqueue(10)
    q.enqueue(20)
    assert q.peek() == 10
    assert q.dequeue() == 10
    assert q.peek() == 20

def test_interleaved():
    q = MyQueue()
    q.enqueue(1)
    q.enqueue(2)
    assert q.dequeue() == 1
    q.enqueue(3)
    assert q.dequeue() == 2
    assert q.dequeue() == 3

def test_is_empty():
    q = MyQueue()
    assert q.is_empty() is True
    q.enqueue(1)
    assert q.is_empty() is False
    q.dequeue()
    assert q.is_empty() is True
`,
          sortOrder: 0,
        },
      ]
    );

    // =========================================================================
    //  WEB FUNDAMENTALS
    // =========================================================================

    // ── Implement Debounce ───────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Implement Debounce',
        description:
          'Build a `debounce` function that delays calling `fn` until `delay` ms have passed since the last invocation. If called again before the delay elapses, the timer resets.\n\n```ts\nconst log = debounce((msg: string) => console.log(msg), 300);\nlog("a");  // timer starts\nlog("b");  // resets timer\n// 300 ms later → "b" is logged, "a" is never called\n```\n\nThis pattern is everywhere in frontend code — search inputs, resize handlers, auto-save.',
        difficulty: 'medium',
        language: 'typescript',
        hints: [
          'You need a closure that holds a reference to a timer ID.',
          'Each call clears the previous timer with clearTimeout and starts a new one with setTimeout.',
          'Return a wrapper function that captures the timer in its closure scope.',
        ],
        isValidated: true,
        tags: ['closures', 'timers', 'javascript-patterns'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `/**
 * Returns a debounced version of fn that waits \`delay\` ms
 * after the last call before executing.
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

test("passes latest arguments", () => {
  const fn = jest.fn();
  const debounced = debounce(fn, 100);

  debounced("a");
  debounced("b");
  debounced("c");
  jest.advanceTimersByTime(100);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("c");
});

test("independent instances", () => {
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const d1 = debounce(fn1, 100);
  const d2 = debounce(fn2, 200);

  d1();
  d2();
  jest.advanceTimersByTime(100);
  expect(fn1).toHaveBeenCalledTimes(1);
  expect(fn2).not.toHaveBeenCalled();
  jest.advanceTimersByTime(100);
  expect(fn2).toHaveBeenCalledTimes(1);
});
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Promise.all from Scratch ─────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Build Promise.all',
        description:
          'Implement your own version of `Promise.all`. It takes an array of promises and returns a single promise that:\n\n- Resolves with an array of results (in the same order as the input) when **all** promises resolve.\n- Rejects immediately when **any** promise rejects, with that rejection reason.\n\n```ts\nconst results = await promiseAll([\n  Promise.resolve(1),\n  Promise.resolve(2),\n  Promise.resolve(3),\n]);\n// results → [1, 2, 3]\n```\n\nHandle edge cases: empty arrays, mixed resolved/rejected promises, and non-promise values.',
        difficulty: 'medium',
        language: 'typescript',
        hints: [
          'Return a new Promise. Inside its executor, iterate over the input and attach .then handlers.',
          'You need a counter to track how many promises have resolved. When the count equals the input length, resolve the outer promise.',
          'Store results by index, not push order, to preserve the original ordering.',
        ],
        isValidated: true,
        tags: ['promises', 'async', 'javascript-patterns'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `/**
 * Re-implement Promise.all from scratch.
 * Do not use the built-in Promise.all.
 */
export function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  // Your code here
  return Promise.resolve([]);
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `export function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    const results: T[] = new Array(promises.length);
    let resolved = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then((val) => {
          results[i] = val;
          resolved++;
          if (resolved === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'solution.test.ts',
          fileName: 'solution.test.ts',
          content: `import { promiseAll } from "./solution";

test("all resolve", async () => {
  const result = await promiseAll([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
  ]);
  expect(result).toEqual([1, 2, 3]);
});

test("preserves order even with varying delays", async () => {
  const result = await promiseAll([
    new Promise((r) => setTimeout(() => r("slow"), 50)),
    Promise.resolve("fast"),
  ]);
  expect(result).toEqual(["slow", "fast"]);
});

test("rejects on first failure", async () => {
  await expect(
    promiseAll([
      Promise.resolve(1),
      Promise.reject(new Error("fail")),
      Promise.resolve(3),
    ])
  ).rejects.toThrow("fail");
});

test("empty array resolves immediately", async () => {
  const result = await promiseAll([]);
  expect(result).toEqual([]);
});

test("single promise", async () => {
  const result = await promiseAll([Promise.resolve(42)]);
  expect(result).toEqual([42]);
});
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Event Emitter ────────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Event Emitter',
        description:
          'Build a simple event emitter (pub/sub) that supports:\n\n- `on(event, listener)` — register a callback for an event. Returns an unsubscribe function.\n- `emit(event, ...args)` — call all listeners for that event with the given arguments.\n- `once(event, listener)` — like `on`, but the listener fires at most once.\n\n```ts\nconst emitter = new EventEmitter();\nconst off = emitter.on("data", (x) => console.log(x));\nemitter.emit("data", 42);  // logs 42\noff();                       // unsubscribe\nemitter.emit("data", 99);  // nothing happens\n```\n\nThis pattern underpins most event-driven architectures — Node.js EventEmitter, DOM events, state management libraries.',
        difficulty: 'medium',
        language: 'typescript',
        hints: [
          'Store listeners in a Map<string, Set<Function>> or Map<string, Function[]>.',
          'The unsubscribe function returned by on() should remove that specific listener from the set.',
          'For once(), wrap the listener in a function that calls the original and then unsubscribes itself.',
        ],
        isValidated: true,
        tags: ['javascript-patterns', 'closures', 'design'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `type Listener = (...args: any[]) => void;

export class EventEmitter {
  /**
   * Register a listener for an event.
   * Returns a function that removes this listener.
   */
  on(event: string, listener: Listener): () => void {
    // Your code here
    return () => {};
  }

  /** Register a listener that fires at most once. */
  once(event: string, listener: Listener): () => void {
    // Your code here
    return () => {};
  }

  /** Call all listeners registered for the event. */
  emit(event: string, ...args: any[]): void {
    // Your code here
  }
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.ts',
          fileName: 'solution.ts',
          content: `type Listener = (...args: any[]) => void;

export class EventEmitter {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  once(event: string, listener: Listener): () => void {
    const wrapper: Listener = (...args) => {
      off();
      listener(...args);
    };
    const off = this.on(event, wrapper);
    return off;
  }

  emit(event: string, ...args: any[]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      fn(...args);
    }
  }
}
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'solution.test.ts',
          fileName: 'solution.test.ts',
          content: `import { EventEmitter } from "./solution";

test("on and emit", () => {
  const emitter = new EventEmitter();
  const calls: number[] = [];
  emitter.on("data", (x: number) => calls.push(x));

  emitter.emit("data", 1);
  emitter.emit("data", 2);
  expect(calls).toEqual([1, 2]);
});

test("unsubscribe", () => {
  const emitter = new EventEmitter();
  const calls: number[] = [];
  const off = emitter.on("data", (x: number) => calls.push(x));

  emitter.emit("data", 1);
  off();
  emitter.emit("data", 2);
  expect(calls).toEqual([1]);
});

test("once fires exactly once", () => {
  const emitter = new EventEmitter();
  const fn = jest.fn();
  emitter.once("ping", fn);

  emitter.emit("ping");
  emitter.emit("ping");
  expect(fn).toHaveBeenCalledTimes(1);
});

test("multiple listeners on same event", () => {
  const emitter = new EventEmitter();
  const a = jest.fn();
  const b = jest.fn();
  emitter.on("x", a);
  emitter.on("x", b);

  emitter.emit("x", 42);
  expect(a).toHaveBeenCalledWith(42);
  expect(b).toHaveBeenCalledWith(42);
});

test("emit unknown event does nothing", () => {
  const emitter = new EventEmitter();
  expect(() => emitter.emit("nope")).not.toThrow();
});

test("unsubscribe from once before firing", () => {
  const emitter = new EventEmitter();
  const fn = jest.fn();
  const off = emitter.once("e", fn);
  off();
  emitter.emit("e");
  expect(fn).not.toHaveBeenCalled();
});
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Deep Equal ───────────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: nodeCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Deep Equal',
        description:
          'Implement a `deepEqual(a, b)` function that performs a deep structural comparison of two values.\n\nIt should handle:\n- Primitives (number, string, boolean, null, undefined)\n- Plain objects (compare keys and values recursively)\n- Arrays (compare length and elements recursively)\n- Nested combinations of all the above\n\n```js\ndeepEqual({ a: [1, 2] }, { a: [1, 2] })  // true\ndeepEqual({ a: 1 }, { a: "1" })           // false\ndeepEqual([1, [2, 3]], [1, [2, 3]])       // true\n```\n\nYou do not need to handle `Date`, `RegExp`, `Map`, `Set`, or circular references.',
        difficulty: 'medium',
        language: 'javascript',
        hints: [
          'Start with the base case: if a === b (strict equality), they are equal.',
          'If both are objects (and not null), compare their keys. They must have the same set of keys.',
          'Recurse on each key\'s value. Arrays are objects too, so this handles both.',
        ],
        isValidated: true,
        tags: ['recursion', 'javascript-patterns'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.js',
          fileName: 'solution.js',
          content: `/**
 * Deep structural equality check.
 * Handles primitives, plain objects, and arrays.
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function deepEqual(a, b) {
  // Your code here
}

module.exports = { deepEqual };
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.js',
          fileName: 'solution.js',
          content: `function deepEqual(a, b) {
  if (a === b) return true;

  if (
    a === null || b === null ||
    typeof a !== "object" || typeof b !== "object"
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

module.exports = { deepEqual };
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'solution.test.js',
          fileName: 'solution.test.js',
          content: `const { deepEqual } = require("./solution");

test("equal objects", () => {
  expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
});

test("nested objects", () => {
  expect(deepEqual({ a: { b: [1, 2] } }, { a: { b: [1, 2] } })).toBe(true);
});

test("different values", () => {
  expect(deepEqual({ a: 1 }, { a: "1" })).toBe(false);
});

test("different keys", () => {
  expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
});

test("arrays", () => {
  expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
  expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
});

test("primitives", () => {
  expect(deepEqual(42, 42)).toBe(true);
  expect(deepEqual("abc", "abc")).toBe(true);
  expect(deepEqual(null, null)).toBe(true);
  expect(deepEqual(null, undefined)).toBe(false);
});

test("empty structures", () => {
  expect(deepEqual({}, {})).toBe(true);
  expect(deepEqual([], [])).toBe(true);
  expect(deepEqual({}, [])).toBe(false);
});
`,
          sortOrder: 0,
        },
      ]
    );

    // =========================================================================
    //  PYTHON ESSENTIALS
    // =========================================================================

    // ── FizzBuzz ──────────────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'FizzBuzz',
        description:
          'Return a list of strings from 1 to `n` following these rules:\n\n- Divisible by 3 → `"Fizz"`\n- Divisible by 5 → `"Buzz"`\n- Divisible by both → `"FizzBuzz"`\n- Otherwise → the number as a string\n\n```\nn = 5   →  ["1", "2", "Fizz", "4", "Buzz"]\nn = 15  →  [..., "14", "FizzBuzz"]\n```\n\nA deceptively simple problem — getting the order of conditions right matters.',
        difficulty: 'beginner',
        language: 'python',
        hints: [
          'Check divisibility by 15 (both 3 and 5) before checking 3 or 5 individually.',
          'Use the modulo operator (%) to test divisibility.',
          'Build a list by iterating from 1 to n inclusive.',
        ],
        isValidated: true,
        tags: ['loops', 'conditionals', 'beginner'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def fizzbuzz(n: int) -> list[str]:
    """Return the FizzBuzz sequence from 1 to n."""
    pass
`,
          sortOrder: 0,
        },
        {
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
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import fizzbuzz

def test_small():
    assert fizzbuzz(5) == ["1", "2", "Fizz", "4", "Buzz"]

def test_fizzbuzz_at_15():
    result = fizzbuzz(15)
    assert result[14] == "FizzBuzz"
    assert result[2] == "Fizz"
    assert result[4] == "Buzz"

def test_length():
    assert len(fizzbuzz(100)) == 100

def test_single():
    assert fizzbuzz(1) == ["1"]
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Caesar Cipher ────────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Caesar Cipher',
        description:
          'Implement the Caesar cipher — shift every letter in a string by `k` positions in the alphabet, wrapping around from z to a.\n\n- Preserve case: uppercase letters stay uppercase, lowercase stay lowercase.\n- Non-letter characters (spaces, digits, punctuation) are left unchanged.\n\n```\nencode("Hello, World!", 3)   →  "Khoor, Zruog!"\nencode("abc", 1)             →  "bcd"\nencode("xyz", 3)             →  "abc"\n```\n\nAlso implement `decode` which shifts in the opposite direction.',
        difficulty: 'easy',
        language: 'python',
        hints: [
          'Use ord() and chr() to convert between characters and their ASCII codes.',
          'For a lowercase letter: shifted = (ord(c) - ord("a") + k) % 26 + ord("a")',
          'Decoding is just encoding with a negative shift, or equivalently shift of (26 - k).',
        ],
        isValidated: true,
        tags: ['loops', 'beginner', 'python-patterns'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def encode(text: str, shift: int) -> str:
    """Shift every letter by 'shift' positions. Preserve case, ignore non-letters."""
    pass


def decode(text: str, shift: int) -> str:
    """Reverse a Caesar cipher with the given shift."""
    pass
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def _shift_char(c: str, shift: int) -> str:
    if c.isalpha():
        base = ord("A") if c.isupper() else ord("a")
        return chr((ord(c) - base + shift) % 26 + base)
    return c


def encode(text: str, shift: int) -> str:
    return "".join(_shift_char(c, shift) for c in text)


def decode(text: str, shift: int) -> str:
    return encode(text, -shift)
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import encode, decode

def test_encode_basic():
    assert encode("abc", 1) == "bcd"

def test_encode_wrap():
    assert encode("xyz", 3) == "abc"

def test_encode_preserves_case():
    assert encode("Hello, World!", 3) == "Khoor, Zruog!"

def test_encode_non_letters_unchanged():
    assert encode("123 !@#", 5) == "123 !@#"

def test_decode_reverses_encode():
    original = "The quick brown fox"
    assert decode(encode(original, 7), 7) == original

def test_full_rotation():
    assert encode("abc", 26) == "abc"

def test_negative_shift():
    assert encode("bcd", -1) == "abc"
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Matrix Spiral ────────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Spiral Matrix',
        description:
          'Given an m × n matrix, return all elements in spiral order — starting from the top-left, going right, then down, then left, then up, and repeating inward.\n\n```\n[[1, 2, 3],\n [4, 5, 6],\n [7, 8, 9]]\n\n→  [1, 2, 3, 6, 9, 8, 7, 4, 5]\n```\n\n```\n[[1, 2, 3, 4],\n [5, 6, 7, 8],\n [9,10,11,12]]\n\n→  [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]\n```',
        difficulty: 'medium',
        language: 'python',
        hints: [
          'Track four boundaries: top, bottom, left, right. Shrink them inward after traversing each edge.',
          'Traverse right across the top row, then down the right column, then left across the bottom row, then up the left column.',
          'After each traversal, check if boundaries have crossed — non-square matrices can finish mid-spiral.',
        ],
        isValidated: true,
        tags: ['arrays', 'loops', 'python-patterns'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def spiral_order(matrix: list[list[int]]) -> list[int]:
    """Return elements of the matrix in spiral order."""
    pass
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def spiral_order(matrix: list[list[int]]) -> list[int]:
    if not matrix or not matrix[0]:
        return []

    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1

    while top <= bottom and left <= right:
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        top += 1

        for row in range(top, bottom + 1):
            result.append(matrix[row][right])
        right -= 1

        if top <= bottom:
            for col in range(right, left - 1, -1):
                result.append(matrix[bottom][col])
            bottom -= 1

        if left <= right:
            for row in range(bottom, top - 1, -1):
                result.append(matrix[row][left])
            left += 1

    return result
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import spiral_order

def test_3x3():
    matrix = [[1,2,3],[4,5,6],[7,8,9]]
    assert spiral_order(matrix) == [1,2,3,6,9,8,7,4,5]

def test_3x4():
    matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]
    assert spiral_order(matrix) == [1,2,3,4,8,12,11,10,9,5,6,7]

def test_single_row():
    assert spiral_order([[1,2,3]]) == [1,2,3]

def test_single_column():
    assert spiral_order([[1],[2],[3]]) == [1,2,3]

def test_1x1():
    assert spiral_order([[42]]) == [42]

def test_empty():
    assert spiral_order([]) == []

def test_2x2():
    assert spiral_order([[1,2],[3,4]]) == [1,2,4,3]
`,
          sortOrder: 0,
        },
      ]
    );

    // ── Memoize Decorator ────────────────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Memoize Decorator',
        description:
          'Write a `memoize` decorator that caches the return value of a function based on its arguments. If the function is called again with the same arguments, return the cached result instead of recomputing.\n\n```python\n@memoize\ndef add(a, b):\n    print("computing")  # only prints once per unique (a, b)\n    return a + b\n\nadd(1, 2)  # prints "computing", returns 3\nadd(1, 2)  # returns 3 (cached, no print)\nadd(3, 4)  # prints "computing", returns 7\n```\n\nYour decorator should work with any number of positional arguments. You can assume all arguments are hashable.',
        difficulty: 'medium',
        language: 'python',
        hints: [
          'A decorator is a function that takes a function and returns a wrapper function.',
          'Use a dictionary to store results keyed by the arguments tuple.',
          'functools.wraps preserves the original function\'s name and docstring on the wrapper.',
        ],
        isValidated: true,
        tags: ['decorators', 'python-patterns', 'closures'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def memoize(fn):
    """
    Decorator that caches return values based on positional arguments.
    Assumes all arguments are hashable.
    """
    pass
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `from functools import wraps

def memoize(fn):
    cache = {}

    @wraps(fn)
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]

    wrapper.cache = cache
    return wrapper
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import memoize

def test_caches_result():
    call_count = 0

    @memoize
    def add(a, b):
        nonlocal call_count
        call_count += 1
        return a + b

    assert add(1, 2) == 3
    assert add(1, 2) == 3
    assert call_count == 1

def test_different_args_computed_separately():
    call_count = 0

    @memoize
    def square(n):
        nonlocal call_count
        call_count += 1
        return n * n

    assert square(3) == 9
    assert square(4) == 16
    assert square(3) == 9
    assert call_count == 2

def test_no_args():
    call_count = 0

    @memoize
    def greet():
        nonlocal call_count
        call_count += 1
        return "hello"

    assert greet() == "hello"
    assert greet() == "hello"
    assert call_count == 1

def test_preserves_function_name():
    @memoize
    def my_func():
        return 42

    assert my_func.__name__ == "my_func"

def test_recursive_fibonacci():
    @memoize
    def fib(n):
        if n < 2:
            return n
        return fib(n - 1) + fib(n - 2)

    assert fib(10) == 55
    assert fib(30) == 832040
`,
          sortOrder: 0,
        },
      ]
    );

    // ── List Comprehension Exercises ─────────────────────────────────────────
    await seedExercise(
      tx,
      {
        origin: 'platform',
        environmentId: pythonCore.id,
        llmModel: 'seed',
        llmParameters: {},
        title: 'Word Frequency Counter',
        description:
          'Build a function that takes a string of text and returns a dictionary mapping each word to the number of times it appears. Words should be compared case-insensitively, and punctuation attached to words should be stripped.\n\n```python\ncount_words("the cat sat on the mat")\n# {"the": 2, "cat": 1, "sat": 1, "on": 1, "mat": 1}\n\ncount_words("Hello, hello! HELLO.")\n# {"hello": 3}\n```\n\nAlso implement `top_n(text, n)` which returns the n most frequent words as a list of `(word, count)` tuples, sorted by count descending.',
        difficulty: 'easy',
        language: 'python',
        hints: [
          'str.lower() normalizes case. Use a regex or str.strip() to remove punctuation from each word.',
          'collections.Counter is purpose-built for this — but you can also use a plain dict.',
          'Counter.most_common(n) gives the top n directly.',
        ],
        isValidated: true,
        tags: ['comprehensions', 'python-patterns', 'beginner'],
      },
      [
        {
          fileType: 'starter',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `def count_words(text: str) -> dict[str, int]:
    """Count occurrences of each word (case-insensitive, punctuation stripped)."""
    pass


def top_n(text: str, n: int) -> list[tuple[str, int]]:
    """Return the n most frequent words as (word, count) tuples, sorted by count descending."""
    pass
`,
          sortOrder: 0,
        },
        {
          fileType: 'solution',
          filePath: 'solution.py',
          fileName: 'solution.py',
          content: `import re
from collections import Counter

def count_words(text: str) -> dict[str, int]:
    words = re.findall(r"[a-zA-Z']+", text.lower())
    return dict(Counter(words))


def top_n(text: str, n: int) -> list[tuple[str, int]]:
    words = re.findall(r"[a-zA-Z']+", text.lower())
    return Counter(words).most_common(n)
`,
          sortOrder: 0,
        },
        {
          fileType: 'test',
          filePath: 'test_solution.py',
          fileName: 'test_solution.py',
          content: `from solution import count_words, top_n

def test_basic_count():
    result = count_words("the cat sat on the mat")
    assert result["the"] == 2
    assert result["cat"] == 1
    assert len(result) == 5

def test_case_insensitive():
    result = count_words("Hello hello HELLO")
    assert result == {"hello": 3}

def test_punctuation_stripped():
    result = count_words("Hello, world! Hello.")
    assert result == {"hello": 2, "world": 1}

def test_empty_string():
    assert count_words("") == {}

def test_top_n():
    text = "a a a b b c"
    result = top_n(text, 2)
    assert result[0] == ("a", 3)
    assert result[1] == ("b", 2)

def test_top_n_more_than_available():
    result = top_n("hello world", 5)
    assert len(result) == 2
`,
          sortOrder: 0,
        },
      ]
    );

    const exerciseCount = 20;
    console.log('✅ Exercises seeded');
    console.log(`
Seeded:
  - 3 environments (python_core, node_core, go_core)
  - ${exerciseCount} exercises:

  Interview Prep:
    1. Two Sum (Python, easy)
    2. Valid Palindrome (TypeScript, easy)
    3. Group Anagrams (Python, medium)
    4. Merge Intervals (TypeScript, medium)
    5. Longest Unique Substring (Python, medium)
    6. Product Except Self (TypeScript, medium)

  Data Structures & Algorithms:
    7.  Reverse a Linked List (Python, medium)
    8.  Min Stack (TypeScript, medium)
    9.  Binary Search (Go, easy)
    10. Flatten Nested Array (JavaScript, medium)
    11. LRU Cache (TypeScript, hard)
    12. Validate BST (Python, medium)
    13. Queue Using Two Stacks (Python, easy)

  Web Fundamentals:
    14. Implement Debounce (TypeScript, medium)
    15. Build Promise.all (TypeScript, medium)
    16. Event Emitter (TypeScript, medium)
    17. Deep Equal (JavaScript, medium)

  Python Essentials:
    18. FizzBuzz (Python, beginner)
    19. Caesar Cipher (Python, easy)
    20. Spiral Matrix (Python, medium)
    21. Memoize Decorator (Python, medium)
    22. Word Frequency Counter (Python, easy)
    `);
  }); // end transaction

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
