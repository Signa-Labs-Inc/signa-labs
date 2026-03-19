import type {
  PlanForPricingPage,
  UsageSummary,
} from '@/lib/services/subscriptions/subscriptions.types';

/**
 * Sets up fetch mock that routes by URL pattern.
 * Each handler is a [urlSubstring, responseBody, options?] tuple.
 */
export function mockFetchResponses(
  handlers: [string, unknown, { status?: number; ok?: boolean }?][]
) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;
    for (const [pattern, body, opts] of handlers) {
      if (url.includes(pattern)) {
        const status = opts?.status ?? 200;
        return new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    return new Response('Not found', { status: 404 });
  });
}

/**
 * Mock window.location.href assignments.
 * Returns an object whose `.value` tracks the last assigned href.
 */
export function mockWindowLocation() {
  const tracker = { value: '' };
  Object.defineProperty(window, 'location', {
    value: new Proxy(window.location, {
      set(_target, prop, val) {
        if (prop === 'href') {
          tracker.value = val;
        }
        return true;
      },
      get(target, prop) {
        if (prop === 'href') return tracker.value;
        const v = Reflect.get(target, prop);
        return typeof v === 'function' ? v.bind(target) : v;
      },
    }),
    writable: true,
    configurable: true,
  });
  return tracker;
}

/** Spy on window.open */
export function mockWindowOpen() {
  const spy = vi.fn();
  window.open = spy;
  return spy;
}

export function buildPlanForPricing(overrides?: Partial<PlanForPricingPage>): PlanForPricingPage {
  return {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals',
    displayFeatures: ['Feature A', 'Feature B'],
    sortOrder: 1,
    prices: [
      { stripePriceId: 'price_monthly', currency: 'usd', interval: 'month', unitAmount: 1999 },
      { stripePriceId: 'price_yearly', currency: 'usd', interval: 'year', unitAmount: 19990 },
    ],
    ...overrides,
  };
}

export function buildUsageSummary(overrides?: Partial<UsageSummary>): UsageSummary {
  return {
    feature: 'exercises',
    label: 'Exercises',
    current: 5,
    limit: 10,
    window: 'day',
    resetsAt: new Date().toISOString(),
    ...overrides,
  };
}
