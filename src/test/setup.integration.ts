import { sql } from 'drizzle-orm';

// Mock env BEFORE anything imports @/index, so the real createDB()
// connects to the test database. vi.mock is hoisted, so this works.
vi.mock('@/env', () => ({
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/signa_test',
    STRIPE_SECRET_KEY: 'sk_test_fake_key_for_integration_tests',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_fake_secret_for_integration_tests',
    NEXT_PUBLIC_POSTHOG_KEY: 'phk_test',
    NEXT_PUBLIC_POSTHOG_HOST: 'https://posthog.test',
    NEXT_PUBLIC_SENTRY_DSN: 'https://sentry.test/123',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_fake_key_for_integration_tests',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

/**
 * Truncate all subscription-related tables for test isolation.
 * Uses CASCADE to handle FK constraints.
 */
export async function truncateAll() {
  // Lazy import to ensure the env mock is in place before @/index initializes
  const { db } = await import('@/index');
  await db.execute(sql`
    TRUNCATE TABLE
      subscription_events,
      payment_records,
      idempotency_keys,
      subscriptions,
      plan_prices,
      plans,
      notifications,
      users
    CASCADE
  `);
}

beforeEach(async () => {
  await truncateAll();
});
