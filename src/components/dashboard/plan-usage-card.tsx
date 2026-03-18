import Link from 'next/link';
import { ArrowRight, Crown, Zap } from 'lucide-react';
import type { UsageSummary } from '@/lib/services/subscriptions/subscriptions.types';

type PlanUsageCardProps = {
  planName: string;
  usage: UsageSummary[];
};

function MiniBar({ current, limit }: { current: number; limit: number }) {
  if (limit === -1) return null;
  const pct = Math.min((current / limit) * 100, 100);
  const isAtLimit = current >= limit;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-all ${
          isAtLimit
            ? 'bg-destructive'
            : pct >= 80
              ? 'bg-amber-500'
              : 'bg-primary'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PlanUsageCard({ planName, usage }: PlanUsageCardProps) {
  const isFree = planName === 'Free';
  const hasLimits = usage.some((u) => u.limit !== -1);
  const atAnyLimit = usage.some((u) => u.limit !== -1 && u.current >= u.limit);

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{planName} Plan</span>
        </div>
        <Link
          href="/settings/billing/usage"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Usage bars */}
      {hasLimits && (
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 px-5 pb-4">
          {usage
            .filter((u) => u.limit !== -1)
            .map((u) => (
              <div key={u.feature}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{u.label}</span>
                  <span className="text-xs font-medium tabular-nums">
                    {u.current}/{u.limit}
                  </span>
                </div>
                <MiniBar current={u.current} limit={u.limit} />
              </div>
            ))}
        </div>
      )}

      {/* Upgrade nudge for free users */}
      {isFree && (
        <div className="border-t border-border px-5 py-3">
          <Link
            href="/pricing"
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {atAnyLimit ? 'Limit reached — upgrade for more' : 'Unlock higher limits with Pro'}
              </span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        </div>
      )}
    </div>
  );
}
