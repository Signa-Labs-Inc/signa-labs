import {
  buildSubscription,
  buildPlanWithPrices,
  buildPlanPrice,
  buildSubscriptionEvent,
  buildPaymentRecord,
  buildPlan,
} from '@/test/helpers/factories';
import {
  buildStripeSubscription,
  buildStripeCheckoutSession,
  buildStripeInvoice,
  buildStripePrice,
  buildStripeProduct,
  buildStripeCustomer,
  buildStripeBillingPortalSession,
} from '@/test/helpers/stripe-fixtures';

// Mock all dependencies before importing the service
vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
    subscriptions: { retrieve: vi.fn() },
    prices: { retrieve: vi.fn(), create: vi.fn() },
    products: { create: vi.fn(), update: vi.fn() },
    invoices: { retrieve: vi.fn() },
    webhooks: { constructEvent: vi.fn() },
  },
}));

vi.mock('@/index', () => ({
  db: {
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        execute: vi.fn(),
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn().mockResolvedValue([]),
            })),
          })),
        })),
      })
    ),
  },
}));

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}));

vi.mock('@/lib/services/notifications/notifications.service', () => ({
  createUsageAlertIfNeeded: vi.fn().mockResolvedValue(false),
}));

vi.mock('@/lib/services/users/users.reader', () => ({
  getStripeCustomerId: vi.fn(),
}));

vi.mock('@/lib/services/users/users.writer', () => ({
  setStripeCustomerId: vi.fn(),
}));

vi.mock('../subscriptions.reader', () => ({
  getActiveSubscriptionByUserId: vi.fn(),
  getActivePlansWithPrices: vi.fn(),
  getSubscriptionByStripeId: vi.fn(),
  getSubscriptionByStripeIdForUpdate: vi.fn(),
  getPlanPriceByStripePriceId: vi.fn(),
  getPlanById: vi.fn(),
  getSubscriptionEventsByUserId: vi.fn(),
  getPaymentRecordsByUserId: vi.fn(),
  getIdempotencyKeyStatus: vi.fn(),
  countUserExercisesSince: vi.fn(),
  countUserPathsSince: vi.fn(),
  countUserAiGenerationsSince: vi.fn(),
  countUserSubmissionsSince: vi.fn(),
}));

vi.mock('../subscriptions.writer', () => ({
  insertSubscription: vi.fn(),
  updateSubscriptionByStripeId: vi.fn(),
  updateSubscriptionByStripeIdTx: vi.fn(),
  insertPaymentRecord: vi.fn(),
  insertIdempotencyKey: vi.fn(),
  markIdempotencyKeyCompleted: vi.fn(),
  deleteIdempotencyKey: vi.fn(),
  insertSubscriptionEvent: vi.fn(),
  insertSubscriptionEventTx: vi.fn(),
  insertPlan: vi.fn(),
  insertPlanPrice: vi.fn(),
}));

// Import after mocks
import { stripe } from '@/lib/stripe/client';
import { db } from '@/index';
import { getStripeCustomerId } from '@/lib/services/users/users.reader';
import { setStripeCustomerId } from '@/lib/services/users/users.writer';
import * as reader from '../subscriptions.reader';
import * as writer from '../subscriptions.writer';

import {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  getUserPlan,
  getUserSubscriptionHistory,
  getUserPaymentHistory,
  validatePlanFeatures,
  createPlanWithStripeProducts,
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from '../subscriptions.service';

// Typed mocks
const mockStripe = vi.mocked(stripe);
const mockGetStripeCustomerId = vi.mocked(getStripeCustomerId);
const mockSetStripeCustomerId = vi.mocked(setStripeCustomerId);
const mockReader = vi.mocked(reader);
const mockWriter = vi.mocked(writer);
const mockDb = vi.mocked(db);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── getOrCreateStripeCustomer ───────────────────────────────────────────

describe('getOrCreateStripeCustomer', () => {
  it('returns existing customer ID when found', async () => {
    mockGetStripeCustomerId.mockResolvedValue('cus_existing');

    const result = await getOrCreateStripeCustomer('user1', 'test@test.com');
    expect(result).toBe('cus_existing');
    expect(mockStripe.customers.create).not.toHaveBeenCalled();
  });

  it('creates new customer and saves ID when none exists', async () => {
    mockGetStripeCustomerId.mockResolvedValueOnce(null).mockResolvedValueOnce('cus_new_123');
    mockStripe.customers.create.mockResolvedValue(
      buildStripeCustomer({ id: 'cus_new_123' }) as never
    );

    const result = await getOrCreateStripeCustomer('user1', 'test@test.com');
    expect(result).toBe('cus_new_123');
    expect(mockStripe.customers.create).toHaveBeenCalledWith({
      email: 'test@test.com',
      metadata: { userId: 'user1' },
    });
    expect(mockSetStripeCustomerId).toHaveBeenCalledWith('user1', 'cus_new_123');
  });

  it('re-reads after race condition', async () => {
    mockGetStripeCustomerId.mockResolvedValueOnce(null).mockResolvedValueOnce('cus_race_winner');
    mockStripe.customers.create.mockResolvedValue(
      buildStripeCustomer({ id: 'cus_race_loser' }) as never
    );

    const result = await getOrCreateStripeCustomer('user1', 'test@test.com');
    expect(result).toBe('cus_race_winner');
  });

  it('falls back to created customer ID if re-read returns null', async () => {
    mockGetStripeCustomerId.mockResolvedValue(null);
    mockStripe.customers.create.mockResolvedValue(
      buildStripeCustomer({ id: 'cus_fallback' }) as never
    );

    const result = await getOrCreateStripeCustomer('user1', 'test@test.com');
    expect(result).toBe('cus_fallback');
  });
});

// ─── createCheckoutSession ───────────────────────────────────────────────

describe('createCheckoutSession', () => {
  const planWithPrices = buildPlanWithPrices();

  it('throws ConflictError when user already subscribed', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(buildSubscription() as never);

    await expect(createCheckoutSession('user1', 'test@test.com', 'pro', 'month')).rejects.toThrow(
      'User already has an active subscription'
    );
  });

  it('throws NotFoundError when plan not found', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
    mockReader.getActivePlansWithPrices.mockResolvedValue([]);

    await expect(
      createCheckoutSession('user1', 'test@test.com', 'nonexistent', 'month')
    ).rejects.toThrow('not found');
  });

  it('throws ValidationError when no price for interval', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
    mockReader.getActivePlansWithPrices.mockResolvedValue([
      buildPlanWithPrices({
        prices: [
          { id: '1', stripePriceId: 'price_test_yearly', currency: 'usd', interval: 'year' },
        ],
      }),
    ]);

    await expect(createCheckoutSession('user1', 'test@test.com', 'pro', 'month')).rejects.toThrow(
      'No month price found'
    );
  });

  it('throws ValidationError for PLACEHOLDER price', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
    mockReader.getActivePlansWithPrices.mockResolvedValue([
      buildPlanWithPrices({
        prices: [
          { id: '1', stripePriceId: 'PLACEHOLDER_monthly', currency: 'usd', interval: 'month' },
        ],
      }),
    ]);

    await expect(createCheckoutSession('user1', 'test@test.com', 'pro', 'month')).rejects.toThrow(
      'No month price found'
    );
  });

  it('throws ValidationError when stripe.prices.retrieve throws', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
    mockReader.getActivePlansWithPrices.mockResolvedValue([planWithPrices]);
    mockStripe.prices.retrieve.mockRejectedValue(new Error('Stripe error'));

    await expect(createCheckoutSession('user1', 'test@test.com', 'pro', 'month')).rejects.toThrow(
      'no longer available'
    );
  });

  it('throws ValidationError when Stripe price is inactive', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
    mockReader.getActivePlansWithPrices.mockResolvedValue([planWithPrices]);
    mockStripe.prices.retrieve.mockResolvedValue(buildStripePrice({ active: false }) as never);

    await expect(createCheckoutSession('user1', 'test@test.com', 'pro', 'month')).rejects.toThrow(
      'no longer available'
    );
  });

  it('returns session URL on success', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
    mockReader.getActivePlansWithPrices.mockResolvedValue([planWithPrices]);
    mockStripe.prices.retrieve.mockResolvedValue(buildStripePrice() as never);
    mockGetStripeCustomerId.mockResolvedValue('cus_test_123');
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/pay/test',
    } as never);

    const url = await createCheckoutSession('user1', 'test@test.com', 'pro', 'month');
    expect(url).toBe('https://checkout.stripe.com/pay/test');
  });

  it('throws InternalServerError when session.url is null', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
    mockReader.getActivePlansWithPrices.mockResolvedValue([planWithPrices]);
    mockStripe.prices.retrieve.mockResolvedValue(buildStripePrice() as never);
    mockGetStripeCustomerId.mockResolvedValue('cus_test_123');
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: null } as never);

    await expect(createCheckoutSession('user1', 'test@test.com', 'pro', 'month')).rejects.toThrow(
      'Failed to create checkout session'
    );
  });

  it('passes correct line_items and metadata to Stripe', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
    mockReader.getActivePlansWithPrices.mockResolvedValue([planWithPrices]);
    mockStripe.prices.retrieve.mockResolvedValue(buildStripePrice() as never);
    mockGetStripeCustomerId.mockResolvedValue('cus_test_123');
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: 'https://test.com' } as never);

    await createCheckoutSession('user1', 'test@test.com', 'pro', 'month');

    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_test_123',
        mode: 'subscription',
        line_items: [{ price: 'price_test_monthly', quantity: 1 }],
        metadata: { userId: 'user1', planId: 'pro' },
      })
    );
  });
});

// ─── createBillingPortalSession ──────────────────────────────────────────

describe('createBillingPortalSession', () => {
  it('creates portal session and returns URL', async () => {
    mockGetStripeCustomerId.mockResolvedValue('cus_test_123');
    mockStripe.billingPortal.sessions.create.mockResolvedValue(
      buildStripeBillingPortalSession() as never
    );

    const url = await createBillingPortalSession('user1', 'test@test.com');
    expect(url).toBe('https://billing.stripe.com/session/test');
  });

  it('creates Stripe customer first if none exists', async () => {
    mockGetStripeCustomerId.mockResolvedValueOnce(null).mockResolvedValueOnce('cus_new');
    mockStripe.customers.create.mockResolvedValue(buildStripeCustomer({ id: 'cus_new' }) as never);
    mockStripe.billingPortal.sessions.create.mockResolvedValue(
      buildStripeBillingPortalSession() as never
    );

    await createBillingPortalSession('user1', 'test@test.com');
    expect(mockStripe.customers.create).toHaveBeenCalled();
  });
});

// ─── getUserPlan ─────────────────────────────────────────────────────────

describe('getUserPlan', () => {
  it('returns null when no subscription', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);

    const result = await getUserPlan('user1');
    expect(result).toBeNull();
  });

  it('returns null when plan not found', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(buildSubscription() as never);
    mockReader.getPlanById.mockResolvedValue(null);

    const result = await getUserPlan('user1');
    expect(result).toBeNull();
  });

  it('returns correctly shaped UserPlan', async () => {
    const sub = buildSubscription({ status: 'active', cancelAtPeriodEnd: false });
    const plan = buildPlan({ id: 'pro', name: 'Pro' });
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(sub as never);
    mockReader.getPlanById.mockResolvedValue(plan);

    const result = await getUserPlan('user1');
    expect(result).toEqual({
      planId: 'pro',
      planName: 'Pro',
      status: 'active',
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });
  });
});

// ─── getUserSubscriptionHistory ──────────────────────────────────────────

describe('getUserSubscriptionHistory', () => {
  it('maps events with ISO dates and parses JSON metadata', async () => {
    const event = buildSubscriptionEvent({
      metadata: JSON.stringify({ planId: 'pro' }),
      createdAt: new Date('2026-03-01T00:00:00Z'),
    });
    mockReader.getSubscriptionEventsByUserId.mockResolvedValue([event] as never);

    const result = await getUserSubscriptionHistory('user1');
    expect(result[0].metadata).toEqual({ planId: 'pro' });
    expect(result[0].createdAt).toBe('2026-03-01T00:00:00.000Z');
  });

  it('handles null metadata', async () => {
    mockReader.getSubscriptionEventsByUserId.mockResolvedValue([
      buildSubscriptionEvent({ metadata: null }),
    ] as never);

    const result = await getUserSubscriptionHistory('user1');
    expect(result[0].metadata).toBeNull();
  });
});

// ─── getUserPaymentHistory ───────────────────────────────────────────────

describe('getUserPaymentHistory', () => {
  it('maps records with ISO dates and calls toPaymentStatus', async () => {
    const record = buildPaymentRecord({
      status: 'succeeded',
      paidAt: new Date('2026-03-01T00:00:00Z'),
      createdAt: new Date('2026-03-01T00:00:00Z'),
    });
    mockReader.getPaymentRecordsByUserId.mockResolvedValue([record] as never);

    const result = await getUserPaymentHistory('user1');
    expect(result[0].status).toBe('succeeded');
    expect(result[0].paidAt).toBe('2026-03-01T00:00:00.000Z');
    expect(result[0].createdAt).toBe('2026-03-01T00:00:00.000Z');
  });

  it('handles null paidAt', async () => {
    mockReader.getPaymentRecordsByUserId.mockResolvedValue([
      buildPaymentRecord({ paidAt: null }),
    ] as never);

    const result = await getUserPaymentHistory('user1');
    expect(result[0].paidAt).toBeNull();
  });
});

// ─── validatePlanFeatures ────────────────────────────────────────────────

describe('validatePlanFeatures', () => {
  const validFeatures = {
    exercises: { limit: 10, window: 'day' },
    paths: { limit: 3, window: 'week' },
    aiGenerations: { limit: 10, window: 'day' },
    submissions: { limit: 50, window: 'day' },
  };

  it('returns valid features', () => {
    expect(validatePlanFeatures(validFeatures)).toEqual(validFeatures);
  });

  it('throws for non-object', () => {
    expect(() => validatePlanFeatures('string')).toThrow('features must be an object');
  });

  it('throws for null', () => {
    expect(() => validatePlanFeatures(null)).toThrow('features must be an object');
  });

  it('throws for array', () => {
    expect(() => validatePlanFeatures([])).toThrow('features must be an object');
  });

  it('throws for missing keys', () => {
    expect(() => validatePlanFeatures({ exercises: { limit: 10, window: 'day' } })).toThrow(
      'features.paths is required'
    );
  });

  it('throws for bad limit', () => {
    expect(() =>
      validatePlanFeatures({
        ...validFeatures,
        exercises: { limit: -2, window: 'day' },
      })
    ).toThrow('features.exercises.limit must be an integer >= -1');
  });

  it('throws for non-integer limit', () => {
    expect(() =>
      validatePlanFeatures({
        ...validFeatures,
        exercises: { limit: 1.5, window: 'day' },
      })
    ).toThrow('features.exercises.limit must be an integer >= -1');
  });

  it('throws for bad window', () => {
    expect(() =>
      validatePlanFeatures({
        ...validFeatures,
        exercises: { limit: 10, window: 'hour' },
      })
    ).toThrow('features.exercises.window must be one of');
  });
});

// ─── createPlanWithStripeProducts ────────────────────────────────────────

describe('createPlanWithStripeProducts', () => {
  const validFeatures = {
    exercises: { limit: 10, window: 'day' as const },
    paths: { limit: 3, window: 'week' as const },
    aiGenerations: { limit: 10, window: 'day' as const },
    submissions: { limit: 50, window: 'day' as const },
  };

  it('throws ConflictError for duplicate plan ID', async () => {
    mockReader.getPlanById.mockResolvedValue(buildPlan());

    await expect(
      createPlanWithStripeProducts({ id: 'pro', name: 'Pro', features: validFeatures })
    ).rejects.toThrow('already exists');
  });

  it('creates plan without Stripe when no pricing', async () => {
    mockReader.getPlanById.mockResolvedValue(null);
    mockWriter.insertPlan.mockResolvedValue(buildPlan() as never);

    await createPlanWithStripeProducts({ id: 'free', name: 'Free', features: validFeatures });

    expect(mockStripe.products.create).not.toHaveBeenCalled();
    expect(mockWriter.insertPlan).toHaveBeenCalled();
  });

  it('creates product + monthly + yearly prices', async () => {
    mockReader.getPlanById.mockResolvedValue(null);
    mockStripe.products.create.mockResolvedValue(buildStripeProduct() as never);
    mockStripe.prices.create
      .mockResolvedValueOnce(buildStripePrice({ id: 'price_monthly' }) as never)
      .mockResolvedValueOnce(buildStripePrice({ id: 'price_yearly' }) as never);
    mockWriter.insertPlan.mockResolvedValue(buildPlan() as never);
    mockWriter.insertPlanPrice.mockResolvedValue(buildPlanPrice() as never);

    await createPlanWithStripeProducts({
      id: 'pro',
      name: 'Pro',
      features: validFeatures,
      pricing: { currency: 'usd', monthlyPriceCents: 999, yearlyPriceCents: 9990 },
    });

    expect(mockStripe.products.create).toHaveBeenCalled();
    expect(mockStripe.prices.create).toHaveBeenCalledTimes(2);
    expect(mockWriter.insertPlanPrice).toHaveBeenCalledTimes(2);
  });

  it('archives Stripe product on price creation failure', async () => {
    mockReader.getPlanById.mockResolvedValue(null);
    mockStripe.products.create.mockResolvedValue(
      buildStripeProduct({ id: 'prod_orphan' }) as never
    );
    mockStripe.prices.create.mockRejectedValue(new Error('Stripe error'));

    await expect(
      createPlanWithStripeProducts({
        id: 'pro',
        name: 'Pro',
        features: validFeatures,
        pricing: { currency: 'usd', monthlyPriceCents: 999 },
      })
    ).rejects.toThrow('Failed to create Stripe product/prices');

    expect(mockStripe.products.update).toHaveBeenCalledWith('prod_orphan', { active: false });
  });

  it('archives Stripe product on DB insert failure', async () => {
    mockReader.getPlanById.mockResolvedValue(null);
    mockStripe.products.create.mockResolvedValue(
      buildStripeProduct({ id: 'prod_orphan' }) as never
    );
    mockStripe.prices.create.mockResolvedValue(buildStripePrice() as never);
    mockWriter.insertPlan.mockRejectedValue(new Error('DB error'));

    await expect(
      createPlanWithStripeProducts({
        id: 'pro',
        name: 'Pro',
        features: validFeatures,
        pricing: { currency: 'usd', monthlyPriceCents: 999 },
      })
    ).rejects.toThrow();

    expect(mockStripe.products.update).toHaveBeenCalledWith('prod_orphan', { active: false });
  });

  it('throws ValidationError for unsupported currency', async () => {
    mockReader.getPlanById.mockResolvedValue(null);

    await expect(
      createPlanWithStripeProducts({
        id: 'pro',
        name: 'Pro',
        features: validFeatures,
        pricing: { currency: 'xyz', monthlyPriceCents: 999 },
      })
    ).rejects.toThrow('Currency must be one of');
  });

  it('throws ValidationError when no prices provided with pricing', async () => {
    mockReader.getPlanById.mockResolvedValue(null);

    await expect(
      createPlanWithStripeProducts({
        id: 'pro',
        name: 'Pro',
        features: validFeatures,
        pricing: { currency: 'usd' },
      })
    ).rejects.toThrow('At least one price');
  });

  it('throws ValidationError for non-positive price', async () => {
    mockReader.getPlanById.mockResolvedValue(null);

    await expect(
      createPlanWithStripeProducts({
        id: 'pro',
        name: 'Pro',
        features: validFeatures,
        pricing: { currency: 'usd', monthlyPriceCents: 0 },
      })
    ).rejects.toThrow('positive whole number');
  });

  it('throws ValidationError for non-integer price', async () => {
    mockReader.getPlanById.mockResolvedValue(null);

    await expect(
      createPlanWithStripeProducts({
        id: 'pro',
        name: 'Pro',
        features: validFeatures,
        pricing: { currency: 'usd', monthlyPriceCents: 9.99 },
      })
    ).rejects.toThrow('positive whole number');
  });
});

// ─── handleCheckoutCompleted ─────────────────────────────────────────────

describe('handleCheckoutCompleted', () => {
  it('throws when metadata is missing', async () => {
    const session = buildStripeCheckoutSession({ metadata: {} });

    await expect(handleCheckoutCompleted(session)).rejects.toThrow('missing metadata');
  });

  it('is idempotent when subscription exists', async () => {
    const session = buildStripeCheckoutSession();
    mockReader.getSubscriptionByStripeId.mockResolvedValue(buildSubscription() as never);

    await handleCheckoutCompleted(session);
    expect(mockStripe.subscriptions.retrieve).not.toHaveBeenCalled();
  });

  it('retrieves sub from Stripe and inserts subscription + event', async () => {
    const session = buildStripeCheckoutSession();
    const stripeSub = buildStripeSubscription();
    const planPrice = buildPlanPrice({ planId: 'pro' });

    mockReader.getSubscriptionByStripeId.mockResolvedValue(null);
    mockStripe.subscriptions.retrieve.mockResolvedValue(stripeSub as never);
    mockReader.getPlanPriceByStripePriceId.mockResolvedValue(planPrice);
    mockWriter.insertSubscription.mockResolvedValue(buildSubscription() as never);

    await handleCheckoutCompleted(session);

    expect(mockWriter.insertSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_test_123',
        planId: 'pro',
        stripeSubscriptionId: 'sub_test_123',
        stripeCustomerId: 'cus_test_123',
        status: 'active',
      })
    );
    expect(mockWriter.insertSubscriptionEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'created',
        userId: 'user_test_123',
      })
    );
  });

  it('handles string subscription ID on session', async () => {
    const session = buildStripeCheckoutSession({ subscription: 'sub_string_123' });
    const stripeSub = buildStripeSubscription({ id: 'sub_string_123' });

    mockReader.getSubscriptionByStripeId.mockResolvedValue(null);
    mockStripe.subscriptions.retrieve.mockResolvedValue(stripeSub as never);
    mockReader.getPlanPriceByStripePriceId.mockResolvedValue(buildPlanPrice());
    mockWriter.insertSubscription.mockResolvedValue(buildSubscription() as never);

    await handleCheckoutCompleted(session);
    expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_string_123');
  });

  it('handles object subscription on session', async () => {
    const session = buildStripeCheckoutSession({ subscription: { id: 'sub_obj_123' } });
    const stripeSub = buildStripeSubscription({ id: 'sub_obj_123' });

    mockReader.getSubscriptionByStripeId.mockResolvedValue(null);
    mockStripe.subscriptions.retrieve.mockResolvedValue(stripeSub as never);
    mockReader.getPlanPriceByStripePriceId.mockResolvedValue(buildPlanPrice());
    mockWriter.insertSubscription.mockResolvedValue(buildSubscription() as never);

    await handleCheckoutCompleted(session);
    expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_obj_123');
  });

  it('throws when price not found in DB', async () => {
    const session = buildStripeCheckoutSession();
    mockReader.getSubscriptionByStripeId.mockResolvedValue(null);
    mockStripe.subscriptions.retrieve.mockResolvedValue(buildStripeSubscription() as never);
    mockReader.getPlanPriceByStripePriceId.mockResolvedValue(null);

    await expect(handleCheckoutCompleted(session)).rejects.toThrow('unknown Stripe price');
  });

  it('throws when no price on subscription items', async () => {
    const session = buildStripeCheckoutSession();
    const stripeSub = buildStripeSubscription();
    (stripeSub.items.data as unknown[]).length = 0;

    mockReader.getSubscriptionByStripeId.mockResolvedValue(null);
    mockStripe.subscriptions.retrieve.mockResolvedValue(stripeSub as never);

    await expect(handleCheckoutCompleted(session)).rejects.toThrow('no price found');
  });
});

// ─── handleSubscriptionUpdated ───────────────────────────────────────────

describe('handleSubscriptionUpdated', () => {
  const mockTx = {
    execute: vi.fn(),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
  };

  beforeEach(() => {
    mockDb.transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(mockTx)
    );
  });

  it('updates status, period, and cancelAtPeriodEnd', async () => {
    const stripeSub = buildStripeSubscription({
      cancel_at_period_end: true,
      canceled_at: 1709251200,
    });
    mockReader.getPlanPriceByStripePriceId.mockResolvedValue(buildPlanPrice({ planId: 'pro' }));
    mockReader.getSubscriptionByStripeIdForUpdate.mockResolvedValue(
      buildSubscription({ planId: 'pro' }) as never
    );

    await handleSubscriptionUpdated(stripeSub);

    expect(mockWriter.updateSubscriptionByStripeIdTx).toHaveBeenCalledWith(
      'sub_test_123',
      expect.objectContaining({
        status: 'active',
        cancelAtPeriodEnd: true,
      }),
      mockTx
    );
  });

  it('logs upgraded when sortOrder increases', async () => {
    const stripeSub = buildStripeSubscription();
    const newPlanPrice = buildPlanPrice({ planId: 'enterprise' });
    mockReader.getPlanPriceByStripePriceId.mockResolvedValue(newPlanPrice);
    mockReader.getSubscriptionByStripeIdForUpdate.mockResolvedValue(
      buildSubscription({ planId: 'pro' }) as never
    );
    mockReader.getPlanById
      .mockResolvedValueOnce(buildPlan({ id: 'pro', sortOrder: 1 }))
      .mockResolvedValueOnce(buildPlan({ id: 'enterprise', sortOrder: 2 }));

    await handleSubscriptionUpdated(stripeSub);

    expect(mockWriter.insertSubscriptionEventTx).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'upgraded' }),
      mockTx
    );
  });

  it('logs downgraded when sortOrder decreases', async () => {
    const stripeSub = buildStripeSubscription();
    const newPlanPrice = buildPlanPrice({ planId: 'free' });
    mockReader.getPlanPriceByStripePriceId.mockResolvedValue(newPlanPrice);
    mockReader.getSubscriptionByStripeIdForUpdate.mockResolvedValue(
      buildSubscription({ planId: 'pro' }) as never
    );
    mockReader.getPlanById
      .mockResolvedValueOnce(buildPlan({ id: 'pro', sortOrder: 1 }))
      .mockResolvedValueOnce(buildPlan({ id: 'free', sortOrder: 0 }));

    await handleSubscriptionUpdated(stripeSub);

    expect(mockWriter.insertSubscriptionEventTx).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'downgraded' }),
      mockTx
    );
  });

  it('logs cancelled when cancelAtPeriodEnd becomes true', async () => {
    const stripeSub = buildStripeSubscription({ cancel_at_period_end: true });
    mockReader.getPlanPriceByStripePriceId.mockResolvedValue(buildPlanPrice({ planId: 'pro' }));
    mockReader.getSubscriptionByStripeIdForUpdate.mockResolvedValue(
      buildSubscription({ planId: 'pro', cancelAtPeriodEnd: false }) as never
    );

    await handleSubscriptionUpdated(stripeSub);

    expect(mockWriter.insertSubscriptionEventTx).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'cancelled' }),
      mockTx
    );
  });

  it('logs reactivated when cancelAtPeriodEnd becomes false', async () => {
    const stripeSub = buildStripeSubscription({ cancel_at_period_end: false });
    mockReader.getPlanPriceByStripePriceId.mockResolvedValue(buildPlanPrice({ planId: 'pro' }));
    mockReader.getSubscriptionByStripeIdForUpdate.mockResolvedValue(
      buildSubscription({ planId: 'pro', cancelAtPeriodEnd: true }) as never
    );

    await handleSubscriptionUpdated(stripeSub);

    expect(mockWriter.insertSubscriptionEventTx).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'reactivated' }),
      mockTx
    );
  });

  it('does not log plan change event when planPrice is null', async () => {
    const stripeSub = buildStripeSubscription();
    // Force no items to get null planPrice
    (stripeSub.items.data as unknown[]).length = 0;
    mockReader.getSubscriptionByStripeIdForUpdate.mockResolvedValue(
      buildSubscription({ planId: 'pro', cancelAtPeriodEnd: false }) as never
    );

    await handleSubscriptionUpdated(stripeSub);

    expect(mockWriter.insertSubscriptionEventTx).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'upgraded' }),
      expect.anything()
    );
  });

  it('handles no existing subscription gracefully', async () => {
    const stripeSub = buildStripeSubscription();
    mockReader.getPlanPriceByStripePriceId.mockResolvedValue(buildPlanPrice({ planId: 'pro' }));
    mockReader.getSubscriptionByStripeIdForUpdate.mockResolvedValue(null);

    await handleSubscriptionUpdated(stripeSub);
    expect(mockWriter.insertSubscriptionEventTx).not.toHaveBeenCalled();
  });
});

// ─── handleSubscriptionDeleted ───────────────────────────────────────────

describe('handleSubscriptionDeleted', () => {
  it('updates status to canceled and logs event', async () => {
    const stripeSub = buildStripeSubscription();
    const existing = buildSubscription({ stripeSubscriptionId: 'sub_test_123' });
    mockReader.getSubscriptionByStripeId.mockResolvedValue(existing as never);

    await handleSubscriptionDeleted(stripeSub);

    expect(mockWriter.updateSubscriptionByStripeId).toHaveBeenCalledWith(
      'sub_test_123',
      expect.objectContaining({ status: 'canceled' })
    );
    expect(mockWriter.insertSubscriptionEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'cancelled' })
    );
  });

  it('still updates when no existing sub (no event)', async () => {
    const stripeSub = buildStripeSubscription();
    mockReader.getSubscriptionByStripeId.mockResolvedValue(null);

    await handleSubscriptionDeleted(stripeSub);

    expect(mockWriter.updateSubscriptionByStripeId).toHaveBeenCalled();
    expect(mockWriter.insertSubscriptionEvent).not.toHaveBeenCalled();
  });
});

// ─── handleInvoicePaid ───────────────────────────────────────────────────

describe('handleInvoicePaid', () => {
  it('inserts succeeded payment record', async () => {
    const invoice = buildStripeInvoice();
    const sub = buildSubscription();
    mockReader.getSubscriptionByStripeId.mockResolvedValue(sub as never);

    await handleInvoicePaid(invoice);

    expect(mockWriter.insertPaymentRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'succeeded',
        stripeInvoiceId: 'in_test_123',
        amountCents: 999,
      })
    );
  });

  it('resolves userId from invoice metadata when no sub found', async () => {
    const invoice = buildStripeInvoice();
    mockReader.getSubscriptionByStripeId.mockResolvedValue(null);

    await handleInvoicePaid(invoice);

    expect(mockWriter.insertPaymentRecord).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_test_123' })
    );
  });

  it('throws when userId unresolvable', async () => {
    const invoice = buildStripeInvoice({
      parent: {
        type: 'subscription_details',
        subscription_details: { subscription: 'sub_unknown', metadata: {} },
      },
    });
    mockReader.getSubscriptionByStripeId.mockResolvedValue(null);

    await expect(handleInvoicePaid(invoice)).rejects.toThrow('cannot resolve userId');
  });
});

// ─── handleInvoicePaymentFailed ──────────────────────────────────────────

describe('handleInvoicePaymentFailed', () => {
  it('inserts failed payment record', async () => {
    const invoice = buildStripeInvoice();
    const sub = buildSubscription();
    mockReader.getSubscriptionByStripeId.mockResolvedValue(sub as never);

    await handleInvoicePaymentFailed(invoice);

    expect(mockWriter.insertPaymentRecord).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed' })
    );
  });

  it('updates sub to past_due and logs event', async () => {
    const invoice = buildStripeInvoice();
    const sub = buildSubscription();
    mockReader.getSubscriptionByStripeId.mockResolvedValue(sub as never);

    await handleInvoicePaymentFailed(invoice);

    expect(mockWriter.updateSubscriptionByStripeId).toHaveBeenCalledWith(
      'sub_test_123',
      expect.objectContaining({ status: 'past_due' })
    );
    expect(mockWriter.insertSubscriptionEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'payment_failed' })
    );
  });

  it('throws when userId unresolvable', async () => {
    const invoice = buildStripeInvoice({
      parent: {
        type: 'subscription_details',
        subscription_details: { subscription: 'sub_unknown', metadata: {} },
      },
    });
    mockReader.getSubscriptionByStripeId.mockResolvedValue(null);

    await expect(handleInvoicePaymentFailed(invoice)).rejects.toThrow('cannot resolve userId');
  });

  it('does not update sub when none found', async () => {
    const invoice = buildStripeInvoice();
    mockReader.getSubscriptionByStripeId.mockResolvedValue(null);

    await handleInvoicePaymentFailed(invoice);

    expect(mockWriter.updateSubscriptionByStripeId).not.toHaveBeenCalled();
  });
});
