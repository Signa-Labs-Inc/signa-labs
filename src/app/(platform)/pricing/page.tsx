import type { Metadata } from 'next';
import { Check, Crown } from 'lucide-react';

export const metadata: Metadata = { title: 'Pricing' };
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with the basics and build your skills.',
    features: [
      '5 exercises per day',
      'Community exercises',
      'Basic code feedback',
      '3 AI-generated exercises per month',
      'Progress tracking',
    ],
    cta: 'Current Plan',
    highlighted: false,
    disabled: true,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'Unlimited practice with advanced AI-powered feedback.',
    features: [
      'Unlimited exercises',
      'Advanced AI feedback & explanations',
      'Unlimited AI-generated exercises',
      'Learning paths',
      'Priority support',
      'Detailed performance analytics',
      'Export progress reports',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
    disabled: false,
  },
  {
    name: 'Team',
    price: '$39',
    period: '/seat/month',
    description: 'For teams and organizations that learn together.',
    features: [
      'Everything in Pro',
      'Team dashboard & leaderboards',
      'Custom exercise collections',
      'Admin & role management',
      'SSO / SAML authentication',
      'Dedicated account manager',
      'Invoice billing',
    ],
    cta: 'Contact Sales',
    highlighted: false,
    disabled: false,
  },
];

export default function PricingPage() {
  return (
    <div className="animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <Crown className="h-4 w-4" />
            Pricing
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Start free. Upgrade when you&apos;re ready to accelerate your learning.
          </p>
        </div>
      </div>

      {/* Plans grid */}
      <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-xl border p-6 transition-all ${
              plan.highlighted
                ? 'border-primary bg-primary/3 shadow-lg shadow-primary/10 scale-[1.02]'
                : 'border-border bg-card'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-primary to-violet-400 px-3 py-0.5 text-xs font-semibold text-white">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-sm">
                  {plan.period}
                </span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {plan.description}
              </p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      plan.highlighted ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={plan.highlighted ? 'default' : 'outline'}
              disabled={plan.disabled}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* FAQ teaser */}
      <div className="mt-16 text-center">
        <p className="text-muted-foreground text-sm">
          Have questions?{' '}
          <a href="/faqs" className="text-primary hover:underline">
            Check our FAQs
          </a>{' '}
          or{' '}
          <a href="/contact" className="text-primary hover:underline">
            contact us
          </a>
          .
        </p>
      </div>
      </div>
    </div>
  );
}
