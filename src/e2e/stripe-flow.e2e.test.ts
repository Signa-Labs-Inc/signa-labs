/**
 * E2E Stripe Flow Tests
 *
 * These tests require:
 *   - STRIPE_TEST_MODE=true
 *   - STRIPE_SECRET_KEY set to a Stripe test-mode secret key
 *   - A running Postgres with the signa_test database
 *
 * Run with: STRIPE_TEST_MODE=true pnpm test:all -- --include 'src/e2e/**'
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe.skipIf(!process.env.STRIPE_TEST_MODE)('Stripe E2E Flow', () => {
  beforeAll(async () => {
    // Ensure test DB is set up and env is configured
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set for E2E tests');
    }
    if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      throw new Error('STRIPE_SECRET_KEY must be a test-mode key for E2E tests');
    }
  });

  it('creates a Stripe customer', async () => {
    const { stripe } = await import('@/lib/stripe/client');

    const customer = await stripe.customers.create({
      email: 'e2e-test@signa-labs.com',
      metadata: { userId: 'e2e_test_user', test: 'true' },
    });

    expect(customer.id).toMatch(/^cus_/);
    expect(customer.email).toBe('e2e-test@signa-labs.com');

    // Cleanup
    await stripe.customers.del(customer.id);
  });

  it('creates and retrieves a Stripe product and price', async () => {
    const { stripe } = await import('@/lib/stripe/client');

    const product = await stripe.products.create({
      name: 'E2E Test Product',
      metadata: { test: 'true' },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 999,
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    expect(price.id).toMatch(/^price_/);
    expect(price.unit_amount).toBe(999);
    expect(price.active).toBe(true);

    // Cleanup
    await stripe.products.update(product.id, { active: false });
  });

  it('creates a checkout session with valid parameters', async () => {
    const { stripe } = await import('@/lib/stripe/client');

    const customer = await stripe.customers.create({
      email: 'e2e-checkout@signa-labs.com',
      metadata: { test: 'true' },
    });

    const product = await stripe.products.create({
      name: 'E2E Checkout Product',
      metadata: { test: 'true' },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 999,
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      metadata: { userId: 'e2e_test_user', planId: 'e2e_pro' },
    });

    expect(session.id).toMatch(/^cs_test_/);
    expect(session.url).toBeTruthy();

    // Cleanup
    await stripe.products.update(product.id, { active: false });
    await stripe.customers.del(customer.id);
  });
});
