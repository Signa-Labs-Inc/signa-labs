/**
 * Seed exercise_environments with sandbox configurations for each supported language.
 *
 * Run via: npx tsx scripts/seed-environments.ts
 *
 * Update the FLY_SANDBOX_APP value to match your Fly app name after deployment.
 * For local development, the base_image values won't be used directly — the
 * test-sandboxes.sh script uses local Docker images instead.
 */

// ============================================================
// CONFIGURATION — update these after deploying sandbox images
// ============================================================
const FLY_SANDBOX_APP = process.env.FLY_SANDBOX_APP || 'signa-labs-sandboxes';
const REGISTRY = 'registry.fly.io';

// ============================================================
// Environment definitions
// ============================================================

interface EnvironmentSeed {
  name: string;
  display_name: string;
  description: string;
  base_image: string;
  preinstalled_packages: string[];
  setup_commands: string[];
  supported_languages: string[];
  max_execution_seconds: number;
  max_files: number;
  max_file_size_bytes: number;
  metadata: Record<string, unknown>;
}

const environments: EnvironmentSeed[] = [
  // ============================================================
  // Base language environments
  // ============================================================
  {
    name: 'python-3.12',
    display_name: 'Python 3.12',
    description:
      'Python 3.12 with pytest for testing. Suitable for algorithm, data structure, and general Python exercises.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-python`,
    preinstalled_packages: ['pytest', 'pytest-json-report', 'pytest-timeout'],
    setup_commands: [],
    supported_languages: ['python'],
    max_execution_seconds: 30,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '3.12',
      test_framework: 'pytest',
      file_extension: '.py',
      category: 'base',
    },
  },
  {
    name: 'javascript-node20',
    display_name: 'JavaScript (Node.js 20)',
    description:
      'Node.js 20 with Vitest for testing. Suitable for JavaScript algorithm, DOM-free, and Node.js exercises.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-javascript`,
    preinstalled_packages: ['vitest'],
    setup_commands: [],
    supported_languages: ['javascript'],
    max_execution_seconds: 30,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '20',
      test_framework: 'vitest',
      file_extension: '.mjs',
      category: 'base',
    },
  },
  {
    name: 'typescript-node20',
    display_name: 'TypeScript (Node.js 20)',
    description:
      'Node.js 20 with tsx and Vitest for testing. Runs TypeScript directly without a separate compile step.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-typescript`,
    preinstalled_packages: ['vitest', 'tsx'],
    setup_commands: [],
    supported_languages: ['typescript'],
    max_execution_seconds: 30,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '20',
      test_framework: 'vitest',
      file_extension: '.ts',
      category: 'base',
    },
  },
  {
    name: 'sql-sqlite',
    display_name: 'SQL (SQLite)',
    description:
      'SQLite with Python pytest for testing. For SQL query writing, schema design, joins, aggregations, and window functions.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-sql`,
    preinstalled_packages: ['pytest', 'pytest-json-report', 'pytest-timeout', 'sqlite3'],
    setup_commands: [],
    supported_languages: ['sql'],
    max_execution_seconds: 30,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '3.12',
      test_framework: 'pytest',
      file_extension: '.sql',
      category: 'base',
      keywords: [
        'sql',
        'sqlite',
        'query',
        'database',
        'join',
        'select',
        'aggregate',
        'window function',
        'subquery',
        'schema',
      ],
    },
  },
  {
    name: 'go-1.23',
    display_name: 'Go 1.23',
    description:
      'Go 1.23 with standard library and go test. For algorithms, concurrency, interfaces, and systems programming exercises.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-go`,
    preinstalled_packages: ['go test (built-in)'],
    setup_commands: [],
    supported_languages: ['go'],
    max_execution_seconds: 30,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '1.23',
      test_framework: 'go test',
      file_extension: '.go',
      category: 'base',
      keywords: [
        'go',
        'golang',
        'goroutine',
        'channel',
        'concurrency',
        'interface',
        'struct',
        'pointer',
        'systems',
      ],
    },
  },

  // ============================================================
  // Web framework environments
  // ============================================================
  {
    name: 'typescript-react',
    display_name: 'TypeScript + React',
    description:
      'React 19 with Testing Library and jsdom. For component building, hooks, and React pattern exercises.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-typescript-react`,
    preinstalled_packages: [
      'vitest',
      'tsx',
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'jsdom',
    ],
    setup_commands: [],
    supported_languages: ['typescript'],
    max_execution_seconds: 45,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '20',
      test_framework: 'vitest',
      file_extension: '.tsx',
      category: 'framework',
      framework: 'react',
      keywords: [
        'react',
        'component',
        'hook',
        'jsx',
        'tsx',
        'ui',
        'frontend',
        'dom',
        'render',
        'state',
        'props',
        'context',
        'reducer',
      ],
    },
  },
  {
    name: 'javascript-react',
    display_name: 'JavaScript + React',
    description:
      'React 19 with Testing Library and jsdom. For component building and React exercises in JavaScript.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-javascript-react`,
    preinstalled_packages: [
      'vitest',
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'jsdom',
    ],
    setup_commands: [],
    supported_languages: ['javascript'],
    max_execution_seconds: 45,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '20',
      test_framework: 'vitest',
      file_extension: '.jsx',
      category: 'framework',
      framework: 'react',
      keywords: [
        'react',
        'component',
        'hook',
        'jsx',
        'ui',
        'frontend',
        'dom',
        'render',
        'state',
        'props',
        'context',
        'reducer',
      ],
    },
  },
  {
    name: 'typescript-express',
    display_name: 'TypeScript + Express',
    description:
      'Express 5 with supertest. For API route building, middleware, and backend exercises.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-typescript-express`,
    preinstalled_packages: ['vitest', 'tsx', 'express', 'supertest'],
    setup_commands: [],
    supported_languages: ['typescript'],
    max_execution_seconds: 30,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '20',
      test_framework: 'vitest',
      file_extension: '.ts',
      category: 'framework',
      framework: 'express',
      keywords: [
        'express',
        'api',
        'rest',
        'route',
        'middleware',
        'server',
        'endpoint',
        'http',
        'request',
        'response',
      ],
    },
  },
  {
    name: 'python-web',
    display_name: 'Python + Flask/FastAPI',
    description:
      'Flask and FastAPI with httpx. For API building, route handling, and Python web exercises.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-python-web`,
    preinstalled_packages: [
      'pytest',
      'pytest-json-report',
      'pytest-timeout',
      'flask',
      'fastapi',
      'httpx',
      'uvicorn',
    ],
    setup_commands: [],
    supported_languages: ['python'],
    max_execution_seconds: 30,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '3.12',
      test_framework: 'pytest',
      file_extension: '.py',
      category: 'framework',
      framework: 'flask,fastapi',
      keywords: [
        'flask',
        'fastapi',
        'api',
        'rest',
        'route',
        'endpoint',
        'http',
        'web',
        'server',
        'request',
        'response',
      ],
    },
  },

  // ============================================================
  // Science & domain environments
  // ============================================================
  {
    name: 'python-data-science',
    display_name: 'Python + Data Science',
    description:
      'NumPy, Pandas, SciPy, Matplotlib, Scikit-learn, and NLTK. For data analysis, machine learning, statistics, NLP, and visualization exercises.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-python-data-science`,
    preinstalled_packages: [
      'pytest',
      'pytest-json-report',
      'pytest-timeout',
      'numpy',
      'pandas',
      'scipy',
      'matplotlib',
      'scikit-learn',
      'nltk',
    ],
    setup_commands: [],
    supported_languages: ['python'],
    max_execution_seconds: 45,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '3.12',
      test_framework: 'pytest',
      file_extension: '.py',
      category: 'framework',
      framework: 'data-science',
      keywords: [
        'numpy',
        'pandas',
        'scipy',
        'matplotlib',
        'scikit-learn',
        'sklearn',
        'nltk',
        'data science',
        'machine learning',
        'statistics',
        'nlp',
        'data analysis',
        'visualization',
        'dataframe',
        'regression',
        'classification',
      ],
    },
  },
  {
    name: 'python-bio',
    display_name: 'Python + Bioinformatics',
    description:
      'BioPython with NumPy and Pandas. For DNA/RNA analysis, protein sequences, genomics, and molecular biology exercises.',
    base_image: `${REGISTRY}/${FLY_SANDBOX_APP}:sandbox-python-bio`,
    preinstalled_packages: [
      'pytest',
      'pytest-json-report',
      'pytest-timeout',
      'numpy',
      'pandas',
      'biopython',
    ],
    setup_commands: [],
    supported_languages: ['python'],
    max_execution_seconds: 30,
    max_files: 20,
    max_file_size_bytes: 1_048_576,
    metadata: {
      runtime_version: '3.12',
      test_framework: 'pytest',
      file_extension: '.py',
      category: 'framework',
      framework: 'bioinformatics',
      keywords: [
        'biopython',
        'bioinformatics',
        'dna',
        'rna',
        'protein',
        'genome',
        'sequence',
        'gene',
        'codon',
        'nucleotide',
        'fasta',
        'alignment',
        'molecular biology',
      ],
    },
  },
];

// ============================================================
// SQL output (can be piped to psql or used with Drizzle)
// ============================================================

function generateSQL(): string {
  const statements = environments.map((env) => {
    return `INSERT INTO exercise_environments (
  name, display_name, description, base_image,
  preinstalled_packages, setup_commands, supported_languages,
  max_execution_seconds, max_files, max_file_size_bytes, metadata
) VALUES (
  '${env.name}',
  '${env.display_name}',
  '${env.description.replace(/'/g, "''")}',
  '${env.base_image}',
  '${JSON.stringify(env.preinstalled_packages)}'::jsonb,
  ARRAY[${env.setup_commands.map((c) => `'${c}'`).join(', ')}]::text[],
  ARRAY[${env.supported_languages.map((l) => `'${l}'`).join(', ')}]::text[],
  ${env.max_execution_seconds},
  ${env.max_files},
  ${env.max_file_size_bytes},
  '${JSON.stringify(env.metadata)}'::jsonb
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  base_image = EXCLUDED.base_image,
  preinstalled_packages = EXCLUDED.preinstalled_packages,
  setup_commands = EXCLUDED.setup_commands,
  supported_languages = EXCLUDED.supported_languages,
  max_execution_seconds = EXCLUDED.max_execution_seconds,
  max_files = EXCLUDED.max_files,
  max_file_size_bytes = EXCLUDED.max_file_size_bytes,
  metadata = EXCLUDED.metadata,
  updated_at = now();`;
  });

  return statements.join('\n\n');
}

console.log('-- Signa Labs: Seed exercise_environments');
console.log('-- Generated by scripts/seed-environments.ts');
console.log('');
console.log(generateSQL());
