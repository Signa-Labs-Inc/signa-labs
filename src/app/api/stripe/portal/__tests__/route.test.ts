vi.mock('@/lib/services/auth/auth.service', () => ({
  requireCurrentUser: vi.fn(),
}));

vi.mock('@/lib/services/subscriptions/subscriptions.service', () => ({
  createBillingPortalSession: vi.fn(),
}));

import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { createBillingPortalSession } from '@/lib/services/subscriptions/subscriptions.service';
import { POST } from '../route';
import { mockUser } from '@/test/helpers/mock-auth';

const mockAuth = vi.mocked(requireCurrentUser);
const mockPortal = vi.mocked(createBillingPortalSession);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(mockUser as never);
});

describe('POST /api/stripe/portal', () => {
  it('returns portal URL on success', async () => {
    mockPortal.mockResolvedValue('https://billing.stripe.com/session/test');

    const res = await POST();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe('https://billing.stripe.com/session/test');
  });

  it('returns 401 when not authenticated', async () => {
    const { UnauthorizedError } = await import('@/lib/utils/errors');
    mockAuth.mockRejectedValue(new UnauthorizedError());

    const res = await POST();
    expect(res.status).toBe(401);
  });
});
