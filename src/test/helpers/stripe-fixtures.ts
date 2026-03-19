import type Stripe from 'stripe';

export function buildStripeSubscription(overrides?: Record<string, unknown>): Stripe.Subscription {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: 'sub_test_123',
    object: 'subscription',
    status: 'active',
    customer: 'cus_test_123',
    cancel_at_period_end: false,
    canceled_at: null,
    trial_end: null,
    items: {
      object: 'list',
      data: [
        {
          id: 'si_test_123',
          object: 'subscription_item',
          price: {
            id: 'price_test_monthly',
            object: 'price',
            active: true,
            currency: 'usd',
            unit_amount: 999,
            recurring: { interval: 'month', interval_count: 1 },
          } as unknown as Stripe.Price,
          current_period_start: now,
          current_period_end: now + 30 * 24 * 60 * 60,
        } as unknown as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: '',
    },
    metadata: { userId: 'user_test_123', planId: 'pro' },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

export function buildStripeCheckoutSession(
  overrides?: Record<string, unknown>
): Stripe.Checkout.Session {
  return {
    id: 'cs_test_123',
    object: 'checkout.session',
    mode: 'subscription',
    status: 'complete',
    customer: 'cus_test_123',
    subscription: 'sub_test_123',
    metadata: { userId: 'user_test_123', planId: 'pro' },
    url: 'https://checkout.stripe.com/test_session',
    success_url: 'http://localhost:3000/pricing/success',
    cancel_url: 'http://localhost:3000/pricing',
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

export function buildStripeInvoice(overrides?: Record<string, unknown>): Stripe.Invoice {
  return {
    id: 'in_test_123',
    object: 'invoice',
    customer: 'cus_test_123',
    amount_paid: 999,
    amount_due: 999,
    currency: 'usd',
    number: 'IN-0001',
    status: 'paid',
    parent: {
      type: 'subscription_details',
      subscription_details: {
        subscription: 'sub_test_123',
        metadata: { userId: 'user_test_123' },
      },
    },
    ...overrides,
  } as unknown as Stripe.Invoice;
}

export function buildStripeEvent(type: string, data: unknown): Stripe.Event {
  return {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    type,
    data: { object: data },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    api_version: '2026-02-25.clover',
    request: null,
  } as unknown as Stripe.Event;
}

export function buildStripePrice(overrides?: Record<string, unknown>): Stripe.Price {
  return {
    id: 'price_test_monthly',
    object: 'price',
    active: true,
    currency: 'usd',
    unit_amount: 999,
    product: 'prod_test_123',
    type: 'recurring',
    recurring: { interval: 'month', interval_count: 1 },
    metadata: {},
    ...overrides,
  } as unknown as Stripe.Price;
}

export function buildStripeProduct(overrides?: Record<string, unknown>): Stripe.Product {
  return {
    id: 'prod_test_123',
    object: 'product',
    name: 'Pro Plan',
    active: true,
    metadata: { planId: 'pro' },
    ...overrides,
  } as unknown as Stripe.Product;
}

export function buildStripeCustomer(overrides?: Record<string, unknown>): Stripe.Customer {
  return {
    id: 'cus_test_123',
    object: 'customer',
    email: 'test@example.com',
    metadata: { userId: 'user_test_123' },
    ...overrides,
  } as unknown as Stripe.Customer;
}

export function buildStripeBillingPortalSession(
  overrides?: Record<string, unknown>
): Stripe.BillingPortal.Session {
  return {
    id: 'bps_test_123',
    object: 'billing_portal.session',
    url: 'https://billing.stripe.com/session/test',
    return_url: 'http://localhost:3000/pricing',
    customer: 'cus_test_123',
    ...overrides,
  } as unknown as Stripe.BillingPortal.Session;
}
