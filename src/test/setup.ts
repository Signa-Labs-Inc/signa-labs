import '@testing-library/jest-dom/vitest';

vi.mock('@/env', () => ({
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://localhost:5432/signa_test',
    STRIPE_SECRET_KEY: 'sk_test_fake_key_for_unit_tests',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_fake_secret_for_unit_tests',
    NEXT_PUBLIC_POSTHOG_KEY: 'phk_test',
    NEXT_PUBLIC_POSTHOG_HOST: 'https://posthog.test',
    NEXT_PUBLIC_SENTRY_DSN: 'https://sentry.test/123',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_fake_key_for_unit_tests',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));
