import { db } from '@/index';
import { subscriptions, paymentRecords, planPrices, plans, idempotencyKeys, subscriptionEvents } from '@/db/schema/tables';
import { and, eq } from 'drizzle-orm';
import type {
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  CreatePaymentRecordParams,
} from './subscriptions.types';
import type { PlanFeatures } from './subscriptions.gate';

export async function insertSubscription(params: CreateSubscriptionParams) {
  const [sub] = await db
    .insert(subscriptions)
    .values({
      userId: params.userId,
      ownerType: 'user',
      planId: params.planId,
      planPriceId: params.planPriceId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      stripeCustomerId: params.stripeCustomerId,
      status: params.status,
      totalSeats: null,
      currentPeriodStart: params.currentPeriodStart,
      currentPeriodEnd: params.currentPeriodEnd,
      trialEnd: params.trialEnd,
    })
    .onConflictDoNothing()
    .returning();
  return sub ?? null;
}

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

function buildSubscriptionUpdateSet(params: UpdateSubscriptionParams): Record<string, unknown> {
  const set: Record<string, unknown> = {};
  if (params.status !== undefined) set.status = params.status;
  if (params.currentPeriodStart !== undefined)
    set.currentPeriodStart = params.currentPeriodStart;
  if (params.currentPeriodEnd !== undefined)
    set.currentPeriodEnd = params.currentPeriodEnd;
  if (params.trialEnd !== undefined) set.trialEnd = params.trialEnd;
  if (params.cancelAtPeriodEnd !== undefined)
    set.cancelAtPeriodEnd = params.cancelAtPeriodEnd;
  if (params.canceledAt !== undefined) set.canceledAt = params.canceledAt;
  if (params.planId !== undefined) set.planId = params.planId;
  if (params.planPriceId !== undefined) set.planPriceId = params.planPriceId;
  return set;
}

export async function updateSubscriptionByStripeId(
  stripeSubId: string,
  params: UpdateSubscriptionParams
) {
  const set = buildSubscriptionUpdateSet(params);
  if (Object.keys(set).length === 0) return null;

  const [sub] = await db
    .update(subscriptions)
    .set(set)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
    .returning();
  return sub ?? null;
}

export async function updateSubscriptionByStripeIdTx(
  stripeSubId: string,
  params: UpdateSubscriptionParams,
  tx: TransactionClient
) {
  const set = buildSubscriptionUpdateSet(params);
  if (Object.keys(set).length === 0) return null;

  const [sub] = await tx
    .update(subscriptions)
    .set(set)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
    .returning();
  return sub ?? null;
}

export async function insertPaymentRecord(params: CreatePaymentRecordParams) {
  const [record] = await db
    .insert(paymentRecords)
    .values({
      userId: params.userId,
      subscriptionId: params.subscriptionId,
      stripePaymentIntentId: params.stripePaymentIntentId,
      stripeInvoiceId: params.stripeInvoiceId,
      amountCents: params.amountCents,
      currency: params.currency,
      status: params.status,
      description: params.description,
      paidAt: params.paidAt,
    })
    .onConflictDoNothing()
    .returning();
  return record ?? null;
}

export async function insertIdempotencyKey(key: string, scope: string): Promise<boolean> {
  try {
    await db.insert(idempotencyKeys).values({
      key,
      scope,
      status: 'processing',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    return true;
  } catch (error) {
    // Only treat unique constraint violations as "already claimed"
    // Postgres error code 23505 = unique_violation
    // Drizzle may wrap the pg error, so check both the error and its cause
    const pgCode =
      (error instanceof Error && 'code' in error && (error as { code: string }).code) ||
      (error instanceof Error && error.cause instanceof Error && 'code' in error.cause && (error.cause as { code: string }).code);
    if (pgCode === '23505') {
      return false;
    }
    // Re-throw unexpected DB errors so they're not silently swallowed
    throw error;
  }
}

export async function markIdempotencyKeyCompleted(key: string, scope: string): Promise<void> {
  await db
    .update(idempotencyKeys)
    .set({ status: 'completed' })
    .where(and(eq(idempotencyKeys.key, key), eq(idempotencyKeys.scope, scope)));
}

export async function deleteIdempotencyKey(key: string, scope: string): Promise<void> {
  await db
    .delete(idempotencyKeys)
    .where(and(eq(idempotencyKeys.key, key), eq(idempotencyKeys.scope, scope)));
}

// Subscription event logging

export type SubscriptionEventType =
  | 'created'
  | 'upgraded'
  | 'downgraded'
  | 'cancelled'
  | 'reactivated'
  | 'renewed'
  | 'payment_failed';

type SubscriptionEventParams = {
  userId: string;
  subscriptionId?: string | null;
  type: SubscriptionEventType;
  description: string;
  metadata?: Record<string, unknown>;
};

function buildSubscriptionEventValues(params: SubscriptionEventParams) {
  return {
    userId: params.userId,
    subscriptionId: params.subscriptionId ?? null,
    type: params.type,
    description: params.description,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
  };
}

export async function insertSubscriptionEvent(params: SubscriptionEventParams) {
  const [event] = await db
    .insert(subscriptionEvents)
    .values(buildSubscriptionEventValues(params))
    .returning();
  return event ?? null;
}

export async function insertSubscriptionEventTx(params: SubscriptionEventParams, tx: TransactionClient) {
  const [event] = await tx
    .insert(subscriptionEvents)
    .values(buildSubscriptionEventValues(params))
    .returning();
  return event ?? null;
}

export type CreatePlanParams = {
  id: string;
  name: string;
  description?: string;
  features: PlanFeatures;
  displayFeatures?: string[];
  sortOrder?: number;
  stripeProductId?: string;
};

export async function insertPlan(params: CreatePlanParams) {
  const [created] = await db
    .insert(plans)
    .values({
      id: params.id,
      name: params.name,
      description: params.description,
      features: params.features,
      displayFeatures: params.displayFeatures ?? [],
      sortOrder: params.sortOrder ?? 0,
      stripeProductId: params.stripeProductId,
    })
    .returning();
  return created ?? null;
}

export type UpdatePlanParams = {
  features?: PlanFeatures;
  displayFeatures?: string[];
  description?: string | null;
  name?: string;
  isActive?: boolean;
};

export async function updatePlan(planId: string, set: UpdatePlanParams) {
  const [updated] = await db
    .update(plans)
    .set(set)
    .where(eq(plans.id, planId))
    .returning();
  return updated ?? null;
}

export async function insertPlanPrice(params: {
  planId: string;
  stripePriceId: string;
  currency: string;
  interval: string;
}) {
  const [created] = await db.insert(planPrices).values(params).returning();
  return created ?? null;
}

export async function updatePlanPrice(
  priceId: string,
  planId: string,
  set: Record<string, unknown>
) {
  const [updated] = await db
    .update(planPrices)
    .set(set)
    .where(and(eq(planPrices.id, priceId), eq(planPrices.planId, planId)))
    .returning();
  return updated ?? null;
}

export async function deletePlanPrice(priceId: string, planId: string) {
  const [deleted] = await db
    .delete(planPrices)
    .where(and(eq(planPrices.id, priceId), eq(planPrices.planId, planId)))
    .returning();
  return deleted ?? null;
}
