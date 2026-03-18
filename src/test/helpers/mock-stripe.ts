import { vi } from 'vitest';

export const mockStripe = {
  customers: {
    create: vi.fn(),
  },
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  billingPortal: {
    sessions: {
      create: vi.fn(),
    },
  },
  subscriptions: {
    retrieve: vi.fn(),
  },
  prices: {
    retrieve: vi.fn(),
    create: vi.fn(),
  },
  products: {
    create: vi.fn(),
    update: vi.fn(),
  },
  invoices: {
    retrieve: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

/**
 * Call this in your test file to mock the stripe client.
 * Must be called at the top level (before imports of modules that use stripe).
 *
 * Usage:
 *   vi.mock('@/lib/stripe/client', () => ({ stripe: mockStripe }));
 *
 * Or use setupMockStripe() in beforeEach to reset all mocks.
 */
export function setupMockStripe() {
  mockStripe.customers.create.mockReset();
  mockStripe.checkout.sessions.create.mockReset();
  mockStripe.billingPortal.sessions.create.mockReset();
  mockStripe.subscriptions.retrieve.mockReset();
  mockStripe.prices.retrieve.mockReset();
  mockStripe.prices.create.mockReset();
  mockStripe.products.create.mockReset();
  mockStripe.products.update.mockReset();
  mockStripe.invoices.retrieve.mockReset();
  mockStripe.webhooks.constructEvent.mockReset();
}
