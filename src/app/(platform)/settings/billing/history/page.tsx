import type { Metadata } from 'next';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { getUserSubscriptionHistory } from '@/lib/services/subscriptions/subscriptions.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Subscription History' };

const EVENT_CONFIG: Record<string, { label: string; icon: typeof PlusCircle; className: string }> =
  {
    created: { label: 'Subscribed', icon: PlusCircle, className: 'text-green-500 bg-green-500/10' },
    upgraded: { label: 'Upgraded', icon: ArrowUpCircle, className: 'text-blue-500 bg-blue-500/10' },
    downgraded: {
      label: 'Downgraded',
      icon: ArrowDownCircle,
      className: 'text-amber-500 bg-amber-500/10',
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      className: 'text-destructive bg-destructive/10',
    },
    reactivated: {
      label: 'Reactivated',
      icon: RefreshCw,
      className: 'text-green-500 bg-green-500/10',
    },
    renewed: { label: 'Renewed', icon: CreditCard, className: 'text-green-500 bg-green-500/10' },
    payment_failed: {
      label: 'Payment Failed',
      icon: AlertTriangle,
      className: 'text-destructive bg-destructive/10',
    },
  };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function SubscriptionHistoryPage() {
  const user = await requireCurrentUser();
  const events = await getUserSubscriptionHistory(user.id);

  return (
    <div className="animate-fade-in mx-auto max-w-2xl px-6 py-10">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/settings/billing">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Billing
        </Link>
      </Button>

      <h1 className="text-2xl font-bold tracking-tight">Subscription History</h1>
      <p className="text-muted-foreground mt-1">A timeline of changes to your subscription.</p>

      <div className="mt-8">
        {events.length === 0 ? (
          <div className="border-border bg-card rounded-xl border p-8 text-center">
            <p className="text-muted-foreground">No subscription events yet.</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Events will appear here when your subscription changes.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="bg-border absolute top-2 bottom-2 left-[19px] w-px" />

            <div className="space-y-0">
              {events.map((event) => {
                const config = EVENT_CONFIG[event.type] ?? {
                  label: event.type,
                  icon: CreditCard,
                  className: 'text-muted-foreground bg-muted',
                };
                const Icon = config.icon;

                return (
                  <div key={event.id} className="relative flex gap-4 pb-6">
                    {/* Timeline dot */}
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.className}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-medium">{config.label}</p>
                        <time className="text-muted-foreground text-xs">
                          {formatDate(event.createdAt)}
                        </time>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-sm">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
