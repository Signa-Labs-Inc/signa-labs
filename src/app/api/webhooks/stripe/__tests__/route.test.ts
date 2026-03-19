import { NextRequest } from 'next/server';
import { buildStripeEvent, buildStripeCheckoutSession, buildStripeSubscription, buildStripeInvoice } from '@/test/helpers/stripe-fixtures';

vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
  },
}));

vi.mock('@/lib/services/subscriptions/subscriptions.reader', () => ({
  getIdempotencyKeyStatus: vi.fn(),
}));

vi.mock('@/lib/services/subscriptions/subscriptions.writer', () => ({
  insertIdempotencyKey: vi.fn(),
  markIdempotencyKeyCompleted: vi.fn(),
  deleteIdempotencyKey: vi.fn(),
}));

vi.mock('@/lib/services/subscriptions/subscriptions.service', () => ({
  handleCheckoutCompleted: vi.fn(),
  handleSubscriptionUpdated: vi.fn(),
  handleSubscriptionDeleted: vi.fn(),
  handleInvoicePaid: vi.fn(),
  handleInvoicePaymentFailed: vi.fn(),
}));

import { stripe } from '@/lib/stripe/client';
import { getIdempotencyKeyStatus } from '@/lib/services/subscriptions/subscriptions.reader';
import { insertIdempotencyKey, markIdempotencyKeyCompleted, deleteIdempotencyKey } from '@/lib/services/subscriptions/subscriptions.writer';
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from '@/lib/services/subscriptions/subscriptions.service';
import { POST } from '../route';

const mockStripe = vi.mocked(stripe);
const mockGetIdempotencyKeyStatus = vi.mocked(getIdempotencyKeyStatus);
const mockInsertIdempotencyKey = vi.mocked(insertIdempotencyKey);
const mockMarkCompleted = vi.mocked(markIdempotencyKeyCompleted);
const mockDeleteKey = vi.mocked(deleteIdempotencyKey);
const mockHandlers = {
  handleCheckoutCompleted: vi.mocked(handleCheckoutCompleted),
  handleSubscriptionUpdated: vi.mocked(handleSubscriptionUpdated),
  handleSubscriptionDeleted: vi.mocked(handleSubscriptionDeleted),
  handleInvoicePaid: vi.mocked(handleInvoicePaid),
  handleInvoicePaymentFailed: vi.mocked(handleInvoicePaymentFailed),
};

function makeRequest(body = '{}', sig: string | null = 'test_sig') {
  const headers = new Headers();
  if (sig) headers.set('stripe-signature', sig);
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetIdempotencyKeyStatus.mockResolvedValue(null);
  mockInsertIdempotencyKey.mockResolvedValue(true);
});

describe('POST /api/webhooks/stripe', () => {
  it('returns 400 when stripe-signature header missing', async () => {
    const res = await POST(makeRequest('{}', null));
    expect(res.status).toBe(400);
  });

  it('returns 400 when signature verification fails', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
  });

  it('returns 200 for unhandled event types', async () => {
    const event = buildStripeEvent('some.unknown.event', {});
    mockStripe.webhooks.constructEvent.mockReturnValue(event as never);

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });

  it('returns 200 when event already completed (skips handler)', async () => {
    const event = buildStripeEvent('checkout.session.completed', buildStripeCheckoutSession());
    mockStripe.webhooks.constructEvent.mockReturnValue(event as never);
    mockGetIdempotencyKeyStatus.mockResolvedValue('completed');

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockHandlers.handleCheckoutCompleted).not.toHaveBeenCalled();
  });

  it('returns 500 when event is processing (triggers Stripe retry)', async () => {
    const event = buildStripeEvent('checkout.session.completed', buildStripeCheckoutSession());
    mockStripe.webhooks.constructEvent.mockReturnValue(event as never);
    mockGetIdempotencyKeyStatus.mockResolvedValue('processing');

    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
  });

  it('returns 500 when insertIdempotencyKey returns false (race lost)', async () => {
    const event = buildStripeEvent('checkout.session.completed', buildStripeCheckoutSession());
    mockStripe.webhooks.constructEvent.mockReturnValue(event as never);
    mockInsertIdempotencyKey.mockResolvedValue(false);

    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
  });

  it.each([
    ['checkout.session.completed', 'handleCheckoutCompleted', buildStripeCheckoutSession()],
    ['customer.subscription.updated', 'handleSubscriptionUpdated', buildStripeSubscription()],
    ['customer.subscription.deleted', 'handleSubscriptionDeleted', buildStripeSubscription()],
    ['invoice.paid', 'handleInvoicePaid', buildStripeInvoice()],
    ['invoice.payment_failed', 'handleInvoicePaymentFailed', buildStripeInvoice()],
  ] as const)('calls %s handler for %s event', async (eventType, handlerName, data) => {
    const event = buildStripeEvent(eventType, data);
    mockStripe.webhooks.constructEvent.mockReturnValue(event as never);
    (mockHandlers[handlerName] as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockHandlers[handlerName]).toHaveBeenCalled();
  });

  it('marks key completed after success', async () => {
    const event = buildStripeEvent('invoice.paid', buildStripeInvoice());
    mockStripe.webhooks.constructEvent.mockReturnValue(event as never);
    mockHandlers.handleInvoicePaid.mockResolvedValue(undefined);

    await POST(makeRequest());
    expect(mockMarkCompleted).toHaveBeenCalledWith(event.id, 'stripe_webhook');
  });

  it('deletes key on handler failure', async () => {
    const event = buildStripeEvent('invoice.paid', buildStripeInvoice());
    mockStripe.webhooks.constructEvent.mockReturnValue(event as never);
    mockHandlers.handleInvoicePaid.mockRejectedValue(new Error('Handler failed'));

    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
    expect(mockDeleteKey).toHaveBeenCalledWith(event.id, 'stripe_webhook');
  });

  it('returns 200 even if markIdempotencyKeyCompleted fails', async () => {
    const event = buildStripeEvent('invoice.paid', buildStripeInvoice());
    mockStripe.webhooks.constructEvent.mockReturnValue(event as never);
    mockHandlers.handleInvoicePaid.mockResolvedValue(undefined);
    mockMarkCompleted.mockRejectedValue(new Error('DB error'));

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });
});
