import { db } from '@/index';
import { users, plans, planPrices, subscriptions, paymentRecords, subscriptionEvents, idempotencyKeys } from '@/db/schema/tables';
import {
  getActiveSubscriptionByUserId,
  getSubscriptionByStripeId,
  getActivePlansWithPrices,
  getPlanPriceByStripePriceId,
  getIdempotencyKeyStatus,
  countActiveSubscriptionsForPlan,
  getSubscriptionEventsByUserId,
  getPaymentRecordsByUserId,
} from '../subscriptions.reader';

// Seed helpers — use `db` (mocked to test DB) so seeding and production code
// share the exact same connection, avoiding cross-connection visibility issues
async function seedUser(id = crypto.randomUUID()) {
  const [u] = await db.insert(users).values({
    id,
    clerkId: `clerk_${id}`,
    email: `${id}@test.com`,
    name: 'Test User',
    role: 'learner',
  }).onConflictDoNothing().returning();
  return u;
}

async function seedPlan(id = `pro_${Date.now()}`, sortOrder = 1) {
  const [p] = await db.insert(plans).values({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    description: `${id} plan`,
    features: {
      exercises: { limit: 10, window: 'day' },
      paths: { limit: 3, window: 'week' },
      aiGenerations: { limit: 10, window: 'day' },
      submissions: { limit: 50, window: 'day' },
    },
    displayFeatures: [],
    sortOrder,
    isActive: true,
  }).onConflictDoNothing().returning();
  return p;
}

async function seedPlanPrice(planId: string, stripePriceId: string, interval = 'month') {
  const [pp] = await db.insert(planPrices).values({
    planId,
    stripePriceId,
    currency: 'usd',
    interval,
    isActive: true,
  }).returning();
  return pp;
}

async function seedSubscription(userId: string, planId: string, planPriceId: string, overrides: Record<string, unknown> = {}) {
  const [sub] = await db.insert(subscriptions).values({
    userId,
    ownerType: 'user',
    planId,
    planPriceId,
    stripeSubscriptionId: `sub_int_${Date.now()}`,
    stripeCustomerId: 'cus_int_123',
    status: 'active',
    totalSeats: null,
    ...overrides,
  }).returning();
  return sub;
}

describe('subscriptions.reader integration', () => {
  let userId: string;
  let planId: string;
  let priceId: string;

  beforeEach(async () => {
    const user = await seedUser();
    userId = user!.id;
    const plan = await seedPlan();
    planId = plan!.id;
    const price = await seedPlanPrice(planId, `price_int_${Date.now()}`);
    priceId = price!.id;
  });

  describe('getActiveSubscriptionByUserId', () => {
    it('returns active subscription', async () => {
      await seedSubscription(userId, planId, priceId);
      const sub = await getActiveSubscriptionByUserId(userId);
      expect(sub).not.toBeNull();
      expect(sub!.userId).toBe(userId);
      expect(sub!.status).toBe('active');
    });

    it('skips canceled subscriptions', async () => {
      await seedSubscription(userId, planId, priceId, { status: 'canceled' });
      const sub = await getActiveSubscriptionByUserId(userId);
      expect(sub).toBeNull();
    });

    it('returns trialing subscriptions', async () => {
      await seedSubscription(userId, planId, priceId, { status: 'trialing' });
      const sub = await getActiveSubscriptionByUserId(userId);
      expect(sub).not.toBeNull();
      expect(sub!.status).toBe('trialing');
    });

    it('returns past_due subscriptions', async () => {
      await seedSubscription(userId, planId, priceId, { status: 'past_due' });
      const sub = await getActiveSubscriptionByUserId(userId);
      expect(sub).not.toBeNull();
    });
  });

  describe('getSubscriptionByStripeId', () => {
    it('finds by stripe ID', async () => {
      const stripeSubId = `sub_stripe_${Date.now()}`;
      await seedSubscription(userId, planId, priceId, { stripeSubscriptionId: stripeSubId });
      const sub = await getSubscriptionByStripeId(stripeSubId);
      expect(sub).not.toBeNull();
      expect(sub!.stripeSubscriptionId).toBe(stripeSubId);
    });
  });

  describe('getActivePlansWithPrices', () => {
    it('returns only active plans with prices', async () => {
      const result = await getActivePlansWithPrices();
      expect(result.length).toBeGreaterThanOrEqual(1);
      const plan = result.find((p) => p.id === planId);
      expect(plan).toBeDefined();
      expect(plan!.prices.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getPlanPriceByStripePriceId', () => {
    it('finds correct price', async () => {
      const pp = await seedPlanPrice(planId, `price_lookup_${Date.now()}`);
      const found = await getPlanPriceByStripePriceId(pp!.stripePriceId);
      expect(found).not.toBeNull();
      expect(found!.planId).toBe(planId);
    });
  });

  describe('getIdempotencyKeyStatus', () => {
    it('returns null when key does not exist', async () => {
      const status = await getIdempotencyKeyStatus('nonexistent', 'stripe_webhook');
      expect(status).toBeNull();
    });

    it('returns processing when key is active', async () => {
      await db.insert(idempotencyKeys).values({
        key: 'evt_test_processing',
        scope: 'stripe_webhook',
        status: 'processing',
        expiresAt: new Date(Date.now() + 86400000),
      });
      const status = await getIdempotencyKeyStatus('evt_test_processing', 'stripe_webhook');
      expect(status).toBe('processing');
    });

    it('returns completed when key is completed', async () => {
      await db.insert(idempotencyKeys).values({
        key: 'evt_test_completed',
        scope: 'stripe_webhook',
        status: 'completed',
        expiresAt: new Date(Date.now() + 86400000),
      });
      const status = await getIdempotencyKeyStatus('evt_test_completed', 'stripe_webhook');
      expect(status).toBe('completed');
    });

    it('returns null when key is expired', async () => {
      await db.insert(idempotencyKeys).values({
        key: 'evt_test_expired',
        scope: 'stripe_webhook',
        status: 'completed',
        expiresAt: new Date(Date.now() - 1000), // already expired
      });
      const status = await getIdempotencyKeyStatus('evt_test_expired', 'stripe_webhook');
      expect(status).toBeNull();
    });
  });

  describe('countActiveSubscriptionsForPlan', () => {
    it('returns correct count', async () => {
      await seedSubscription(userId, planId, priceId, { stripeSubscriptionId: `sub_count_${Date.now()}` });
      const count = await countActiveSubscriptionsForPlan(planId);
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getSubscriptionEventsByUserId', () => {
    it('returns events ordered DESC and respects pagination', async () => {
      await db.insert(subscriptionEvents).values([
        { userId, type: 'created', description: 'First' },
        { userId, type: 'upgraded', description: 'Second' },
      ]);

      const events = await getSubscriptionEventsByUserId(userId, 1, 0);
      expect(events).toHaveLength(1);

      const allEvents = await getSubscriptionEventsByUserId(userId, 50, 0);
      expect(allEvents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getPaymentRecordsByUserId', () => {
    it('returns records with pagination', async () => {
      const sub = await seedSubscription(userId, planId, priceId, { stripeSubscriptionId: `sub_pay_${Date.now()}` });
      await db.insert(paymentRecords).values({
        userId,
        subscriptionId: sub!.id,
        stripeInvoiceId: `in_int_${Date.now()}`,
        amountCents: 999,
        currency: 'usd',
        status: 'succeeded',
        paidAt: new Date(),
      });

      const records = await getPaymentRecordsByUserId(userId, 50, 0);
      expect(records.length).toBeGreaterThanOrEqual(1);
      expect(records[0].amountCents).toBe(999);
    });
  });
});
