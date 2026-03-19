import type { Metadata } from 'next';
import { Crown } from 'lucide-react';
import { getCurrentUser } from '@/lib/services/auth/auth.service';
import {
  getUserPlan,
  getPlansForPricingPage,
} from '@/lib/services/subscriptions/subscriptions.service';
import { PricingCards } from './pricing-cards';

export const metadata: Metadata = { title: 'Pricing' };

export default async function PricingPage() {
  const user = await getCurrentUser();
  const [userPlan, plans] = await Promise.all([
    user ? getUserPlan(user.id) : Promise.resolve(null),
    getPlansForPricingPage(),
  ]);

  return (
    <div className="animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="border-border from-primary/10 via-background relative overflow-hidden border-b bg-linear-to-br to-violet-500/5">
        <div className="from-primary/5 absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 py-12 text-center">
          <div className="text-primary mx-auto mb-3 flex items-center justify-center gap-2 text-sm font-medium">
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
        <PricingCards plans={plans} userPlan={userPlan} isSignedIn={!!user} />

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
