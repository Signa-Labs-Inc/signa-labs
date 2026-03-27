/**
 * Seed production exercise categories.
 *
 * Run locally: doppler run -- npx tsx src/db/seeds/categories.ts
 * Production:  NODE_ENV=development doppler run --config prd --preserve-env=NODE_ENV -- npx tsx src/db/seeds/categories.ts
 */

import 'dotenv/config';
import { db } from '@/index';
import { exerciseCategories } from '@/db/schema/tables';
import { sql } from 'drizzle-orm';

type CategorySeed = typeof exerciseCategories.$inferInsert;

const categories: CategorySeed[] = [
  // ── Interview Prep (9) ────────────────────────────────────────────

  {
    slug: 'arrays-and-hashing',
    label: 'Arrays & Hashing',
    description:
      'Master array manipulation, hash maps, two-pointer techniques, and sliding window patterns — the most common interview topics at top tech companies.',
    icon: 'Hash',
    tags: ['arrays', 'hashing', 'hash-map', 'two-pointer', 'sliding-window'],
    sortOrder: 1,
  },
  {
    slug: 'strings',
    label: 'Strings & Pattern Matching',
    description:
      'Build fluency with string manipulation, pattern matching, parsing, and text processing — essential for coding screens and take-home assessments.',
    icon: 'Type',
    tags: ['strings', 'pattern-matching', 'regex', 'parsing'],
    sortOrder: 2,
  },
  {
    slug: 'linked-lists',
    label: 'Linked Lists',
    description:
      'Practice pointer manipulation, reversal, cycle detection, and merge operations — classic interview staples that test your understanding of data structures.',
    icon: 'Link',
    tags: ['linked-list', 'pointers'],
    sortOrder: 3,
  },
  {
    slug: 'trees-and-graphs',
    label: 'Trees & Graphs',
    description:
      'Conquer BFS, DFS, tree traversals, and graph algorithms — favorites at FAANG and top-tier companies.',
    icon: 'GitBranch',
    tags: ['trees', 'graphs', 'bfs', 'dfs', 'binary-tree'],
    sortOrder: 4,
  },
  {
    slug: 'dynamic-programming',
    label: 'Dynamic Programming',
    description:
      'Learn memoization, tabulation, and optimal substructure — the category that separates good candidates from great ones in technical interviews.',
    icon: 'Layers',
    tags: ['dynamic-programming', 'memoization', 'tabulation'],
    sortOrder: 5,
  },
  {
    slug: 'sorting-and-searching',
    label: 'Sorting & Searching',
    description:
      'Master binary search variations, sorting algorithms, and divide-and-conquer strategies that form the foundation of efficient problem solving.',
    icon: 'ArrowUpDown',
    tags: ['sorting', 'searching', 'binary-search'],
    sortOrder: 6,
  },
  {
    slug: 'stacks-and-queues',
    label: 'Stacks & Queues',
    description:
      'Practice monotonic stacks, bracket matching, and queue-based algorithms — surprisingly common in real interviews.',
    icon: 'Rows3',
    tags: ['stacks', 'queues', 'monotonic-stack'],
    sortOrder: 7,
  },
  {
    slug: 'recursion-and-backtracking',
    label: 'Recursion & Backtracking',
    description:
      'Build confidence with recursive thinking, permutations, combinations, and constraint satisfaction problems.',
    icon: 'Undo2',
    tags: ['recursion', 'backtracking'],
    sortOrder: 8,
  },
  {
    slug: 'greedy-algorithms',
    label: 'Greedy Algorithms',
    description:
      'Learn when and how to apply greedy strategies — interval scheduling, activity selection, and optimization problems that appear in top-tier interviews.',
    icon: 'Zap',
    tags: ['greedy', 'intervals'],
    sortOrder: 9,
  },

  // ── Practical (3) ─────────────────────────────────────────────────

  {
    slug: 'api-design',
    label: 'REST API Design',
    description:
      'Build production-quality REST APIs with proper routing, validation, error handling, and middleware — skills every backend engineer needs on the job.',
    icon: 'Globe',
    tags: ['api', 'rest', 'http', 'endpoints'],
    sortOrder: 10,
  },
  {
    slug: 'database-and-sql',
    label: 'Database & SQL',
    description:
      'Master SQL queries, joins, window functions, CTEs, and aggregations — increasingly tested in technical interviews and essential for every developer.',
    icon: 'Database',
    tags: ['sql', 'database', 'queries', 'joins'],
    sortOrder: 11,
  },
  {
    slug: 'system-design',
    label: 'System Design Fundamentals',
    description:
      'Build the building blocks of distributed systems: caches, rate limiters, message brokers, and more — hands-on practice that goes beyond whiteboard diagrams.',
    icon: 'Server',
    tags: ['system-design', 'architecture', 'scalability'],
    sortOrder: 12,
  },

  // ── Framework & Technology (6) ────────────────────────────────────

  {
    slug: 'react-patterns',
    label: 'React & React Patterns',
    description:
      'Master hooks, component patterns, state management, and testing — the skills that land frontend engineering roles.',
    icon: 'Component',
    tags: ['react', 'hooks', 'components', 'state-management'],
    sortOrder: 13,
  },
  {
    slug: 'nextjs',
    label: 'Next.js & Full-Stack React',
    description:
      'Build with the dominant full-stack framework: server components, app router, API routes, and server actions.',
    icon: 'Globe',
    tags: ['nextjs', 'server-components', 'app-router', 'full-stack'],
    sortOrder: 14,
  },
  {
    slug: 'nodejs-express',
    label: 'Node.js & Express',
    description:
      'Build backend services with Express: middleware, authentication, error handling, and API patterns — the backbone of Node.js interviews.',
    icon: 'Server',
    tags: ['nodejs', 'express', 'middleware', 'api'],
    sortOrder: 15,
  },
  {
    slug: 'python-web',
    label: 'Python Web (Flask/FastAPI)',
    description:
      'Build web APIs with Flask and FastAPI: validation, dependency injection, blueprints, and async patterns for Python backend roles.',
    icon: 'Globe',
    tags: ['flask', 'fastapi', 'python-web'],
    sortOrder: 16,
  },
  {
    slug: 'typescript-patterns',
    label: 'TypeScript Patterns',
    description:
      'Go beyond basic types: generics, utility types, type guards, and advanced patterns that are expected at most companies in 2026.',
    icon: 'FileCode',
    tags: ['typescript', 'generics', 'type-guards', 'utility-types'],
    sortOrder: 17,
  },
  {
    slug: 'ai-integration',
    label: 'AI & LLM Integration',
    description:
      'Build AI-powered features: LLM API integration, prompt engineering, structured output, RAG patterns, and error handling — the must-have skill of 2026.',
    icon: 'Brain',
    tags: ['ai', 'llm', 'prompt-engineering', 'rag', 'openai'],
    sortOrder: 18,
  },
];

async function seedCategories() {
  console.log('🌱 Seeding exercise categories...');

  for (const category of categories) {
    await db
      .insert(exerciseCategories)
      .values(category)
      .onConflictDoUpdate({
        target: exerciseCategories.slug,
        set: {
          label: sql`excluded.label`,
          description: sql`excluded.description`,
          icon: sql`excluded.icon`,
          tags: sql`excluded.tags`,
          sortOrder: sql`excluded.sort_order`,
        },
      });
    console.log(`  ✅ ${category.slug} — ${category.label}`);
  }

  console.log(`\n✅ ${categories.length} categories seeded`);
}

seedCategories()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
