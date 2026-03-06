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
  detectedFramework?: string | null;
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
  sql: {
    displayName: 'SQL',
    testFramework: 'pytest',
    fileExtension: '.sql',
    testFilePattern: 'test_*.py',
    starterFileName: 'solution.sql',
    solutionFileName: 'solution.sql',
    testFileName: 'test_solution.py',
    importStyle: 'open("/workspace/submission/solution.sql").read()',
  },
  go: {
    displayName: 'Go',
    testFramework: 'go test',
    fileExtension: '.go',
    testFilePattern: '*_test.go',
    starterFileName: 'solution.go',
    solutionFileName: 'solution.go',
    testFileName: 'solution_test.go',
    importStyle: 'functions are in the same package',
  },
};

// ============================================================
// Builder
// ============================================================

export function buildGenerationPrompt(input: PromptBuilderInput): string {
  const baseConfig = LANGUAGE_CONFIGS[input.language];
  if (!baseConfig) {
    throw new Error(`Unsupported language: ${input.language}`);
  }

  // Override file names when a framework changes file extensions (e.g., React: .ts → .tsx)
  const config = getFrameworkConfig(baseConfig, input.detectedFramework, input.language);

  // Use DB template if available, otherwise use the default
  const baseInstructions = input.template?.templateText ?? getDefaultTemplate();

  const prompt = `${baseInstructions}

## Exercise Request

**User's prompt:** ${input.userPrompt}
**Language:** ${config.displayName}
**Difficulty:** ${input.difficulty}
${input.exerciseType ? `**Exercise type:** ${input.exerciseType}` : ''}

## Sandbox Environment Constraints

IMPORTANT: The exercise runs in an isolated sandbox. If the user's prompt asks for something that requires packages or tools not available in the sandbox, reinterpret it as an exercise that uses only the available tools.

The sandbox has the language runtime, the test framework, and any framework-specific packages listed below. It does NOT have:
- No browser or real DOM (unless React sandbox is active)
- No external network access
- No database servers (SQLite is available for SQL exercises)
- No file system access beyond the workspace directory
${getFrameworkInstructions(input.detectedFramework, input.language)}
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
7. Do NOT use any packages or libraries beyond what is listed as available in the sandbox.
8. All code must be testable with the specified test framework.
${input.retryContext ? getRetryInstructions(input.retryContext) : ''}`;

  return prompt;
}

// ============================================================
// Framework config overrides
// ============================================================

function getFrameworkConfig(
  base: LanguageConfig,
  framework: string | null | undefined,
  language: string
): LanguageConfig {
  if (framework === 'react') {
    const ext = language === 'typescript' ? '.tsx' : '.jsx';
    return {
      ...base,
      fileExtension: ext,
      testFilePattern: `*.test${ext}`,
      starterFileName: `solution${ext}`,
      solutionFileName: `solution${ext}`,
      testFileName: `solution.test${ext}`,
      importStyle: `import { Component } from "../submission/solution${ext}"`,
    };
  }
  return base;
}

// ============================================================
// Framework instructions
// ============================================================

function getFrameworkInstructions(framework: string | null | undefined, language: string): string {
  if (!framework) {
    return `
Available packages: standard library + ${LANGUAGE_CONFIGS[language]?.testFramework ?? 'test framework'} only.
All code must be pure functions/classes testable with direct function calls.
`;
  }

  switch (framework) {
    case 'react':
      return `
## Framework: React

This exercise uses a React sandbox with the following packages available:
- react, react-dom
- @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- jsdom (Vitest environment)

Guidelines:
- Create React functional components using hooks
- Test files should use \`render\` from @testing-library/react and \`screen\` for queries
- Use \`@testing-library/user-event\` for simulating user interactions
- Tests run in a jsdom environment — there is a real (simulated) DOM available
- File extension for ${language === 'typescript' ? 'TypeScript' : 'JavaScript'} React files: ${language === 'typescript' ? '.tsx' : '.jsx'}
- Starter file: solution.${language === 'typescript' ? 'tsx' : 'jsx'}
- Test file: solution.test.${language === 'typescript' ? 'tsx' : 'jsx'}
- Import React: import React from 'react'
- Do NOT use Next.js, Remix, or any meta-framework features
- Do NOT use CSS-in-JS libraries (styled-components, emotion) — use inline styles or className strings
- Do NOT import CSS files

Example test structure:
\`\`\`
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../submission/solution.${language === 'typescript' ? 'tsx' : 'jsx'}';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
\`\`\`
`;

    case 'express':
      return `
## Framework: Express

This exercise uses an Express sandbox with the following packages available:
- express (v5)
- supertest (for HTTP testing)

Guidelines:
- Create Express route handlers, middleware, or full mini-apps
- Test files should use \`supertest\` to make HTTP requests against the Express app
- The starter file should export an Express app or router
- Starter file: solution.ts
- Test file: solution.test.ts
- Do NOT start the server (no app.listen) — supertest handles that
- Do NOT use database connections — mock data with in-memory objects

Example test structure:
\`\`\`
import request from 'supertest';
import { app } from '../submission/solution';

describe('GET /api/users', () => {
  it('returns a list of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
\`\`\`
`;

    case 'flask,fastapi':
      return `
## Framework: Flask / FastAPI

This exercise uses a Python web sandbox with the following packages available:
- flask, fastapi, uvicorn
- httpx (for async HTTP testing)
- pytest

Guidelines:
- Create Flask or FastAPI route handlers and applications
- For Flask: test with Flask's test client
- For FastAPI: test with httpx.AsyncClient and pytest
- The starter file should define the app and routes
- Do NOT start the server — tests create their own test client
- Do NOT use database connections — mock data with in-memory structures

Example Flask test:
\`\`\`python
from solution import app

def test_get_users():
    client = app.test_client()
    response = client.get('/api/users')
    assert response.status_code == 200
\`\`\`

Example FastAPI test:
\`\`\`python
import pytest
from httpx import AsyncClient, ASGITransport
from solution import app

@pytest.mark.anyio
async def test_get_users():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/users")
        assert response.status_code == 200
\`\`\`
`;

    case 'data-science':
      return `
## Framework: Data Science (NumPy, Pandas, Scikit-learn, Matplotlib, NLTK)

This exercise uses a data science sandbox with the following packages available:
- numpy, pandas, scipy
- matplotlib (Agg backend — no display, but can create figures and check properties)
- scikit-learn
- nltk (with punkt_tab, stopwords, averaged_perceptron_tagger_eng, wordnet data downloaded)

Guidelines:
- Exercises should focus on data manipulation, analysis, or ML concepts
- Tests should verify function outputs using numpy.testing or pandas.testing where appropriate
- For matplotlib exercises: test that figures/axes have the right data, labels, and properties — don't test visual appearance
- For scikit-learn exercises: test model predictions, scores, or pipeline outputs against known datasets
- For NLP exercises: test tokenization, text processing, or analysis outputs
- Use small inline datasets in tests (don't rely on external files or URLs)
- Use numpy.testing.assert_array_almost_equal for floating point comparisons
- Use pandas.testing.assert_frame_equal for DataFrame comparisons

Example test patterns:
\`\`\`python
import numpy as np
import pandas as pd
from solution import clean_data, train_model

def test_clean_data():
    df = pd.DataFrame({"a": [1, None, 3], "b": [4, 5, None]})
    result = clean_data(df)
    assert result.isnull().sum().sum() == 0

def test_model_accuracy():
    X_train, y_train, X_test, y_test = get_sample_data()
    model = train_model(X_train, y_train)
    accuracy = model.score(X_test, y_test)
    assert accuracy > 0.8
\`\`\`
`;

    case 'bioinformatics':
      return `
## Framework: Bioinformatics (BioPython)

This exercise uses a bioinformatics sandbox with the following packages available:
- biopython
- numpy, pandas

Guidelines:
- Exercises should focus on biological sequence analysis, genomics, or molecular biology concepts
- Use BioPython's Seq, SeqRecord, and other objects where appropriate
- Tests should verify outputs of sequence analysis functions
- Use small inline sequences in tests — don't rely on external databases or BLAST queries
- Common exercise types: GC content calculation, codon tables, ORF finding, sequence alignment scoring, restriction enzyme analysis, DNA-to-protein translation

Example test patterns:
\`\`\`python
from solution import find_gc_content, translate_dna

def test_gc_content():
    assert abs(find_gc_content("ATGCGCTA") - 0.5) < 0.01

def test_translate_dna():
    assert translate_dna("ATGGCC") == "MA"

def test_reverse_complement():
    from solution import reverse_complement
    assert reverse_complement("ATGC") == "GCAT"
\`\`\`
`;

    case 'sql':
      return `
## Framework: SQL (SQLite)

This exercise uses a Python-based SQL sandbox. The user writes SQL queries in a .sql file,
and Python test files execute those queries against an in-memory SQLite database.

Guidelines:
- The starter file (solution.sql) contains SQL query placeholders the user fills in
- The solution file contains the correct SQL queries
- Test files are Python scripts using pytest + sqlite3
- Tests create the database schema, insert sample data, execute the user's SQL, and verify results
- Use SQLite-compatible syntax (no PostgreSQL/MySQL-specific features)
- The test file reads the user's SQL from the submission directory

Exercise structure:
- solution.sql: Contains labeled SQL queries separated by comments (-- Query 1:, -- Query 2:, etc.)
- test_solution.py: Python file that creates tables, inserts data, runs each query, and checks results

Example test pattern:
\`\`\`python
import sqlite3
import pytest

def get_queries():
    with open("/workspace/submission/solution.sql") as f:
        content = f.read()
    queries = {}
    current_label = None
    current_sql = []
    for line in content.split("\\n"):
        if line.strip().startswith("-- Query"):
            if current_label:
                queries[current_label] = "\\n".join(current_sql).strip()
            current_label = line.strip()
            current_sql = []
        else:
            current_sql.append(line)
    if current_label:
        queries[current_label] = "\\n".join(current_sql).strip()
    return queries

@pytest.fixture
def db():
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")
    cursor.execute("INSERT INTO users VALUES (1, 'Alice', 30), (2, 'Bob', 25), (3, 'Carol', 35)")
    conn.commit()
    yield conn
    conn.close()

def test_select_all_users(db):
    queries = get_queries()
    result = db.execute(queries["-- Query 1:"]).fetchall()
    assert len(result) == 3

def test_filter_by_age(db):
    queries = get_queries()
    result = db.execute(queries["-- Query 2:"]).fetchall()
    assert all(row[2] > 28 for row in result)
\`\`\`

Example solution.sql:
\`\`\`sql
-- Query 1: Select all users
SELECT * FROM users;

-- Query 2: Select users older than 28
SELECT * FROM users WHERE age > 28;
\`\`\`
`;

    case 'go':
      return `
## Framework: Go

This exercise uses Go 1.23 with the standard \`testing\` package.

Guidelines:
- All files must be in the same package (package main or a named package)
- The starter file and solution file must have the same function signatures
- Test files use Go's built-in testing package (testing.T)
- All files are placed in the same directory at runtime, so no imports between files needed
- Do NOT use any external packages — standard library only
- Use table-driven tests where appropriate (idiomatic Go)

File naming:
- Starter/solution file: solution.go
- Test file: solution_test.go
- Both files must declare the same package name

Example test pattern:
\`\`\`go
package main

import "testing"

func TestTwoSum(t *testing.T) {
    tests := []struct {
        name     string
        nums     []int
        target   int
        expected []int
    }{
        {"basic case", []int{2, 7, 11, 15}, 9, []int{0, 1}},
        {"middle elements", []int{3, 2, 4}, 6, []int{1, 2}},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := TwoSum(tt.nums, tt.target)
            if len(result) != len(tt.expected) {
                t.Errorf("got %v, want %v", result, tt.expected)
            }
            for i := range result {
                if result[i] != tt.expected[i] {
                    t.Errorf("got %v, want %v", result, tt.expected)
                }
            }
        })
    }
}
\`\`\`
`;

    default:
      return `
Available packages: standard library + ${LANGUAGE_CONFIGS[language]?.testFramework ?? 'test framework'} only.
All code must be pure functions/classes testable with direct function calls.
`;
  }
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
- Choose appropriate tags for discoverability
- Keep all code self-contained with no external dependencies beyond what the sandbox provides`;
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
- Test imports use the correct path: import from the submission directory
- No external packages or dependencies are used beyond what the sandbox provides`;
}
