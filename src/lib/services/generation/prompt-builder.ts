/**
 * Prompt Builder
 *
 * Assembles the full prompt sent to Claude for exercise generation.
 * Handles language-specific instructions, output format specification,
 * and optional prompt template integration.
 */

import type { PromptTemplateRecord } from './generation.types';

// ============================================================
// Types
// ============================================================

interface PromptBuilderInput {
  userPrompt: string;
  language: string;
  difficulty: string;
  exerciseType?: string;
  template?: PromptTemplateRecord | null;
  retryContext?: RetryContext;
}

interface RetryContext {
  attempt: number;
  previousError: string;
  failedTests?: string;
}

// ============================================================
// Language-specific config
// ============================================================

interface LanguageConfig {
  displayName: string;
  testFramework: string;
  fileExtension: string;
  testFilePattern: string;
  starterFileName: string;
  solutionFileName: string;
  testFileName: string;
  importStyle: string;
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  python: {
    displayName: 'Python',
    testFramework: 'pytest',
    fileExtension: '.py',
    testFilePattern: 'test_*.py',
    starterFileName: 'solution.py',
    solutionFileName: 'solution.py',
    testFileName: 'test_solution.py',
    importStyle: 'from solution import function_name',
  },
  javascript: {
    displayName: 'JavaScript',
    testFramework: 'Vitest',
    fileExtension: '.mjs',
    testFilePattern: '*.test.mjs',
    starterFileName: 'solution.mjs',
    solutionFileName: 'solution.mjs',
    testFileName: 'solution.test.mjs',
    importStyle: 'import { functionName } from "../submission/solution.mjs"',
  },
  typescript: {
    displayName: 'TypeScript',
    testFramework: 'Vitest',
    fileExtension: '.ts',
    testFilePattern: '*.test.ts',
    starterFileName: 'solution.ts',
    solutionFileName: 'solution.ts',
    testFileName: 'solution.test.ts',
    importStyle: 'import { functionName } from "../submission/solution"',
  },
};

// ============================================================
// Builder
// ============================================================

export function buildGenerationPrompt(input: PromptBuilderInput): string {
  const config = LANGUAGE_CONFIGS[input.language];
  if (!config) {
    throw new Error(`Unsupported language: ${input.language}`);
  }

  // Use DB template if available, otherwise use the default
  const baseInstructions = input.template?.templateText ?? getDefaultTemplate();

  const prompt = `${baseInstructions}

## Exercise Request

**User's prompt:** ${input.userPrompt}
**Language:** ${config.displayName}
**Difficulty:** ${input.difficulty}
${input.exerciseType ? `**Exercise type:** ${input.exerciseType}` : ''}

## Language-Specific Requirements

- Write all code in ${config.displayName}
- Test framework: ${config.testFramework}
- Starter file name: \`${config.starterFileName}\`
- Solution file name: \`${config.solutionFileName}\`
- Test file name: \`${config.testFileName}\`
- In test files, import from the submission directory: \`${config.importStyle}\`
- File extensions: \`${config.fileExtension}\`

## Difficulty Guidelines

${getDifficultyGuidelines(input.difficulty)}

## Output Format

Respond with ONLY a JSON object (no markdown fences, no preamble) matching this exact structure:

{
  "title": "Short, descriptive title",
  "description": "Markdown description explaining the problem. Include:\\n- What the function/module should do\\n- Input/output examples\\n- Constraints or edge cases to handle",
  "hints": ["First hint (gentle nudge)", "Second hint (more specific)", "Third hint (nearly gives it away)"],
  "tags": ["relevant", "topic", "tags"],
  "starterFiles": [
    {
      "filePath": "${config.starterFileName}",
      "fileName": "${config.starterFileName}",
      "content": "# Starter code with function signature and docstring/comments\\n# The user fills in the implementation"
    }
  ],
  "solutionFiles": [
    {
      "filePath": "${config.solutionFileName}",
      "fileName": "${config.solutionFileName}",
      "content": "# Complete working solution that passes all tests"
    }
  ],
  "testFiles": [
    {
      "filePath": "${config.testFileName}",
      "fileName": "${config.testFileName}",
      "content": "# Test file using ${config.testFramework}\\n# Import from: ${config.importStyle}"
    }
  ]
}

## Critical Rules

1. The solution code MUST pass all tests. This will be validated automatically.
2. The starter code must have the same function signatures as the solution but with empty/placeholder implementations.
3. Tests must import from the submission directory (the user's code replaces the starter code at runtime).
4. Include at least 4 test cases covering: basic functionality, edge cases, and error handling.
5. The description should be clear enough that a developer at the "${input.difficulty}" level can understand what to build.
6. Do NOT include any text outside the JSON object.
${input.retryContext ? getRetryInstructions(input.retryContext) : ''}`;

  return prompt;
}

// ============================================================
// Helpers
// ============================================================

function getDefaultTemplate(): string {
  return `You are an expert programming instructor who creates high-quality coding exercises. Your exercises are clear, well-tested, and pedagogically sound.

When generating an exercise:
- Write a clear problem description with examples
- Create starter code that guides the user without giving away the solution
- Write a complete, correct solution
- Write thorough tests that cover normal cases, edge cases, and boundary conditions
- Provide progressive hints that help without spoiling the answer
- Choose appropriate tags for discoverability`;
}

function getDifficultyGuidelines(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return `- Single function, straightforward logic
- No complex data structures
- 1-2 concepts tested
- Detailed description with clear examples
- 4-5 simple test cases`;
    case 'easy':
      return `- Single function, may require basic data structures (arrays, maps)
- 1-2 concepts tested
- Clear description with examples
- 5-6 test cases including basic edge cases`;
    case 'medium':
      return `- May require multiple functions or moderate algorithmic thinking
- 2-3 concepts tested
- Description with examples but less hand-holding
- 6-8 test cases including edge cases and performance considerations`;
    case 'hard':
      return `- Requires solid algorithmic knowledge or complex data structures
- Multiple concepts combined
- Concise description, user must infer some requirements
- 8-10 test cases including tricky edge cases`;
    case 'expert':
      return `- Advanced algorithms, optimization, or system design concepts
- Requires deep understanding of the language
- Minimal description, complex requirements
- 10+ test cases including performance and stress tests`;
    default:
      return `- Moderate complexity, 2-3 concepts
- Clear description with examples
- 6-8 test cases`;
  }
}

function getRetryInstructions(context: RetryContext): string {
  return `

## IMPORTANT: Previous Attempt Failed (Retry ${context.attempt}/2)

The previous generation failed validation. The solution did not pass the tests.

**Error:** ${context.previousError}
${context.failedTests ? `**Failed tests:** ${context.failedTests}` : ''}

Please fix the issues. Make sure:
- The solution code is correct and complete
- The test assertions match the solution's actual output
- There are no import errors or syntax issues
- Test imports use the correct path: import from the submission directory`;
}
