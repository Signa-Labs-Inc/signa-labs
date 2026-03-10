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
  pathContext?: string;
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
  depsFileName: string;
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
    depsFileName: 'requirements.txt',
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
    depsFileName: 'deps.json',
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
    depsFileName: 'deps.json',
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
    depsFileName: 'requirements.txt',
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
    depsFileName: '',
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

IMPORTANT: The exercise runs in an isolated sandbox. The sandbox has the language runtime, the test framework, and any framework-specific packages listed below.

The sandbox does NOT have:
- No browser or real DOM (unless React sandbox is active)
- No database servers (SQLite is available for SQL exercises)
- No file system access beyond the workspace directory

However, if the exercise requires packages beyond what's pre-installed, you may include a dependency file in the supportFiles array:
- Python: include a "requirements.txt" file with one package per line, version-pinned (e.g. requests==2.31.0)
- Node.js: include a "deps.json" file with {"dependencies": {"package": "version"}} format (exact versions, no ^ or ~)
These will be installed automatically before tests run (60-second timeout for installation). Only include packages that are truly needed — prefer using what's already available in the sandbox.
${getFrameworkInstructions(input.detectedFramework, input.language)}
## Language-Specific Requirements

- Write all code in ${config.displayName}
- Test framework: ${config.testFramework}
- Primary starter file name: \`${config.starterFileName}\`
- Primary solution file name: \`${config.solutionFileName}\`
- Test file name: \`${config.testFileName}\`
- In test files, import from the submission directory: \`${config.importStyle}\`
- File extensions: \`${config.fileExtension}\`
${config.depsFileName ? `- Dependency file (if needed): \`${config.depsFileName}\`` : ''}

Note: Meta-frameworks (Next.js, Remix, Nuxt, SvelteKit) cannot run in the sandbox. If the user asks about Next.js concepts, create exercises that test the underlying patterns:
- "Next.js Server Components" → React component exercises
- "Next.js API routes" → Express/pure function exercises  
- "Next.js data fetching" → async function exercises
- "Next.js middleware" → pure function exercises with Request/Response objects
Explain in the description that the exercise teaches the pattern used in Next.js.

## Difficulty Guidelines

${getDifficultyGuidelines(input.difficulty)}
${input.pathContext ? `\n${input.pathContext}` : ''}

## Teaching Content

In addition to the exercise, generate teaching content that helps the user learn:

**Pre-exercise lesson (lessonContent):**
- Teach the concept this exercise tests BEFORE the user attempts it
- Write for someone at the "${input.difficulty}" level
- 300-500 words of clear explanation in markdown
- Include ONE code example that demonstrates the concept (NOT the exercise solution)
- Add 2-3 line annotations pointing out key parts of the example
- End with 2-3 key takeaways the reader should remember
- The lesson should make the exercise approachable — after reading, the user should think "I can do this"

**Post-exercise synthesis (synthesisContent):**
- Summarize what the user learned (1 sentence)
- Connect it to broader programming concepts (2-3 sentences)
- Mention where this is used in real codebases (1-2 sentences)
- nextPreview should be null (the path system fills this in later)
- synthesisContent must be written in PAST TENSE — the user has already completed the exercise. Say "You built..." or "You implemented..." not "You'll learn..." or "This exercise covers..."

IMPORTANT: The lesson's code example must be DIFFERENT from the exercise solution. It should teach the concept generically, not solve the specific problem.

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
      "content": "# Main starter file with function signatures and TODO comments"
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
  ],
  "supportFiles": [],
  "lessonContent": {
    "title": "Short title for the concept being taught",
    "body": "Markdown explanation of the concept (300-500 words). Explain WHY it works, not just HOW. Build from what the reader likely knows at the '${input.difficulty}' level. Use clear, simple language. Include inline code references where helpful.",
    "codeExample": {
      "code": "A single clear code example demonstrating the concept (NOT the exercise solution)",
      "language": "${config.displayName.toLowerCase()}",
      "annotations": [
        { "line": 1, "text": "Brief annotation explaining this line" }
      ]
    },
    "keyTakeaways": ["2-3 key points to remember"]
  },
  "synthesisContent": {
    "summary": "One sentence in PAST TENSE: what the user just learned (e.g. 'You implemented effect cleanup to prevent memory leaks' NOT 'You'll learn about effect cleanup')",
    "connections": "How this concept connects to broader programming patterns (2-3 sentences)",
    "realWorld": "Where this is used in production codebases (1-2 sentences)",
    "nextPreview": null
  }
}

Note: starterFiles, solutionFiles, testFiles, and supportFiles are ARRAYS and may contain multiple entries for multi-file exercises. Each file needs a unique filePath and fileName. Starter and solution arrays must have matching file paths — every starter file must have a corresponding solution file with the same filePath.

For multi-file exercises, additional files should use descriptive names (e.g. "utils${config.fileExtension}", "models${config.fileExtension}"). Tests import all files from the submission directory using relative paths like: ${config.importStyle.replace('solution', 'filename')}.
${
  config.depsFileName
    ? `
If the exercise needs packages not already in the sandbox, include a "${config.depsFileName}" in the supportFiles array. Example:
${config.depsFileName === 'requirements.txt' ? `{"filePath": "requirements.txt", "fileName": "requirements.txt", "content": "requests==2.31.0\\nbeautifulsoup4==4.12.3"}` : `{"filePath": "deps.json", "fileName": "deps.json", "content": "{\\"dependencies\\": {\\"lodash\\": \\"4.17.21\\"}}"}`}`
    : ''
}

## Critical Rules

1. The solution code MUST pass all tests. This will be validated automatically.
2. The starter code must have the same function signatures as the solution but with empty/placeholder implementations.
3. Tests must import from the submission directory (the user's code replaces the starter code at runtime).
4. Include at least 4 test cases covering: basic functionality, edge cases, and error handling.
5. The description should be clear enough that a developer at the "${input.difficulty}" level can understand what to build.
6. Do NOT include any text outside the JSON object.
7. Prefer using packages already available in the sandbox. If the exercise requires additional packages, include a ${config.depsFileName || 'requirements.txt'} in supportFiles with pinned versions.
8. All code must be testable with the specified test framework.
9. For multi-file exercises, each starter file must have clear TODO comments and all files must work together with correct imports.
10. The lessonContent code example must NOT be the exercise solution. It should teach the concept generically so the user learns the pattern before applying it.
11. Write tests that validate BEHAVIOR and DATA, not exact presentation. Use regex or partial matches (e.g. /John Doe/i) rather than expecting exact standalone text. Users should have creative freedom in how they present data as long as the data is present and correct.
12. synthesisContent must be written in PAST TENSE — the user has already completed the exercise. Say "You built..." or "You implemented..." not "You'll learn..." or "This exercise covers..."
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
Additional packages can be included via supportFiles if needed.
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
- For multi-file React exercises, each component should be in its own file (e.g. Button.tsx, Card.tsx) and the main file should compose them
- Additional packages (e.g. react-hook-form, zod) can be included via deps.json in supportFiles

## Testing Best Practices (IMPORTANT)

Write tests that validate BEHAVIOR and DATA, not exact presentation:
- Use regex matchers for text content: screen.getByText(/John Doe/i) instead of screen.getByText('John Doe')
- Use { exact: false } when checking for data within surrounding text: screen.getByText('John Doe', { exact: false })
- Use toHaveTextContent for partial content matching on elements
- NEVER assert exact standalone text when the exercise asks users to "display" or "show" data — users may wrap values in labels, sentences, or different elements
- Test that the correct DATA is present in the document, not the exact HTML structure or sentence phrasing
- For lists and collections, verify the count and content, not the exact element type used
- Allow users creative freedom in presentation — a user might render a name as "John Doe", "Name: John Doe", or "Hello, John Doe" and all should pass

Example test structure:
\`\`\`
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../submission/solution.${language === 'typescript' ? 'tsx' : 'jsx'}';

describe('MyComponent', () => {
  it('displays user name', () => {
    render(<MyComponent name="John Doe" />);
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  it('shows all list items', () => {
    render(<MyComponent items={['Apple', 'Banana']} />);
    expect(screen.getByText(/Apple/i)).toBeInTheDocument();
    expect(screen.getByText(/Banana/i)).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText(/submitted/i)).toBeInTheDocument();
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
- For multi-file Express exercises, split into routes.ts, middleware.ts, and app.ts
- Additional packages (e.g. zod, cors) can be included via deps.json in supportFiles

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

Additional packages can be included via requirements.txt in supportFiles if the exercise requires them (e.g. pydantic-settings, python-multipart).

Keep exercises focused on core API concepts:
- Route handling, request/response patterns
- Query parameters, path parameters, request bodies
- Status codes, error handling, middleware basics
- Data validation with Pydantic (built into FastAPI)
- Use simple in-memory data (lists, dicts) for storage

Guidelines:
- Create Flask or FastAPI route handlers and applications
- For Flask: test with Flask's test client
- For FastAPI: test with httpx.AsyncClient and pytest
- The starter file should define the app and routes
- Do NOT start the server — tests create their own test client
- Do NOT use database connections — mock data with in-memory structures
- For multi-file exercises, split into routes.py, models.py, and app.py

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

Additional packages can be included via requirements.txt in supportFiles if needed (e.g. seaborn, statsmodels, xgboost).

Guidelines:
- Exercises should focus on data manipulation, analysis, or ML concepts
- Tests should verify function outputs using numpy.testing or pandas.testing where appropriate
- For matplotlib exercises: test that figures/axes have the right data, labels, and properties — don't test visual appearance
- For scikit-learn exercises: test model predictions, scores, or pipeline outputs against known datasets
- For NLP exercises: test tokenization, text processing, or analysis outputs
- Use small inline datasets in tests (don't rely on external files or URLs)
- Use numpy.testing.assert_array_almost_equal for floating point comparisons
- Use pandas.testing.assert_frame_equal for DataFrame comparisons
- For multi-file exercises, split into data_utils.py, models.py, and solution.py

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

Additional packages can be included via requirements.txt in supportFiles if needed.

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
- For multi-file exercises, split into solution.go and helpers.go — all in the same package

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
Additional packages can be included via supportFiles if needed.
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
- Prefer using packages already in the sandbox, but if the exercise requires additional packages, include a dependency file (requirements.txt or deps.json) in supportFiles — they will be installed automatically

IMPORTANT: Match the exercise complexity to the user's prompt and selected difficulty level.
- If the user says "I want to learn X", create a BEGINNER-FRIENDLY exercise that teaches the basics of X
- Do NOT add advanced features (authentication, caching, rate limiting, etc.) unless the user specifically asks for them
- Start simple. A user learning web APIs should start with basic CRUD routes, not JWT authentication
- When in doubt, make the exercise simpler rather than more complex

Multi-file exercises:
- For beginner/easy exercises, use a SINGLE file unless the prompt specifically asks for multiple files
- For medium exercises, use multiple files ONLY if the exercise naturally involves separate concerns (e.g. a utility module + main logic)
- For hard/expert exercises, split code across multiple files when it teaches good architectural practices (separation of concerns, modules, composition)
- Each starter file should have clear TODO comments explaining what to implement
- All files must work together — imports between submission files should use relative paths`;
}

function getDifficultyGuidelines(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return `- Single function, straightforward logic
- No complex data structures
- 1-2 concepts tested
- Detailed description with clear examples
- 4-5 simple test cases
- Always use a SINGLE file`;
    case 'easy':
      return `- Single function, may require basic data structures (arrays, maps)
- 1-2 concepts tested
- Clear description with examples
- 5-6 test cases including basic edge cases
- Use a SINGLE file`;
    case 'medium':
      return `- May require multiple functions or moderate algorithmic thinking
- 2-3 concepts tested
- Description with examples but less hand-holding
- 6-8 test cases including edge cases and performance considerations
- May use 1-2 files if the exercise involves separate concerns`;
    case 'hard':
      return `- Requires solid algorithmic knowledge or complex data structures
- Multiple concepts combined
- Concise description, user must infer some requirements
- 8-10 test cases including tricky edge cases
- IMPORTANT: Exercise must be complex in LOGIC, not in dependencies. Use only the packages available in the sandbox unless truly necessary.
- Use 2-3 files to teach separation of concerns and modular design`;
    case 'expert':
      return `- Advanced algorithms, optimization, or system design concepts
- Requires deep understanding of the language
- Minimal description, complex requirements
- 10+ test cases including performance and stress tests
- IMPORTANT: Exercise must be complex in LOGIC, not in dependencies. Use only the packages available in the sandbox unless truly necessary.
- Use 2-4 files with clear module boundaries and well-defined interfaces`;
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
- If using external packages, ensure they are listed in the dependency file (requirements.txt or deps.json) in supportFiles
- For multi-file exercises, all imports between files are correct`;
}
