import { NextRequest } from 'next/server';

vi.mock('@/lib/services/auth/auth.service', () => ({
  requireCurrentUser: vi.fn(),
}));

vi.mock('@/lib/services/subscriptions/subscriptions.service', () => ({
  createCheckoutSession: vi.fn(),
}));

import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { createCheckoutSession } from '@/lib/services/subscriptions/subscriptions.service';
import { POST } from '../route';
import { mockUser } from '@/test/helpers/mock-auth';

const mockAuth = vi.mocked(requireCurrentUser);
const mockCheckout = vi.mocked(createCheckoutSession);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(mockUser as never);
});

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/stripe/checkout', () => {
  it('returns 401 when not authenticated', async () => {
    const { UnauthorizedError } = await import('@/lib/utils/errors');
    mockAuth.mockRejectedValue(new UnauthorizedError());

    const res = await POST(makeRequest({ planId: 'pro', interval: 'month' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when planId is missing', async () => {
    const res = await POST(makeRequest({ interval: 'month' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when interval is invalid', async () => {
    const res = await POST(makeRequest({ planId: 'pro', interval: 'weekly' }));
    expect(res.status).toBe(400);
  });

  it('returns checkout URL on success', async () => {
    mockCheckout.mockResolvedValue('https://checkout.stripe.com/test');

    const res = await POST(makeRequest({ planId: 'pro', interval: 'month' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe('https://checkout.stripe.com/test');
  });

  it('passes correct params to createCheckoutSession', async () => {
    mockCheckout.mockResolvedValue('https://test.com');

    await POST(makeRequest({ planId: 'pro', interval: 'year' }));
    expect(mockCheckout).toHaveBeenCalledWith(mockUser.id, mockUser.email, 'pro', 'year');
  });
});
