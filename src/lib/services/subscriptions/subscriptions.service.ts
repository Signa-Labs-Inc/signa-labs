import { stripe } from '@/lib/stripe/client';
import { db } from '@/index';
import { getStripeCustomerId } from '@/lib/services/users/users.reader';
import { setStripeCustomerId } from '@/lib/services/users/users.writer';
import * as reader from './subscriptions.reader';
import * as writer from './subscriptions.writer';
import { env } from '@/env';
import {
  NotFoundError,
  ConflictError,
  InternalServerError,
  ValidationError,
} from '@/lib/utils/errors';
import type { UserPlan, PlanForPricingPage } from './subscriptions.types';
import { toSubscriptionStatus, toPaymentStatus } from './subscriptions.types';
import type { PlanFeatures } from './subscriptions.gate';
import type Stripe from 'stripe';
import { unstable_cache } from 'next/cache';

// Helper: extract subscription ID from invoice parent (clover API)
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subDetails = invoice.parent?.subscription_details;
  if (!subDetails) return null;
  return typeof subDetails.subscription === 'string'
    ? subDetails.subscription
    : (subDetails.subscription?.id ?? null);
}

// Helper: extract period from subscription item (clover API moved period to items)
function getSubscriptionPeriod(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return {
    currentPeriodStart: item ? new Date(item.current_period_start * 1000) : undefined,
    currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : undefined,
  };
}

export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  const existing = await getStripeCustomerId(userId);
  if (existing) {
    return existing;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  // Only sets if stripeCustomerId is still null (race-condition guard)
  await setStripeCustomerId(userId, customer.id);

  // Re-read in case another request won the race
  const final = await getStripeCustomerId(userId);
  return final ?? customer.id;
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  planId: string,
  interval: 'month' | 'year'
): Promise<string> {
  const existing = await reader.getActiveSubscriptionByUserId(userId);
  if (existing) {
    throw new ConflictError('User already has an active subscription');
  }

  const plans = await reader.getActivePlansWithPrices();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) {
    throw new NotFoundError('Plan', planId);
  }

  const price = plan.prices.find(
    (p) => p.interval === interval && !p.stripePriceId.startsWith('PLACEHOLDER')
  );
  if (!price) {
    throw new ValidationError(`No ${interval} price found for plan ${planId}`);
  }

  // Validate the Stripe price is still active before sending user to checkout
  let stripePrice;
  try {
    stripePrice = await stripe.prices.retrieve(price.stripePriceId);
  } catch {
    throw new ValidationError(
      'This price is no longer available. Please try a different plan or contact support.'
    );
  }

  if (!stripePrice.active) {
    throw new ValidationError(
      'This price is no longer available. Please try a different plan or contact support.'
    );
  }

  const customerId = await getOrCreateStripeCustomer(userId, email);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId,
    mode: 'subscription',
    line_items: [{ price: price.stripePriceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId, planId },
    subscription_data: {
      metadata: { userId, planId },
    },
    // Prevent duplicate active subscriptions at the Stripe level
    allow_promotion_codes: false,
  });

  if (!session.url) {
    throw new InternalServerError('Failed to create checkout session');
  }

  return session.url;
}

export async function createBillingPortalSession(userId: string, email: string): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId, email);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return session.url;
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const sub = await reader.getActiveSubscriptionByUserId(userId);
  if (!sub) return null;

  const plan = await reader.getPlanById(sub.planId);
  if (!plan) return null;

  return {
    planId: plan.id,
    planName: plan.name,
    status: toSubscriptionStatus(sub.status),
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
  };
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await reader.getActiveSubscriptionByUserId(userId);
  return sub !== null;
}

export { getAllUsageLimits } from './subscriptions.gate';

export type SubscriptionEvent = {
  id: string;
  type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export async function getUserSubscriptionHistory(userId: string): Promise<SubscriptionEvent[]> {
  const events = await reader.getSubscriptionEventsByUserId(userId);
  return events.map((e) => ({
    id: e.id,
    type: e.type,
    description: e.description,
    metadata: e.metadata ? JSON.parse(e.metadata) : null,
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function getUserPaymentHistory(userId: string) {
  const records = await reader.getPaymentRecordsByUserId(userId);
  return records.map((r) => ({
    id: r.id,
    userId: r.userId,
    subscriptionId: r.subscriptionId,
    stripeInvoiceId: r.stripeInvoiceId,
    amountCents: r.amountCents,
    currency: r.currency,
    status: toPaymentStatus(r.status),
    description: r.description,
    paidAt: r.paidAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

// Cached Stripe price retrieval
const getCachedStripePrice = unstable_cache(
  async (stripePriceId: string) => {
    const price = await stripe.prices.retrieve(stripePriceId);
    return { unitAmount: price.unit_amount ?? 0, currency: price.currency };
  },
  ['stripe-price'],
  { revalidate: 3600, tags: ['stripe-prices'] }
);

export async function getPlansForPricingPage(): Promise<PlanForPricingPage[]> {
  const plans = await reader.getActivePlansWithPrices();

  const enrichedPlans = await Promise.all(
    plans.map(async (plan) => {
      const enrichedPrices = await Promise.all(
        plan.prices
          .filter((p) => p.stripePriceId && !p.stripePriceId.startsWith('PLACEHOLDER'))
          .map(async (p) => {
            try {
              const stripeData = await getCachedStripePrice(p.stripePriceId);
              return {
                id: p.id,
                stripePriceId: p.stripePriceId,
                currency: stripeData.currency,
                interval: p.interval,
                unitAmount: stripeData.unitAmount,
              };
            } catch (error) {
              console.error(`Failed to fetch Stripe price ${p.stripePriceId}:`, error);
              return null;
            }
          })
      );

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        displayFeatures: plan.displayFeatures,
        sortOrder: plan.sortOrder,
        prices: enrichedPrices.filter((p): p is NonNullable<typeof p> => p !== null),
      };
    })
  );

  return enrichedPlans;
}

// Feature validation

const VALID_WINDOWS = ['day', 'week', 'month'];
const FEATURE_KEYS = ['exercises', 'paths', 'aiGenerations', 'submissions'];

export function validatePlanFeatures(features: unknown): PlanFeatures {
  if (typeof features !== 'object' || features === null || Array.isArray(features)) {
    throw new ValidationError('features must be an object');
  }

  const f = features as Record<string, unknown>;

  for (const key of FEATURE_KEYS) {
    if (!(key in f)) {
      throw new ValidationError(`features.${key} is required`);
    }

    const feat = f[key];
    if (typeof feat !== 'object' || feat === null) {
      throw new ValidationError(`features.${key} must be an object with limit and window`);
    }

    const { limit, window } = feat as Record<string, unknown>;

    if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < -1) {
      throw new ValidationError(
        `features.${key}.limit must be an integer >= -1 (use -1 for unlimited)`
      );
    }

    if (typeof window !== 'string' || !VALID_WINDOWS.includes(window)) {
      throw new ValidationError(
        `features.${key}.window must be one of: ${VALID_WINDOWS.join(', ')}`
      );
    }
  }

  return features as PlanFeatures;
}

// Plan creation with Stripe integration

const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'inr', 'brl'];

export interface CreatePlanWithStripeParams {
  id: string;
  name: string;
  description?: string;
  features: PlanFeatures;
  displayFeatures?: string[];
  sortOrder?: number;
  pricing?: {
    currency: string;
    monthlyPriceCents?: number;
    yearlyPriceCents?: number;
  };
}

export async function createPlanWithStripeProducts(params: CreatePlanWithStripeParams) {
  // Check for existing plan first
  const existing = await reader.getPlanById(params.id);
  if (existing) {
    throw new ConflictError(`A plan with ID "${params.id}" already exists`);
  }

  // Validate pricing if provided
  if (params.pricing) {
    const { currency, monthlyPriceCents, yearlyPriceCents } = params.pricing;

    if (!currency || !SUPPORTED_CURRENCIES.includes(currency)) {
      throw new ValidationError(`Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`);
    }

    if (monthlyPriceCents === undefined && yearlyPriceCents === undefined) {
      throw new ValidationError(
        'At least one price (monthly or yearly) is required when pricing is provided'
      );
    }

    if (monthlyPriceCents !== undefined) {
      if (!Number.isInteger(monthlyPriceCents) || monthlyPriceCents <= 0) {
        throw new ValidationError('Monthly price must be a positive whole number of cents');
      }
    }

    if (yearlyPriceCents !== undefined) {
      if (!Number.isInteger(yearlyPriceCents) || yearlyPriceCents <= 0) {
        throw new ValidationError('Yearly price must be a positive whole number of cents');
      }
    }
  }

  let stripeProductId: string | undefined;
  const createdStripePrices: { stripePriceId: string; interval: string; currency: string }[] = [];

  // Create Stripe Product + Prices if pricing is provided
  if (params.pricing) {
    const { currency, monthlyPriceCents, yearlyPriceCents } = params.pricing;

    try {
      const product = await stripe.products.create({
        name: params.name,
        description: params.description ?? undefined,
        metadata: { planId: params.id },
      });
      stripeProductId = product.id;

      if (monthlyPriceCents !== undefined) {
        const monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: monthlyPriceCents,
          currency,
          recurring: { interval: 'month' },
          metadata: { planId: params.id },
        });
        createdStripePrices.push({
          stripePriceId: monthlyPrice.id,
          interval: 'month',
          currency,
        });
      }

      if (yearlyPriceCents !== undefined) {
        const yearlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: yearlyPriceCents,
          currency,
          recurring: { interval: 'year' },
          metadata: { planId: params.id },
        });
        createdStripePrices.push({
          stripePriceId: yearlyPrice.id,
          interval: 'year',
          currency,
        });
      }
    } catch (error) {
      // If product was created but price creation failed, archive the product
      if (stripeProductId) {
        try {
          await stripe.products.update(stripeProductId, { active: false });
        } catch (rollbackError) {
          console.error(
            `Failed to archive orphaned Stripe product ${stripeProductId}:`,
            rollbackError
          );
        }
      }
      throw new InternalServerError(
        `Failed to create Stripe product/prices: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Insert plan into DB
  let plan;
  try {
    plan = await writer.insertPlan({
      id: params.id,
      name: params.name,
      description: params.description,
      features: params.features,
      displayFeatures: params.displayFeatures,
      sortOrder: params.sortOrder,
      stripeProductId,
    });

    if (!plan) {
      throw new Error('insertPlan returned null');
    }
  } catch (error) {
    // Rollback: archive Stripe product if DB insert failed
    if (stripeProductId) {
      try {
        await stripe.products.update(stripeProductId, { active: false });
      } catch (rollbackError) {
        console.error(
          `Failed to archive Stripe product ${stripeProductId} after DB failure:`,
          rollbackError
        );
      }
    }

    if (error instanceof ConflictError) throw error;
    throw new InternalServerError('Failed to create plan in database');
  }

  // Insert plan prices into DB (best-effort — plan exists, prices can be re-linked via admin UI)
  for (const sp of createdStripePrices) {
    try {
      await writer.insertPlanPrice({
        planId: params.id,
        stripePriceId: sp.stripePriceId,
        currency: sp.currency,
        interval: sp.interval,
      });
    } catch (error) {
      console.error(
        `Failed to insert plan_price for ${sp.stripePriceId} (plan ${params.id}):`,
        error
      );
    }
  }

  return plan;
}

// Webhook handlers

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  const stripeSubId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;

  if (!userId || !planId || !stripeSubId || !stripeCustomerId) {
    throw new Error(
      `Stripe webhook: checkout.session.completed missing metadata — userId=${userId}, planId=${planId}, stripeSubId=${stripeSubId}`
    );
  }

  // Check if subscription already exists (idempotency)
  const existing = await reader.getSubscriptionByStripeId(stripeSubId);
  if (existing) return;

  // Retrieve the subscription to get price and period info
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
  const stripePriceId = stripeSub.items.data[0]?.price.id;
  if (!stripePriceId) {
    throw new Error(`Stripe webhook: no price found on subscription ${stripeSubId}`);
  }

  const planPrice = await reader.getPlanPriceByStripePriceId(stripePriceId);
  if (!planPrice) {
    throw new Error(
      `Stripe webhook: unknown Stripe price ${stripePriceId} — ensure it's mapped in plan_prices`
    );
  }

  const period = getSubscriptionPeriod(stripeSub);

  const newSub = await writer.insertSubscription({
    userId,
    planId: planPrice.planId,
    planPriceId: planPrice.id,
    stripeSubscriptionId: stripeSubId,
    stripeCustomerId,
    status: toSubscriptionStatus(stripeSub.status),
    currentPeriodStart: period.currentPeriodStart,
    currentPeriodEnd: period.currentPeriodEnd,
    trialEnd: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : undefined,
  });

  // Log subscription creation event
  await writer.insertSubscriptionEvent({
    userId,
    subscriptionId: newSub?.id,
    type: 'created',
    description: `Subscribed to ${planPrice.planId} plan`,
    metadata: { planId: planPrice.planId, stripeSubscriptionId: stripeSubId },
  });
}

export async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const stripePriceId = sub.items.data[0]?.price.id;
  let planPrice = null;
  if (stripePriceId) {
    planPrice = await reader.getPlanPriceByStripePriceId(stripePriceId);
  }

  const period = getSubscriptionPeriod(sub);

  await db.transaction(async (tx) => {
    // Lock the subscription row to prevent concurrent updates from racing
    const existingSub = await reader.getSubscriptionByStripeIdForUpdate(sub.id, tx);

    await writer.updateSubscriptionByStripeIdTx(
      sub.id,
      {
        status: toSubscriptionStatus(sub.status),
        currentPeriodStart: period.currentPeriodStart,
        currentPeriodEnd: period.currentPeriodEnd,
        trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
        ...(planPrice ? { planId: planPrice.planId, planPriceId: planPrice.id } : {}),
      },
      tx
    );

    // Log change events
    if (existingSub) {
      const userId = existingSub.userId;

      // Detect plan change (upgrade/downgrade)
      if (planPrice && existingSub.planId !== planPrice.planId) {
        const oldPlan = await reader.getPlanById(existingSub.planId);
        const newPlan = await reader.getPlanById(planPrice.planId);
        const oldOrder = oldPlan?.sortOrder ?? 0;
        const newOrder = newPlan?.sortOrder ?? 0;
        const eventType = newOrder > oldOrder ? 'upgraded' : 'downgraded';

        await writer.insertSubscriptionEventTx(
          {
            userId,
            subscriptionId: existingSub.id,
            type: eventType,
            description: `${eventType === 'upgraded' ? 'Upgraded' : 'Downgraded'} from ${oldPlan?.name ?? existingSub.planId} to ${newPlan?.name ?? planPrice.planId}`,
            metadata: { oldPlanId: existingSub.planId, newPlanId: planPrice.planId },
          },
          tx
        );
      }

      // Detect cancellation scheduling
      if (sub.cancel_at_period_end && !existingSub.cancelAtPeriodEnd) {
        await writer.insertSubscriptionEventTx(
          {
            userId,
            subscriptionId: existingSub.id,
            type: 'cancelled',
            description: 'Subscription scheduled for cancellation at period end',
          },
          tx
        );
      }

      // Detect reactivation (un-cancel)
      if (!sub.cancel_at_period_end && existingSub.cancelAtPeriodEnd) {
        await writer.insertSubscriptionEventTx(
          {
            userId,
            subscriptionId: existingSub.id,
            type: 'reactivated',
            description: 'Subscription cancellation reversed',
          },
          tx
        );
      }
    }
  });
}

export async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const existingSub = await reader.getSubscriptionByStripeId(sub.id);

  await writer.updateSubscriptionByStripeId(sub.id, {
    status: 'canceled',
    canceledAt: new Date(),
  });

  if (existingSub) {
    await writer.insertSubscriptionEvent({
      userId: existingSub.userId,
      subscriptionId: existingSub.id,
      type: 'cancelled',
      description: 'Subscription cancelled',
      metadata: { planId: existingSub.planId },
    });
  }
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const stripeSubId = getInvoiceSubscriptionId(invoice);

  const sub = stripeSubId ? await reader.getSubscriptionByStripeId(stripeSubId) : null;

  const userId = sub?.userId ?? invoice.parent?.subscription_details?.metadata?.userId;
  if (!userId) {
    throw new Error(
      `Stripe webhook: invoice.paid — cannot resolve userId for invoice ${invoice.id}`
    );
  }

  await writer.insertPaymentRecord({
    userId,
    subscriptionId: sub?.id,
    stripeInvoiceId: invoice.id,
    amountCents: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    description: `Invoice ${invoice.number ?? invoice.id}`,
    paidAt: new Date(),
  });
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeSubId = getInvoiceSubscriptionId(invoice);

  const sub = stripeSubId ? await reader.getSubscriptionByStripeId(stripeSubId) : null;

  const userId = sub?.userId ?? invoice.parent?.subscription_details?.metadata?.userId;
  if (!userId) {
    throw new Error(
      `Stripe webhook: invoice.payment_failed — cannot resolve userId for invoice ${invoice.id}`
    );
  }

  await writer.insertPaymentRecord({
    userId,
    subscriptionId: sub?.id,
    stripeInvoiceId: invoice.id,
    amountCents: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    description: `Failed invoice ${invoice.number ?? invoice.id}`,
  });

  // Update subscription status to past_due if we have one
  if (sub && stripeSubId) {
    await writer.updateSubscriptionByStripeId(stripeSubId, {
      status: 'past_due',
    });

    await writer.insertSubscriptionEvent({
      userId,
      subscriptionId: sub.id,
      type: 'payment_failed',
      description: `Payment failed for invoice ${invoice.number ?? invoice.id}`,
      metadata: { invoiceId: invoice.id, amountDue: invoice.amount_due },
    });
  }
}
