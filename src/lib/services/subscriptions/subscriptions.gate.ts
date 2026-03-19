import * as reader from './subscriptions.reader';
import { ForbiddenError } from '@/lib/utils/errors';
import { createUsageAlertIfNeeded } from '@/lib/services/notifications/notifications.service';

export type RateLimit = {
  limit: number; // max count per window (-1 = unlimited)
  window: 'day' | 'week' | 'month';
};

export type PlanFeatures = {
  exercises: RateLimit;
  paths: RateLimit;
  aiGenerations: RateLimit;
  submissions: RateLimit;
};

export type PlanTier = 'free' | 'pro' | 'enterprise';

const VALID_PLAN_TIERS = new Set<string>(['free', 'pro', 'enterprise']);

const DEFAULT_FREE_FEATURES: PlanFeatures = {
  exercises: { limit: 1, window: 'day' },
  paths: { limit: 1, window: 'week' },
  aiGenerations: { limit: 1, window: 'day' },
  submissions: { limit: 5, window: 'day' },
};

export async function getUserPlanTier(userId: string): Promise<PlanTier> {
  const sub = await reader.getActiveSubscriptionByUserId(userId);
  if (!sub) return 'free';
  // Validate planId is a known tier; default to 'free' for custom plan IDs
  return VALID_PLAN_TIERS.has(sub.planId) ? (sub.planId as PlanTier) : 'free';
}

export async function getPlanFeatures(userId: string): Promise<PlanFeatures> {
  const sub = await reader.getActiveSubscriptionByUserId(userId);
  if (!sub) return DEFAULT_FREE_FEATURES;

  const plan = await reader.getPlanById(sub.planId);
  if (!plan?.features || typeof plan.features !== 'object') {
    return DEFAULT_FREE_FEATURES;
  }

  const raw = plan.features as Record<string, unknown>;

  // Merge with defaults to handle plans missing newer feature keys (e.g. submissions)
  return {
    exercises: isValidRateLimit(raw.exercises)
      ? (raw.exercises as RateLimit)
      : DEFAULT_FREE_FEATURES.exercises,
    paths: isValidRateLimit(raw.paths) ? (raw.paths as RateLimit) : DEFAULT_FREE_FEATURES.paths,
    aiGenerations: isValidRateLimit(raw.aiGenerations)
      ? (raw.aiGenerations as RateLimit)
      : DEFAULT_FREE_FEATURES.aiGenerations,
    submissions: isValidRateLimit(raw.submissions)
      ? (raw.submissions as RateLimit)
      : DEFAULT_FREE_FEATURES.submissions,
  };
}

function isValidRateLimit(val: unknown): val is RateLimit {
  if (typeof val !== 'object' || val === null) return false;
  const obj = val as Record<string, unknown>;
  return (
    typeof obj.limit === 'number' &&
    Number.isInteger(obj.limit) &&
    typeof obj.window === 'string' &&
    ['day', 'week', 'month'].includes(obj.window)
  );
}

function getWindowStart(window: 'day' | 'week' | 'month'): Date {
  const now = new Date();
  switch (window) {
    case 'day':
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    case 'week': {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const day = d.getUTCDay();
      const diff = day === 0 ? 6 : day - 1; // Monday = start of week
      d.setUTCDate(d.getUTCDate() - diff);
      return d;
    }
    case 'month':
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
}

function getWindowEnd(window: 'day' | 'week' | 'month'): Date {
  const start = getWindowStart(window);
  switch (window) {
    case 'day':
      return new Date(start.getTime() + 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'month': {
      const next = new Date(start);
      next.setUTCMonth(next.getUTCMonth() + 1);
      return next;
    }
  }
}

const countFunctions: Record<keyof PlanFeatures, (userId: string, since: Date) => Promise<number>> =
  {
    exercises: reader.countUserExercisesSince,
    paths: reader.countUserPathsSince,
    aiGenerations: reader.countUserAiGenerationsSince,
    submissions: reader.countUserSubmissionsSince,
  };

const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
  exercises: 'Exercises Created',
  paths: 'Learning Paths',
  aiGenerations: 'AI Generations',
  submissions: 'Code Submissions',
};

export async function checkUsageLimit(
  userId: string,
  feature: keyof PlanFeatures
): Promise<{ allowed: boolean; current: number; limit: number; resetsAt: Date }> {
  const features = await getPlanFeatures(userId);
  const rateLimit = features[feature];

  if (rateLimit.limit === -1) {
    return { allowed: true, current: 0, limit: -1, resetsAt: new Date() };
  }

  const since = getWindowStart(rateLimit.window);
  const resetsAt = getWindowEnd(rateLimit.window);
  const current = await countFunctions[feature](userId, since);

  // Fire-and-forget: create usage alert if approaching/at limit
  createUsageAlertIfNeeded({
    userId,
    feature,
    label: FEATURE_LABELS[feature],
    current,
    limit: rateLimit.limit,
    windowStart: since,
  }).catch((err) => console.error('Usage alert failed:', err));

  return {
    allowed: current < rateLimit.limit,
    current,
    limit: rateLimit.limit,
    resetsAt,
  };
}

export async function requireUsageLimit(
  userId: string,
  feature: keyof PlanFeatures
): Promise<void> {
  const result = await checkUsageLimit(userId, feature);
  if (!result.allowed) {
    throw new ForbiddenError(
      `You've reached your ${feature} limit (${result.current}/${result.limit}). ` +
        `Resets ${formatResetTime(result.resetsAt)}. Upgrade your plan for higher limits.`
    );
  }
}

export async function requireUsageLimits(
  userId: string,
  features: (keyof PlanFeatures)[]
): Promise<void> {
  const planFeatures = await getPlanFeatures(userId);

  for (const feature of features) {
    const rateLimit = planFeatures[feature];
    if (rateLimit.limit === -1) continue;

    const since = getWindowStart(rateLimit.window);
    const current = await countFunctions[feature](userId, since);

    if (current >= rateLimit.limit) {
      const resetsAt = getWindowEnd(rateLimit.window);
      throw new ForbiddenError(
        `You've reached your ${feature} limit (${current}/${rateLimit.limit}). ` +
          `Resets ${formatResetTime(resetsAt)}. Upgrade your plan for higher limits.`
      );
    }
  }
}

function formatResetTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffHours <= 1) return 'in less than an hour';
  if (diffHours < 24) return `in ${diffHours} hours`;
  const diffDays = Math.ceil(diffHours / 24);
  if (diffDays === 1) return 'tomorrow';
  return `in ${diffDays} days`;
}

// Usage dashboard

import type { UsageSummary } from './subscriptions.types';

export async function getAllUsageLimits(userId: string): Promise<UsageSummary[]> {
  const features = await getPlanFeatures(userId);
  const featureKeys = Object.keys(FEATURE_LABELS) as (keyof PlanFeatures)[];

  return Promise.all(
    featureKeys.map(async (key) => {
      const rateLimit = features[key];

      if (rateLimit.limit === -1) {
        return {
          feature: key,
          label: FEATURE_LABELS[key],
          current: 0,
          limit: -1,
          window: rateLimit.window,
          resetsAt: new Date().toISOString(),
        };
      }

      const since = getWindowStart(rateLimit.window);
      const resetsAt = getWindowEnd(rateLimit.window);
      const current = await countFunctions[key](userId, since);

      return {
        feature: key,
        label: FEATURE_LABELS[key],
        current,
        limit: rateLimit.limit,
        window: rateLimit.window,
        resetsAt: resetsAt.toISOString(),
      };
    })
  );
}
