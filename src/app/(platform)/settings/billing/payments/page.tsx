import type { Metadata } from 'next';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { getUserPaymentHistory } from '@/lib/services/subscriptions/subscriptions.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { PaymentRecord } from '@/lib/services/subscriptions/subscriptions.types';
import { InvoiceLink } from './invoice-link';

export const metadata: Metadata = { title: 'Payment History' };

function formatAmount(amountCents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: { status: PaymentRecord['status'] }) {
  const styles = {
    succeeded: 'bg-green-500/10 text-green-500',
    failed: 'bg-destructive/10 text-destructive',
    refunded: 'bg-amber-500/10 text-amber-500',
    partial_refund: 'bg-amber-500/10 text-amber-500',
  };

  const labels = {
    succeeded: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    partial_refund: 'Partial Refund',
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default async function PaymentsPage() {
  const user = await requireCurrentUser();
  const payments = await getUserPaymentHistory(user.id);

  return (
    <div className="animate-fade-in mx-auto max-w-2xl px-6 py-10">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/settings/billing">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Billing
        </Link>
      </Button>

      <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
      <p className="text-muted-foreground mt-1">
        View your past invoices and charges.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-card">
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No payments found.</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Payments will appear here after your first subscription charge.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {payment.description ?? 'Payment'}
                    </p>
                    <StatusBadge status={payment.status} />
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {formatDate(payment.paidAt ?? payment.createdAt)}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <p className="font-medium">
                    {formatAmount(payment.amountCents, payment.currency)}
                  </p>
                  {payment.stripeInvoiceId && payment.status === 'succeeded' && (
                    <InvoiceLink invoiceId={payment.stripeInvoiceId} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
