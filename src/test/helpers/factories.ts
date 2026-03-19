import { v4 as uuid } from 'uuid';

export function buildUser(overrides?: Partial<{
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: string;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}>) {
  return {
    id: uuid(),
    clerkId: `clerk_${uuid().slice(0, 8)}`,
    email: 'test@example.com',
    name: 'Test User',
    role: 'learner',
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildPlan(overrides?: Partial<{
  id: string;
  name: string;
  description: string | null;
  features: Record<string, unknown>;
  displayFeatures: string[];
  stripeProductId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}>) {
  return {
    id: 'pro',
    name: 'Pro',
    description: 'Unlimited practice',
    features: {
      exercises: { limit: 10, window: 'day' },
      paths: { limit: 3, window: 'week' },
      aiGenerations: { limit: 10, window: 'day' },
      submissions: { limit: 50, window: 'day' },
    },
    displayFeatures: ['10 exercises/day', '3 paths/week'],
    stripeProductId: 'prod_test_123',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildPlanPrice(overrides?: Partial<{
  id: string;
  planId: string;
  stripePriceId: string;
  currency: string;
  interval: string;
  isActive: boolean;
  createdAt: Date;
}>) {
  return {
    id: uuid(),
    planId: 'pro',
    stripePriceId: `price_test_${uuid().slice(0, 8)}`,
    currency: 'usd',
    interval: 'month',
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  };
}

export function buildSubscription(overrides?: Partial<{
  id: string;
  userId: string;
  orgId: string | null;
  ownerType: string;
  planId: string;
  planPriceId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string;
  status: string;
  totalSeats: number | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>) {
  return {
    id: uuid(),
    userId: uuid(),
    orgId: null,
    ownerType: 'user',
    planId: 'pro',
    planPriceId: uuid(),
    stripeSubscriptionId: `sub_test_${uuid().slice(0, 8)}`,
    stripeCustomerId: `cus_test_${uuid().slice(0, 8)}`,
    status: 'active',
    totalSeats: null,
    currentPeriodStart: new Date('2026-03-01'),
    currentPeriodEnd: new Date('2026-04-01'),
    trialEnd: null,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildPaymentRecord(overrides?: Partial<{
  id: string;
  userId: string;
  subscriptionId: string | null;
  stripePaymentIntentId: string | null;
  stripeInvoiceId: string | null;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
}>) {
  return {
    id: uuid(),
    userId: uuid(),
    subscriptionId: null,
    stripePaymentIntentId: `pi_test_${uuid().slice(0, 8)}`,
    stripeInvoiceId: `in_test_${uuid().slice(0, 8)}`,
    amountCents: 999,
    currency: 'usd',
    status: 'succeeded',
    description: 'Invoice IN-0001',
    paidAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
}

export function buildSubscriptionEvent(overrides?: Partial<{
  id: string;
  userId: string;
  subscriptionId: string | null;
  type: string;
  description: string;
  metadata: string | null;
  createdAt: Date;
}>) {
  return {
    id: uuid(),
    userId: uuid(),
    subscriptionId: null,
    type: 'created',
    description: 'Subscribed to pro plan',
    metadata: null,
    createdAt: new Date(),
    ...overrides,
  };
}

export function buildNotification(overrides?: Partial<{
  id: string;
  userId: string;
  type: string;
  channel: string;
  subject: string | null;
  body: string | null;
  metadata: Record<string, unknown>;
  status: string;
  sentAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
}>) {
  return {
    id: uuid(),
    userId: uuid(),
    type: 'usage_alert',
    channel: 'in_app',
    subject: 'Usage alert',
    body: 'You are approaching your limit',
    metadata: {},
    status: 'sent',
    sentAt: new Date(),
    readAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

export function buildPlanWithPrices(overrides?: Partial<{
  id: string;
  name: string;
  description: string | null;
  features: Record<string, unknown>;
  displayFeatures: string[];
  sortOrder: number;
  isActive: boolean;
  prices: Array<{
    id: string;
    stripePriceId: string;
    currency: string;
    interval: string;
  }>;
}>) {
  const priceId = uuid();
  return {
    id: 'pro',
    name: 'Pro',
    description: 'Unlimited practice',
    features: {
      exercises: { limit: 10, window: 'day' },
      paths: { limit: 3, window: 'week' },
      aiGenerations: { limit: 10, window: 'day' },
      submissions: { limit: 50, window: 'day' },
    },
    displayFeatures: ['10 exercises/day'],
    sortOrder: 1,
    prices: [
      {
        id: priceId,
        stripePriceId: 'price_test_monthly',
        currency: 'usd',
        interval: 'month',
      },
    ],
    ...overrides,
  };
}
