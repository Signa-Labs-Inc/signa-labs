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
    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
      <div
        className={`h-full rounded-full transition-all ${
          isAtLimit ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : 'bg-primary'
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
    <div className="border-border bg-card/50 rounded-xl border backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Crown className="text-primary h-4 w-4" />
          <span className="text-sm font-semibold">{planName} Plan</span>
        </div>
        <Link
          href="/settings/billing/usage"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
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
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{u.label}</span>
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
        <div className="border-border border-t px-5 py-3">
          <Link href="/pricing" className="group flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-muted-foreground group-hover:text-foreground text-xs transition-colors">
                {atAnyLimit ? 'Limit reached — upgrade for more' : 'Unlock higher limits with Pro'}
              </span>
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-foreground h-3 w-3 transition-colors" />
          </Link>
        </div>
      )}
    </div>
  );
}
