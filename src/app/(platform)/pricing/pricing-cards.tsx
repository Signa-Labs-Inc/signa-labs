'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserPlan, PlanForPricingPage } from '@/lib/services/subscriptions/subscriptions.types';

type BillingInterval = 'month' | 'year';

function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

export function PricingCards({
  plans,
  userPlan,
  isSignedIn,
}: {
  plans: PlanForPricingPage[];
  userPlan: UserPlan;
  isSignedIn: boolean;
}) {
  const [interval, setInterval] = useState<BillingInterval>('month');
  const [loading, setLoading] = useState<string | null>(null);

  // Compute yearly savings for the toggle label
  const savingsPercent = (() => {
    for (const plan of plans) {
      const monthly = plan.prices.find((p) => p.interval === 'month');
      const yearly = plan.prices.find((p) => p.interval === 'year');
      if (monthly && yearly && monthly.unitAmount > 0) {
        return Math.round((1 - yearly.unitAmount / 12 / monthly.unitAmount) * 100);
      }
    }
    return 0;
  })();

  const hasYearlyPrices = plans.some((p) => p.prices.some((pr) => pr.interval === 'year'));

  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error?.message ?? 'Failed to start checkout');
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading('portal');
    setError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error?.message ?? 'Failed to open billing portal');
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(null);
    }
  }

  function getPriceDisplay(plan: PlanForPricingPage) {
    const isFree = plan.id === 'free';
    const isEnterprise = plan.id === 'enterprise';

    if (isFree) {
      return { price: '$0', period: 'forever', subtext: null };
    }

    if (plan.prices.length === 0) {
      if (isEnterprise) {
        return { price: 'Custom', period: 'Contact Sales', subtext: null };
      }
      // Paid plan with no resolved Stripe prices (e.g. placeholder IDs)
      return { price: '—', period: 'Coming soon', subtext: null };
    }

    const currentPrice = plan.prices.find((p) => p.interval === interval);
    if (!currentPrice) {
      // Fallback: try the other interval
      const fallback = plan.prices[0];
      if (!fallback) {
        return { price: '—', period: '', subtext: null };
      }
      return {
        price: formatPrice(fallback.unitAmount),
        period: `/${fallback.interval}`,
        subtext: null,
      };
    }

    if (interval === 'year') {
      const monthlyEquiv = formatPrice(Math.round(currentPrice.unitAmount / 12));
      return {
        price: formatPrice(currentPrice.unitAmount),
        period: '/year',
        subtext: `${monthlyEquiv}/mo, billed annually`,
      };
    }

    return {
      price: formatPrice(currentPrice.unitAmount),
      period: '/month',
      subtext: null,
    };
  }

  function getCtaProps(plan: PlanForPricingPage) {
    const isCurrentPlan = userPlan?.planId === plan.id;
    const hasSubscription = userPlan !== null;
    const isFree = plan.id === 'free';
    const isEnterprise = plan.id === 'enterprise';

    if (isCurrentPlan || (isFree && !hasSubscription)) {
      return {
        label: 'Current Plan',
        disabled: true,
        onClick: () => {},
      };
    }

    if (hasSubscription) {
      return {
        label: 'Manage Subscription',
        disabled: loading === 'portal',
        onClick: handlePortal,
      };
    }

    if (isEnterprise && plan.prices.length === 0) {
      return {
        label: 'Contact Sales',
        disabled: false,
        onClick: () => {
          window.location.href = '/contact';
        },
      };
    }

    // Paid plan with no resolved prices — disable checkout
    if (plan.prices.length === 0) {
      return {
        label: 'Coming Soon',
        disabled: true,
        onClick: () => {},
      };
    }

    if (!isSignedIn) {
      return {
        label: `Upgrade to ${plan.name}`,
        disabled: false,
        onClick: () => {
          window.location.href = '/sign-in';
        },
      };
    }

    return {
      label: `Upgrade to ${plan.name}`,
      disabled: loading === plan.id,
      onClick: () => handleCheckout(plan.id),
    };
  }

  return (
    <div>
      {/* Billing interval toggle */}
      {hasYearlyPrices && (
        <div className="mb-8 flex items-center justify-center gap-2" role="radiogroup" aria-label="Billing interval">
          <button
            role="radio"
            aria-checked={interval === 'month'}
            onClick={() => { setInterval('month'); setError(null); }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              interval === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            role="radio"
            aria-checked={interval === 'year'}
            onClick={() => { setInterval('year'); setError(null); }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              interval === 'year'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly{savingsPercent > 0 ? ` — Save ${savingsPercent}%` : ''}
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Plans grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const highlighted = plan.id === 'pro';
          const priceDisplay = getPriceDisplay(plan);
          const cta = getCtaProps(plan);

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border p-6 transition-all ${
                highlighted
                  ? 'border-primary bg-primary/3 shadow-lg shadow-primary/10 scale-[1.02]'
                  : 'border-border bg-card'
              }`}
            >
              {highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-primary to-violet-400 px-3 py-0.5 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {priceDisplay.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {priceDisplay.period}
                  </span>
                </div>
                {priceDisplay.subtext && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {priceDisplay.subtext}
                  </p>
                )}
                <p className="text-muted-foreground mt-2 text-sm">
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.displayFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        highlighted ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={highlighted ? 'default' : 'outline'}
                disabled={cta.disabled}
                onClick={cta.onClick}
              >
                {loading === plan.id ||
                (loading === 'portal' && cta.label === 'Manage Subscription') ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {cta.label}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
