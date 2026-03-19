vi.mock('../subscriptions.reader', () => ({
  getActiveSubscriptionByUserId: vi.fn(),
  getPlanById: vi.fn(),
  countUserExercisesSince: vi.fn(),
  countUserPathsSince: vi.fn(),
  countUserAiGenerationsSince: vi.fn(),
  countUserSubmissionsSince: vi.fn(),
}));

vi.mock('@/lib/services/notifications/notifications.service', () => ({
  createUsageAlertIfNeeded: vi.fn().mockResolvedValue(false),
}));

import * as reader from '../subscriptions.reader';
import { createUsageAlertIfNeeded } from '@/lib/services/notifications/notifications.service';
import {
  getPlanFeatures,
  checkUsageLimit,
  requireUsageLimit,
  getAllUsageLimits,
} from '../subscriptions.gate';
import { buildSubscription, buildPlan } from '@/test/helpers/factories';

const mockReader = vi.mocked(reader);
const mockCreateUsageAlert = vi.mocked(createUsageAlertIfNeeded);

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateUsageAlert.mockResolvedValue(false);
});

// ─── getPlanFeatures ─────────────────────────────────────────────────────

describe('getPlanFeatures', () => {
  const DEFAULT_FREE = {
    exercises: { limit: 1, window: 'day' },
    paths: { limit: 1, window: 'week' },
    aiGenerations: { limit: 1, window: 'day' },
    submissions: { limit: 5, window: 'day' },
  };

  it('returns DEFAULT_FREE_FEATURES when no subscription', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
    expect(await getPlanFeatures('user1')).toEqual(DEFAULT_FREE);
  });

  it('returns DEFAULT_FREE_FEATURES when plan not found', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(buildSubscription() as never);
    mockReader.getPlanById.mockResolvedValue(null);
    expect(await getPlanFeatures('user1')).toEqual(DEFAULT_FREE);
  });

  it('returns DEFAULT_FREE_FEATURES when features is null', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(buildSubscription() as never);
    mockReader.getPlanById.mockResolvedValue(
      buildPlan({ features: null as unknown as Record<string, unknown> })
    );
    expect(await getPlanFeatures('user1')).toEqual(DEFAULT_FREE);
  });

  it('returns DEFAULT_FREE_FEATURES when features is non-object', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(buildSubscription() as never);
    mockReader.getPlanById.mockResolvedValue(
      buildPlan({ features: 'invalid' as unknown as Record<string, unknown> })
    );
    expect(await getPlanFeatures('user1')).toEqual(DEFAULT_FREE);
  });

  it('returns plan features merged with defaults for missing keys', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(buildSubscription() as never);
    mockReader.getPlanById.mockResolvedValue(
      buildPlan({
        features: {
          exercises: { limit: 10, window: 'day' },
          paths: { limit: 5, window: 'month' },
          aiGenerations: { limit: 20, window: 'day' },
          // submissions missing — should fall back to default
        },
      })
    );

    const result = await getPlanFeatures('user1');
    expect(result.exercises).toEqual({ limit: 10, window: 'day' });
    expect(result.submissions).toEqual(DEFAULT_FREE.submissions);
  });
});

// ─── checkUsageLimit ─────────────────────────────────────────────────────

describe('checkUsageLimit', () => {
  beforeEach(() => {
    // Default: no subscription = free tier
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
  });

  it('returns allowed: true with limit: -1 for unlimited', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(buildSubscription() as never);
    mockReader.getPlanById.mockResolvedValue(
      buildPlan({
        features: {
          exercises: { limit: -1, window: 'day' },
          paths: { limit: -1, window: 'week' },
          aiGenerations: { limit: -1, window: 'day' },
          submissions: { limit: -1, window: 'day' },
        },
      })
    );

    const result = await checkUsageLimit('user1', 'exercises');
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(-1);
  });

  it('returns allowed: true when under limit', async () => {
    mockReader.countUserExercisesSince.mockResolvedValue(0);

    const result = await checkUsageLimit('user1', 'exercises');
    expect(result.allowed).toBe(true);
    expect(result.current).toBe(0);
    expect(result.limit).toBe(1); // free tier
  });

  it('returns allowed: false when at limit', async () => {
    mockReader.countUserExercisesSince.mockResolvedValue(1);

    const result = await checkUsageLimit('user1', 'exercises');
    expect(result.allowed).toBe(false);
    expect(result.current).toBe(1);
  });

  it('returns allowed: false when over limit', async () => {
    mockReader.countUserExercisesSince.mockResolvedValue(5);

    const result = await checkUsageLimit('user1', 'exercises');
    expect(result.allowed).toBe(false);
  });

  it('calls createUsageAlertIfNeeded (fire-and-forget)', async () => {
    mockReader.countUserExercisesSince.mockResolvedValue(0);

    await checkUsageLimit('user1', 'exercises');

    // Give the fire-and-forget a tick to resolve
    await new Promise((r) => setTimeout(r, 10));
    expect(mockCreateUsageAlert).toHaveBeenCalled();
  });

  it('does not throw if alert creation fails', async () => {
    mockReader.countUserExercisesSince.mockResolvedValue(0);
    mockCreateUsageAlert.mockRejectedValue(new Error('Alert failed'));

    // Should not throw
    const result = await checkUsageLimit('user1', 'exercises');
    expect(result.allowed).toBe(true);
  });
});

// ─── requireUsageLimit ───────────────────────────────────────────────────

describe('requireUsageLimit', () => {
  beforeEach(() => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
  });

  it('passes when under limit', async () => {
    mockReader.countUserExercisesSince.mockResolvedValue(0);
    await expect(requireUsageLimit('user1', 'exercises')).resolves.not.toThrow();
  });

  it('throws ForbiddenError when limit exceeded', async () => {
    mockReader.countUserExercisesSince.mockResolvedValue(1);

    await expect(requireUsageLimit('user1', 'exercises')).rejects.toThrow(
      /reached your exercises limit/
    );
  });
});

// ─── getAllUsageLimits ────────────────────────────────────────────────────

describe('getAllUsageLimits', () => {
  it('returns all 4 features with correct current/limit/window', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(null);
    mockReader.countUserExercisesSince.mockResolvedValue(0);
    mockReader.countUserPathsSince.mockResolvedValue(1);
    mockReader.countUserAiGenerationsSince.mockResolvedValue(0);
    mockReader.countUserSubmissionsSince.mockResolvedValue(3);

    const result = await getAllUsageLimits('user1');
    expect(result).toHaveLength(4);
    expect(result.map((r) => r.feature)).toEqual([
      'exercises',
      'paths',
      'aiGenerations',
      'submissions',
    ]);
    expect(result.find((r) => r.feature === 'paths')!.current).toBe(1);
    expect(result.find((r) => r.feature === 'submissions')!.current).toBe(3);
  });

  it('returns limit: -1 and current: 0 for unlimited features', async () => {
    mockReader.getActiveSubscriptionByUserId.mockResolvedValue(buildSubscription() as never);
    mockReader.getPlanById.mockResolvedValue(
      buildPlan({
        features: {
          exercises: { limit: -1, window: 'day' },
          paths: { limit: -1, window: 'week' },
          aiGenerations: { limit: -1, window: 'day' },
          submissions: { limit: -1, window: 'day' },
        },
      })
    );

    const result = await getAllUsageLimits('user1');
    for (const usage of result) {
      expect(usage.limit).toBe(-1);
      expect(usage.current).toBe(0);
    }
  });
});
