import { db } from '@/index';
import { subscriptions, plans, planPrices, paymentRecords, exercises, exerciseSubmissions, learningPaths, idempotencyKeys, subscriptionEvents } from '@/db/schema/tables';
import { eq, and, inArray, sql, gte, isNull } from 'drizzle-orm';
import type { UserSubscription, PlanWithPrices } from './subscriptions.types';

export async function getActiveSubscriptionByUserId(
  userId: string
): Promise<UserSubscription | null> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.ownerType, 'user'),
        inArray(subscriptions.status, ['active', 'trialing', 'past_due'])
      )
    );
  return (sub as UserSubscription) ?? null;
}

export async function getSubscriptionByStripeId(
  stripeSubId: string
): Promise<UserSubscription | null> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubId));
  return (sub as UserSubscription) ?? null;
}

/** Locks the subscription row for the duration of the calling transaction. */
export async function getSubscriptionByStripeIdForUpdate(
  stripeSubId: string,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
): Promise<UserSubscription | null> {
  const result = await tx.execute(
    sql`SELECT * FROM subscriptions WHERE stripe_subscription_id = ${stripeSubId} FOR UPDATE`
  );
  const sub = result.rows[0];
  return (sub as UserSubscription) ?? null;
}

export async function getActivePlansWithPrices(): Promise<PlanWithPrices[]> {
  const activePlans = await db
    .select()
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(plans.sortOrder);

  const activePrices = await db
    .select()
    .from(planPrices)
    .where(eq(planPrices.isActive, true));

  return activePlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    features: plan.features as Record<string, unknown>,
    displayFeatures: plan.displayFeatures as string[],
    sortOrder: plan.sortOrder,
    prices: activePrices
      .filter((p) => p.planId === plan.id)
      .map((p) => ({
        id: p.id,
        stripePriceId: p.stripePriceId,
        currency: p.currency,
        interval: p.interval,
      })),
  }));
}

export async function getAllPlansWithPrices(): Promise<PlanWithPrices[]> {
  const allPlans = await db
    .select()
    .from(plans)
    .orderBy(plans.sortOrder);

  const allPrices = await db.select().from(planPrices);

  return allPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    features: plan.features as Record<string, unknown>,
    displayFeatures: plan.displayFeatures as string[],
    sortOrder: plan.sortOrder,
    isActive: plan.isActive,
    prices: allPrices
      .filter((p) => p.planId === plan.id)
      .map((p) => ({
        id: p.id,
        stripePriceId: p.stripePriceId,
        currency: p.currency,
        interval: p.interval,
      })),
  }));
}

export async function getPlanPriceByStripePriceId(stripePriceId: string) {
  const [price] = await db
    .select({
      id: planPrices.id,
      planId: planPrices.planId,
      stripePriceId: planPrices.stripePriceId,
      interval: planPrices.interval,
    })
    .from(planPrices)
    .where(eq(planPrices.stripePriceId, stripePriceId));
  return price ?? null;
}

export async function getPlanById(planId: string) {
  const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
  return plan ?? null;
}

export async function getPricesByPlanId(planId: string) {
  return db.select().from(planPrices).where(eq(planPrices.planId, planId));
}

export async function getPriceById(priceId: string, planId: string) {
  const [price] = await db
    .select()
    .from(planPrices)
    .where(and(eq(planPrices.id, priceId), eq(planPrices.planId, planId)));
  return price ?? null;
}

// Idempotency key check for webhook deduplication

export async function getIdempotencyKeyStatus(
  key: string,
  scope: string
): Promise<'processing' | 'completed' | null> {
  const [row] = await db
    .select({ status: idempotencyKeys.status })
    .from(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.key, key),
        eq(idempotencyKeys.scope, scope),
        gte(idempotencyKeys.expiresAt, new Date())
      )
    );
  if (!row) return null;
  return row.status as 'processing' | 'completed';
}

// Active subscription count for plan deactivation guard

export async function countActiveSubscriptionsForPlan(planId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.planId, planId),
        inArray(subscriptions.status, ['active', 'trialing', 'past_due'])
      )
    );
  return result?.count ?? 0;
}

// Active subscription count for price deletion guard

export async function countActiveSubscriptionsForPrice(priceId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.planPriceId, priceId),
        inArray(subscriptions.status, ['active', 'trialing', 'past_due'])
      )
    );
  return result?.count ?? 0;
}

// Usage counting queries for feature gating

export async function countUserExercisesSince(
  userId: string,
  since: Date
): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(exercises)
    .where(
      and(
        eq(exercises.createdBy, userId),
        gte(exercises.createdAt, since),
        isNull(exercises.deletedAt)
      )
    );
  return result?.count ?? 0;
}

export async function countUserPathsSince(
  userId: string,
  since: Date
): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(learningPaths)
    .where(
      and(eq(learningPaths.userId, userId), gte(learningPaths.createdAt, since))
    );
  return result?.count ?? 0;
}

export async function countUserAiGenerationsSince(
  userId: string,
  since: Date
): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(exercises)
    .where(
      and(
        eq(exercises.createdBy, userId),
        eq(exercises.origin, 'user'),
        gte(exercises.createdAt, since),
        isNull(exercises.deletedAt)
      )
    );
  return result?.count ?? 0;
}

export async function countUserSubmissionsSince(
  userId: string,
  since: Date
): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(exerciseSubmissions)
    .where(
      and(
        eq(exerciseSubmissions.userId, userId),
        gte(exerciseSubmissions.submittedAt, since)
      )
    );
  return result?.count ?? 0;
}

// Subscription event history

export async function getSubscriptionEventsByUserId(userId: string, limit = 50, offset = 0) {
  return db
    .select()
    .from(subscriptionEvents)
    .where(eq(subscriptionEvents.userId, userId))
    .orderBy(sql`${subscriptionEvents.createdAt} DESC`)
    .limit(limit)
    .offset(offset);
}

// Payment history

export async function getPaymentRecordsByUserId(userId: string, limit = 50, offset = 0) {
  return db
    .select()
    .from(paymentRecords)
    .where(eq(paymentRecords.userId, userId))
    .orderBy(sql`${paymentRecords.createdAt} DESC`)
    .limit(limit)
    .offset(offset);
}
