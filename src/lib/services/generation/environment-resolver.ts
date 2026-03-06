/**
 * Environment Resolver
 *
 * Analyzes the user's prompt to determine which sandbox environment
 * is best suited for the exercise. Falls back to the base language
 * environment if no framework is detected.
 *
 * Used by the generation service to pick the right environment BEFORE
 * calling the LLM, so the prompt builder can include the correct
 * framework-specific instructions.
 */

import * as reader from './generation.reader';

// ============================================================
// Types
// ============================================================

export interface ResolvedEnvironment {
  id: string;
  name: string;
  baseImage: string;
  maxExecutionSeconds: number;
  maxFiles: number;
  maxFileSizeBytes: number;
  detectedFramework: string | null;
}

interface FrameworkPattern {
  /** Environment name to look up in exercise_environments */
  environmentName: string;
  /** Framework identifier for prompt builder */
  framework: string;
  /** Keywords in the user prompt that suggest this framework */
  promptKeywords: string[];
  /** Languages this framework applies to */
  languages: string[];
}

// ============================================================
// Framework detection patterns
// ============================================================

const FRAMEWORK_PATTERNS: FrameworkPattern[] = [
  {
    environmentName: 'typescript-react',
    framework: 'react',
    promptKeywords: [
      'react',
      'jsx',
      'tsx',
      'usestate',
      'useeffect',
      'usememo',
      'useref',
      'usecallback',
      'usecontext',
      'usereducer',
      'virtual dom',
      'react component',
      'functional component',
      'class component',
      'react hook',
      'custom hook',
    ],
    languages: ['typescript'],
  },
  {
    environmentName: 'javascript-react',
    framework: 'react',
    promptKeywords: [
      'react',
      'jsx',
      'usestate',
      'useeffect',
      'usememo',
      'useref',
      'usecallback',
      'usecontext',
      'usereducer',
      'virtual dom',
      'react component',
      'functional component',
      'class component',
      'react hook',
      'custom hook',
    ],
    languages: ['javascript'],
  },
  {
    environmentName: 'typescript-express',
    framework: 'express',
    promptKeywords: [
      'express',
      'express middleware',
      'express router',
      'api route',
      'rest api',
      'api endpoint',
      'http server',
      'request handler',
      'route handler',
      'rest endpoint',
      'api server',
      'backend api',
      'node server',
      'node api',
    ],
    languages: ['typescript', 'javascript'],
  },
  {
    environmentName: 'python-web',
    framework: 'flask,fastapi',
    promptKeywords: [
      'flask',
      'fastapi',
      'api route',
      'rest api',
      'api endpoint',
      'http server',
      'web server',
      'route handler',
      'python api',
      'python web',
      'python server',
      'backend api',
      'web endpoint',
    ],
    languages: ['python'],
  },
  {
    environmentName: 'sql-sqlite',
    framework: 'sql',
    promptKeywords: [
      'sql query',
      'sql join',
      'sql select',
      'write a query',
      'database query',
      'where clause',
      'group by',
      'order by',
      'having',
      'subquery',
      'primary key',
      'foreign key',
      'schema design',
      'window function',
      'cte',
      'common table expression',
      'stored procedure',
      'inner join',
      'left join',
      'right join',
      'cross join',
    ],
    languages: ['sql'],
  },
  {
    environmentName: 'go-1.23',
    framework: 'go',
    promptKeywords: [
      'goroutine',
      'go channel',
      'go routine',
      'go concurrency',
      'go mutex',
      'waitgroup',
      'go interface',
      'go struct',
      'go slice',
      'go map',
      'go error handling',
      'go defer',
      'go panic',
      'go recover',
    ],
    languages: ['go'],
  },
];

// ============================================================
// Resolver
// ============================================================

/**
 * Resolve the best sandbox environment for a user's prompt and language.
 *
 * 1. Check if the prompt mentions a known framework
 * 2. If yes, look up the framework-specific environment
 * 3. If the framework environment doesn't exist in DB, fall back to base
 * 4. If no framework detected, use the base language environment
 */
export async function resolveEnvironment(
  userPrompt: string,
  language: string
): Promise<ResolvedEnvironment> {
  const promptLower = userPrompt.toLowerCase();

  // Check for framework matches
  for (const pattern of FRAMEWORK_PATTERNS) {
    if (!pattern.languages.includes(language)) continue;

    const matched = pattern.promptKeywords.some((keyword) =>
      promptLower.includes(keyword.toLowerCase())
    );

    if (matched) {
      // Try to find the framework environment in the DB
      const env = await reader.getEnvironmentByName(pattern.environmentName);
      if (env) {
        return {
          ...env,
          detectedFramework: pattern.framework,
        };
      }
      // Framework environment not seeded yet — fall through to base
    }
  }

  // Fall back to base language environment
  const baseEnv = await reader.getActiveEnvironmentByLanguage(language);
  if (!baseEnv) {
    throw new Error(`No active sandbox environment found for ${language}`);
  }

  return {
    ...baseEnv,
    detectedFramework: null,
  };
}
