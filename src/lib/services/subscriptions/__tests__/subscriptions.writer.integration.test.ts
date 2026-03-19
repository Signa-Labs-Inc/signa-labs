import { db } from '@/index';
import {
  users,
  plans,
  planPrices,
  subscriptions,
  idempotencyKeys,
  subscriptionEvents,
} from '@/db/schema/tables';
import {
  insertSubscription,
  updateSubscriptionByStripeId,
  insertIdempotencyKey,
  markIdempotencyKeyCompleted,
  deleteIdempotencyKey,
  insertPlan,
  insertPlanPrice,
  insertSubscriptionEvent,
} from '../subscriptions.writer';

// Seed helpers — use `db` (mocked to test DB) so seeding and production code
// share the exact same connection, avoiding cross-connection visibility issues
async function seedUser(id = crypto.randomUUID()) {
  const [u] = await db
    .insert(users)
    .values({
      id,
      clerkId: `clerk_${id}`,
      email: `${id}@test.com`,
      name: 'Test User',
      role: 'learner',
    })
    .onConflictDoNothing()
    .returning();
  return u;
}

async function seedPlan(id = `pro_writer_${Date.now()}`) {
  const [p] = await db
    .insert(plans)
    .values({
      id,
      name: 'Pro Writer',
      features: {
        exercises: { limit: 10, window: 'day' },
        paths: { limit: 3, window: 'week' },
        aiGenerations: { limit: 10, window: 'day' },
        submissions: { limit: 50, window: 'day' },
      },
      displayFeatures: [],
      sortOrder: 1,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();
  return p;
}

async function seedPlanPrice(planId: string) {
  const [pp] = await db
    .insert(planPrices)
    .values({
      planId,
      stripePriceId: `price_writer_${Date.now()}`,
      currency: 'usd',
      interval: 'month',
      isActive: true,
    })
    .returning();
  return pp;
}

describe('subscriptions.writer integration', () => {
  let userId: string;
  let planId: string;
  let priceId: string;

  beforeEach(async () => {
    const user = await seedUser();
    userId = user!.id;
    const plan = await seedPlan();
    planId = plan!.id;
    const price = await seedPlanPrice(planId);
    priceId = price!.id;
  });

  describe('insertSubscription', () => {
    it('creates and returns subscription', async () => {
      const sub = await insertSubscription({
        userId,
        planId,
        planPriceId: priceId,
        stripeSubscriptionId: `sub_writer_${Date.now()}`,
        stripeCustomerId: 'cus_writer_123',
        status: 'active',
      });

      expect(sub).not.toBeNull();
      expect(sub!.userId).toBe(userId);
      expect(sub!.status).toBe('active');
    });

    it('returns null on conflict (idempotent)', async () => {
      const stripeSubId = `sub_dup_${Date.now()}`;
      await insertSubscription({
        userId,
        planId,
        planPriceId: priceId,
        stripeSubscriptionId: stripeSubId,
        stripeCustomerId: 'cus_writer_123',
        status: 'active',
      });

      // Second insert with same stripeSubscriptionId should return null
      const dup = await insertSubscription({
        userId,
        planId,
        planPriceId: priceId,
        stripeSubscriptionId: stripeSubId,
        stripeCustomerId: 'cus_writer_123',
        status: 'active',
      });

      expect(dup).toBeNull();
    });
  });

  describe('updateSubscriptionByStripeId', () => {
    it('updates specified fields only', async () => {
      const stripeSubId = `sub_update_${Date.now()}`;
      await insertSubscription({
        userId,
        planId,
        planPriceId: priceId,
        stripeSubscriptionId: stripeSubId,
        stripeCustomerId: 'cus_writer_123',
        status: 'active',
      });

      const updated = await updateSubscriptionByStripeId(stripeSubId, {
        status: 'past_due',
        cancelAtPeriodEnd: true,
      });

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('past_due');
      expect(updated!.cancelAtPeriodEnd).toBe(true);
    });
  });

  describe('idempotency keys', () => {
    it('insertIdempotencyKey returns true for new key', async () => {
      const result = await insertIdempotencyKey(`key_${Date.now()}`, 'test_scope');
      expect(result).toBe(true);
    });

    it('insertIdempotencyKey returns false for duplicate', async () => {
      const key = `key_dup_${Date.now()}`;
      await insertIdempotencyKey(key, 'test_scope');
      const result = await insertIdempotencyKey(key, 'test_scope');
      expect(result).toBe(false);
    });

    it('markIdempotencyKeyCompleted updates status', async () => {
      const key = `key_complete_${Date.now()}`;
      await insertIdempotencyKey(key, 'test_scope');
      await markIdempotencyKeyCompleted(key, 'test_scope');
      // Just verify it doesn't throw
    });

    it('deleteIdempotencyKey removes the key', async () => {
      const key = `key_delete_${Date.now()}`;
      await insertIdempotencyKey(key, 'test_scope');
      await deleteIdempotencyKey(key, 'test_scope');
      // Verify we can re-insert (meaning delete worked)
      const result = await insertIdempotencyKey(key, 'test_scope');
      expect(result).toBe(true);
    });
  });

  describe('insertPlan', () => {
    it('creates plan', async () => {
      const plan = await insertPlan({
        id: `plan_new_${Date.now()}`,
        name: 'New Plan',
        features: {
          exercises: { limit: 5, window: 'day' },
          paths: { limit: 2, window: 'week' },
          aiGenerations: { limit: 5, window: 'day' },
          submissions: { limit: 20, window: 'day' },
        },
      });
      expect(plan).not.toBeNull();
      expect(plan!.name).toBe('New Plan');
    });
  });

  describe('insertPlanPrice', () => {
    it('creates price', async () => {
      const price = await insertPlanPrice({
        planId,
        stripePriceId: `price_new_${Date.now()}`,
        currency: 'usd',
        interval: 'year',
      });
      expect(price).not.toBeNull();
      expect(price!.interval).toBe('year');
    });
  });

  describe('insertSubscriptionEvent', () => {
    it('creates event', async () => {
      const event = await insertSubscriptionEvent({
        userId,
        type: 'created',
        description: 'Test event',
        metadata: { planId },
      });
      expect(event).not.toBeNull();
      expect(event!.type).toBe('created');
    });
  });
});
