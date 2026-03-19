export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'
  | 'incomplete'
  | 'incomplete_expired';

const VALID_SUBSCRIPTION_STATUSES = new Set<string>([
  'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused', 'incomplete', 'incomplete_expired',
]);

export function toSubscriptionStatus(value: string): SubscriptionStatus {
  if (!VALID_SUBSCRIPTION_STATUSES.has(value)) {
    throw new Error(`Invalid subscription status: ${value}`);
  }
  return value as SubscriptionStatus;
}

export type PaymentStatus = 'succeeded' | 'failed' | 'refunded' | 'partial_refund';

const VALID_PAYMENT_STATUSES = new Set<string>([
  'succeeded', 'failed', 'refunded', 'partial_refund',
]);

export function toPaymentStatus(value: string): PaymentStatus {
  if (!VALID_PAYMENT_STATUSES.has(value)) {
    throw new Error(`Invalid payment status: ${value}`);
  }
  return value as PaymentStatus;
}

export type UserSubscription = {
  id: string;
  userId: string;
  planId: string;
  planPriceId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string;
  status: SubscriptionStatus;
  totalSeats: number | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSubscriptionParams = {
  userId: string;
  planId: string;
  planPriceId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEnd?: Date;
};

export type UpdateSubscriptionParams = {
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
  planId?: string;
  planPriceId?: string;
};

export type PlanWithPrices = {
  id: string;
  name: string;
  description: string | null;
  features: Record<string, unknown>;
  displayFeatures: string[];
  sortOrder: number;
  isActive?: boolean;
  prices: {
    id: string;
    stripePriceId: string;
    currency: string;
    interval: string;
  }[];
};

export type PriceWithAmount = {
  id: string;
  stripePriceId: string;
  currency: string;
  interval: string;
  unitAmount: number;
};

export type PlanForPricingPage = {
  id: string;
  name: string;
  description: string | null;
  displayFeatures: string[];
  sortOrder: number;
  prices: PriceWithAmount[];
};

export type CreatePaymentRecordParams = {
  userId: string;
  subscriptionId?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  amountCents: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'refunded' | 'partial_refund';
  description?: string;
  paidAt?: Date;
};

export type UserPlan = {
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
} | null;

export type UsageSummary = {
  feature: string;
  label: string;
  current: number;
  limit: number; // -1 = unlimited
  window: 'day' | 'week' | 'month';
  resetsAt: string; // ISO string for serialization
};

export type PaymentRecord = {
  id: string;
  userId: string;
  subscriptionId: string | null;
  stripeInvoiceId: string | null;
  amountCents: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'refunded' | 'partial_refund';
  description: string | null;
  paidAt: string | null; // ISO string
  createdAt: string; // ISO string
};
