import type { Metadata } from 'next';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { getUserPlan } from '@/lib/services/subscriptions/subscriptions.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BillingActions } from './billing-actions';
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle,
  Clock,
  Crown,
  History,
  Receipt,
  XCircle,
  Zap,
} from 'lucide-react';
import { getActivePlansWithPrices } from '@/lib/services/subscriptions/subscriptions.reader';

export const metadata: Metadata = { title: 'Billing' };

function StatusLabel({
  status,
  cancelAtPeriodEnd,
}: {
  status: string;
  cancelAtPeriodEnd: boolean;
}) {
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

  const c = config[status] ?? {
    label: status,
    className: 'text-muted-foreground',
    icon: CheckCircle,
  };
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
  const [plan, allPlans] = await Promise.all([getUserPlan(user.id), getActivePlansWithPrices()]);

  // Find the next tier up for upgrade comparison
  const currentPlanId = plan?.planId ?? 'free';
  const currentPlan = allPlans.find((p) => p.id === currentPlanId);
  const nextPlan = allPlans.find(
    (p) => p.sortOrder > (currentPlan?.sortOrder ?? -1) && p.id !== 'enterprise'
  );

  return (
    <div className="animate-fade-in mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
      <p className="text-muted-foreground mt-1">Manage your subscription and billing details.</p>

      {plan ? (
        <div className="border-border bg-card mt-8 overflow-hidden rounded-xl border">
          {/* Plan header */}
          <div className="border-border bg-muted/30 flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Crown className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{plan.planName}</h2>
                <StatusLabel status={plan.status} cancelAtPeriodEnd={plan.cancelAtPeriodEnd} />
              </div>
            </div>
            <BillingActions />
          </div>

          {/* Plan details */}
          <div className="space-y-4 px-6 py-5">
            {plan.currentPeriodEnd && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="text-muted-foreground h-4 w-4 shrink-0" />
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
                  Your subscription has been cancelled and will not renew. You&apos;ll retain access
                  until the end of the current billing period.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="border-border bg-card overflow-hidden rounded-xl border">
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">Free</h2>
                <p className="text-muted-foreground text-sm">Get more with a paid plan.</p>
              </div>
              <Button asChild>
                <Link href="/pricing">Upgrade</Link>
              </Button>
            </div>
          </div>

          {nextPlan && nextPlan.displayFeatures.length > 0 && (
            <div className="border-primary/20 bg-primary/[0.02] overflow-hidden rounded-xl border">
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-center gap-2">
                  <Zap className="text-primary h-4 w-4" />
                  <h3 className="font-semibold">Upgrade to {nextPlan.name}</h3>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{nextPlan.description}</p>
              </div>
              <div className="px-6 pb-4">
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {nextPlan.displayFeatures.slice(0, 6).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-primary/10 border-t px-6 py-3">
                <Link
                  href="/pricing"
                  className="group text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
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
          className="group border-border bg-card hover:border-primary/30 rounded-xl border p-6 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <BarChart3 className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="group-hover:text-primary font-semibold transition-colors">Usage</h2>
              <p className="text-muted-foreground text-sm">Plan limits &amp; usage.</p>
            </div>
          </div>
        </Link>

        <Link
          href="/settings/billing/payments"
          className="group border-border bg-card hover:border-primary/30 rounded-xl border p-6 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Receipt className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="group-hover:text-primary font-semibold transition-colors">Payments</h2>
              <p className="text-muted-foreground text-sm">Invoices &amp; charges.</p>
            </div>
          </div>
        </Link>

        <Link
          href="/settings/billing/history"
          className="group border-border bg-card hover:border-primary/30 rounded-xl border p-6 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <History className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="group-hover:text-primary font-semibold transition-colors">History</h2>
              <p className="text-muted-foreground text-sm">Subscription changes.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
