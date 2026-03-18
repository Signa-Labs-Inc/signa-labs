vi.mock('@/lib/services/auth/auth.service', () => ({
  requireCurrentUser: vi.fn(),
}));

vi.mock('@/lib/services/subscriptions/subscriptions.service', () => ({
  getUserPlan: vi.fn(),
}));

import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { getUserPlan } from '@/lib/services/subscriptions/subscriptions.service';
import { GET } from '../route';
import { mockUser } from '@/test/helpers/mock-auth';

const mockAuth = vi.mocked(requireCurrentUser);
const mockGetUserPlan = vi.mocked(getUserPlan);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(mockUser as never);
});

describe('GET /api/stripe/subscription', () => {
  it('returns user plan', async () => {
    mockGetUserPlan.mockResolvedValue({
      planId: 'pro',
      planName: 'Pro',
      status: 'active',
      currentPeriodEnd: new Date('2026-04-01'),
      cancelAtPeriodEnd: false,
    });

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.plan.planId).toBe('pro');
  });

  it('returns null plan when no subscription', async () => {
    mockGetUserPlan.mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.plan).toBeNull();
  });
});
