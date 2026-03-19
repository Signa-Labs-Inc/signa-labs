import type { Metadata } from 'next';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { getAllUsageLimits, getUserPlan } from '@/lib/services/subscriptions/subscriptions.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { UsageSummary } from '@/lib/services/subscriptions/subscriptions.types';

export const metadata: Metadata = { title: 'Usage' };

function formatWindow(window: string) {
  switch (window) {
    case 'day':
      return 'today';
    case 'week':
      return 'this week';
    case 'month':
      return 'this month';
    default:
      return window;
  }
}

function formatResetsAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffHours <= 1) return 'less than an hour';
  if (diffHours < 24) return `${diffHours} hours`;
  const diffDays = Math.ceil(diffHours / 24);
  if (diffDays === 1) return 'tomorrow';
  return `${diffDays} days`;
}

function UsageBar({ usage }: { usage: UsageSummary }) {
  const isUnlimited = usage.limit === -1;
  const percentage =
    isUnlimited || usage.limit <= 0 ? 0 : Math.min((usage.current / usage.limit) * 100, 100);
  const isAtLimit = !isUnlimited && usage.limit > 0 && usage.current >= usage.limit;

  return (
    <div className="border-border bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{usage.label}</h3>
        <span className="text-muted-foreground text-sm">
          {isUnlimited ? 'Unlimited' : `${usage.current} / ${usage.limit}`}
        </span>
      </div>

      {!isUnlimited && (
        <>
          <div className="bg-muted mt-3 h-2.5 w-full overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all ${
                isAtLimit ? 'bg-destructive' : percentage >= 80 ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
            <span>
              {isAtLimit
                ? 'Limit reached'
                : `${usage.limit - usage.current} remaining ${formatWindow(usage.window)}`}
            </span>
            <span>Resets in {formatResetsAt(usage.resetsAt)}</span>
          </div>
        </>
      )}

      {isUnlimited && (
        <p className="text-muted-foreground mt-2 text-xs">No limit on your current plan.</p>
      )}
    </div>
  );
}

export default async function UsagePage() {
  const user = await requireCurrentUser();
  const [usage, plan] = await Promise.all([getAllUsageLimits(user.id), getUserPlan(user.id)]);

  return (
    <div className="animate-fade-in mx-auto max-w-2xl px-6 py-10">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/settings/billing">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Billing
        </Link>
      </Button>

      <h1 className="text-2xl font-bold tracking-tight">Usage</h1>
      <p className="text-muted-foreground mt-1">
        Track your resource consumption{plan ? ` on the ${plan.planName} plan` : ''}.
      </p>

      <div className="mt-8 space-y-4">
        {usage.map((u) => (
          <UsageBar key={u.feature} usage={u} />
        ))}
      </div>

      {usage.some((u) => u.limit !== -1 && u.current >= u.limit) && (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="font-medium text-amber-300">You&apos;ve hit one or more limits.</p>
          <p className="mt-1 text-sm text-amber-300/80">
            Upgrade your plan for higher limits and more features.
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href="/pricing">Upgrade Plan</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
