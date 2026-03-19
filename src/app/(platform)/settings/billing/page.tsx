import type { Metadata } from 'next';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { getUserPlan } from '@/lib/services/subscriptions/subscriptions.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BillingActions } from './billing-actions';
import { ArrowRight, BarChart3, Check, CheckCircle, Clock, Crown, History, Receipt, XCircle, Zap } from 'lucide-react';
import { getActivePlansWithPrices } from '@/lib/services/subscriptions/subscriptions.reader';

export const metadata: Metadata = { title: 'Billing' };

function StatusLabel({ status, cancelAtPeriodEnd }: { status: string; cancelAtPeriodEnd: boolean }) {
  if (cancelAtPeriodEnd) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
        <XCircle className="h-3 w-3" />
        Cancelling
      </span>
    );
  }

  const config: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
    active: { label: 'Active', className: 'text-green-500', icon: CheckCircle },
    trialing: { label: 'Trial', className: 'text-blue-500', icon: Clock },
    past_due: { label: 'Past Due', className: 'text-destructive', icon: XCircle },
    canceled: { label: 'Cancelled', className: 'text-muted-foreground', icon: XCircle },
  };

  const c = config[status] ?? { label: status, className: 'text-muted-foreground', icon: CheckCircle };
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${c.className}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

export default async function BillingPage() {
  const user = await requireCurrentUser();
  const [plan, allPlans] = await Promise.all([
    getUserPlan(user.id),
    getActivePlansWithPrices(),
  ]);

  // Find the next tier up for upgrade comparison
  const currentPlanId = plan?.planId ?? 'free';
  const currentPlan = allPlans.find((p) => p.id === currentPlanId);
  const nextPlan = allPlans.find((p) => p.sortOrder > (currentPlan?.sortOrder ?? -1) && p.id !== 'enterprise');

  return (
    <div className="animate-fade-in mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
      <p className="text-muted-foreground mt-1">
        Manage your subscription and billing details.
      </p>

      {plan ? (
        <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden">
          {/* Plan header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{plan.planName}</h2>
                <StatusLabel status={plan.status} cancelAtPeriodEnd={plan.cancelAtPeriodEnd} />
              </div>
            </div>
            <BillingActions />
          </div>

          {/* Plan details */}
          <div className="px-6 py-5 space-y-4">
            {plan.currentPeriodEnd && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {plan.cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}
                </span>
                <span className="ml-auto font-medium">
                  {new Date(plan.currentPeriodEnd).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            {plan.cancelAtPeriodEnd && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="text-sm text-amber-500">
                  Your subscription has been cancelled and will not renew. You&apos;ll retain access until the end of the current billing period.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">Free</h2>
                <p className="text-sm text-muted-foreground">
                  Get more with a paid plan.
                </p>
              </div>
              <Button asChild>
                <Link href="/pricing">Upgrade</Link>
              </Button>
            </div>
          </div>

          {nextPlan && nextPlan.displayFeatures.length > 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.02] overflow-hidden">
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Upgrade to {nextPlan.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {nextPlan.description}
                </p>
              </div>
              <div className="px-6 pb-4">
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {nextPlan.displayFeatures.slice(0, 6).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-primary/10 px-6 py-3">
                <Link
                  href="/pricing"
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  See plans and pricing
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/settings/billing/usage"
          className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold group-hover:text-primary transition-colors">Usage</h2>
              <p className="text-muted-foreground text-sm">
                Plan limits &amp; usage.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/settings/billing/payments"
          className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold group-hover:text-primary transition-colors">Payments</h2>
              <p className="text-muted-foreground text-sm">
                Invoices &amp; charges.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/settings/billing/history"
          className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold group-hover:text-primary transition-colors">History</h2>
              <p className="text-muted-foreground text-sm">
                Subscription changes.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
