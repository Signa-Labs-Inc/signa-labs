/**
 * Seed all exercise environments.
 *
 * Run: doppler run -- npx tsx src/db/seeds/environments.ts
 * Production: doppler run --config prd -- npx tsx src/db/seeds/environments.ts
 */

import 'dotenv/config';
import { db } from '@/index';
import { exerciseEnvironments } from '@/db/schema/tables';
import { eq } from 'drizzle-orm';

type EnvironmentSeed = typeof exerciseEnvironments.$inferInsert;

const environments: EnvironmentSeed[] = [
  // ── Python ──────────────────────────────────────────────────────
  {
    name: 'python_core',
    displayName: 'Python',
    description: 'Standard Python environment with pytest',
    baseImage: 'python:3.12-slim',
    preinstalledPackages: ['pytest', 'pytest-json-report', 'pytest-timeout'],
    supportedLanguages: ['python'],
    maxExecutionSeconds: 30,
  },
  {
    name: 'python-web',
    displayName: 'Python Web (Flask/FastAPI)',
    description: 'Python with Flask, FastAPI, and web testing tools',
    baseImage: 'python:3.12-slim',
    preinstalledPackages: [
      'pytest',
      'pytest-json-report',
      'pytest-timeout',
      'flask',
      'fastapi',
      'httpx',
      'uvicorn',
    ],
    supportedLanguages: ['python'],
    maxExecutionSeconds: 30,
  },
  {
    name: 'python-data-science',
    displayName: 'Python Data Science',
    description: 'Python with NumPy, Pandas, and data science libraries',
    baseImage: 'python:3.12-slim',
    preinstalledPackages: [
      'pytest',
      'pytest-json-report',
      'pytest-timeout',
      'numpy',
      'pandas',
      'scipy',
    ],
    supportedLanguages: ['python'],
    maxExecutionSeconds: 30,
  },
  {
    name: 'python-bio',
    displayName: 'Python Bioinformatics',
    description: 'Python with bioinformatics libraries',
    baseImage: 'python:3.12-slim',
    preinstalledPackages: ['pytest', 'pytest-json-report', 'pytest-timeout', 'biopython'],
    supportedLanguages: ['python'],
    maxExecutionSeconds: 30,
  },

  // ── JavaScript / TypeScript ─────────────────────────────────────
  {
    name: 'node_core',
    displayName: 'JavaScript',
    description: 'Node.js with Vitest for JavaScript exercises',
    baseImage: 'node:20-slim',
    preinstalledPackages: ['vitest'],
    supportedLanguages: ['javascript'],
    maxExecutionSeconds: 30,
  },
  {
    name: 'typescript',
    displayName: 'TypeScript',
    description: 'Node.js with Vitest and TypeScript',
    baseImage: 'node:20-slim',
    preinstalledPackages: ['vitest', 'typescript'],
    supportedLanguages: ['typescript'],
    maxExecutionSeconds: 30,
  },
  {
    name: 'typescript-react',
    displayName: 'TypeScript React',
    description: 'React with TypeScript, Vitest, and Testing Library',
    baseImage: 'node:20-slim',
    preinstalledPackages: [
      'vitest',
      'typescript',
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      'jsdom',
    ],
    supportedLanguages: ['typescript'],
    maxExecutionSeconds: 30,
  },
  {
    name: 'javascript-react',
    displayName: 'JavaScript React',
    description: 'React with JavaScript, Vitest, and Testing Library',
    baseImage: 'node:20-slim',
    preinstalledPackages: [
      'vitest',
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      'jsdom',
    ],
    supportedLanguages: ['javascript'],
    maxExecutionSeconds: 30,
  },
  {
    name: 'typescript-express',
    displayName: 'TypeScript Express',
    description: 'Express.js with TypeScript and Vitest',
    baseImage: 'node:20-slim',
    preinstalledPackages: ['vitest', 'typescript', 'express', '@types/express', 'supertest'],
    supportedLanguages: ['typescript', 'javascript'],
    maxExecutionSeconds: 30,
  },

  // ── Go ──────────────────────────────────────────────────────────
  {
    name: 'go_core',
    displayName: 'Go',
    description: 'Go standard library with built-in testing',
    baseImage: 'golang:1.23-bookworm',
    preinstalledPackages: [],
    supportedLanguages: ['go'],
    maxExecutionSeconds: 30,
  },

  // ── SQL ─────────────────────────────────────────────────────────
  {
    name: 'sql-sqlite',
    displayName: 'SQL',
    description: 'SQLite with Python-based test runner',
    baseImage: 'python:3.12-slim',
    preinstalledPackages: ['pytest', 'pytest-json-report', 'pytest-timeout'],
    supportedLanguages: ['sql'],
    maxExecutionSeconds: 30,
  },
];

async function seedEnvironments() {
  console.log('🌱 Seeding exercise environments...');

  for (const env of environments) {
    const [inserted] = await db
      .insert(exerciseEnvironments)
      .values(env)
      .onConflictDoNothing()
      .returning();

    if (inserted) {
      console.log(`  ✅ Created: ${env.name} (${env.displayName})`);
    } else {
      // Already exists — update mutable fields
      await db
        .update(exerciseEnvironments)
        .set({
          displayName: env.displayName,
          description: env.description,
          baseImage: env.baseImage,
          preinstalledPackages: env.preinstalledPackages,
          supportedLanguages: env.supportedLanguages,
          maxExecutionSeconds: env.maxExecutionSeconds,
        })
        .where(eq(exerciseEnvironments.name, env.name));
      console.log(`  🔄 Updated: ${env.name} (${env.displayName})`);
    }
  }

  console.log(`\n✅ ${environments.length} environments seeded`);
}

seedEnvironments()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
