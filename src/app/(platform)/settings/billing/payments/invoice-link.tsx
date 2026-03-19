'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function InvoiceLink({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const newWindow = window.open('about:blank', '_blank', 'noopener,noreferrer');
    try {
      const res = await fetch(`/api/stripe/invoices/${invoiceId}`);
      if (!res.ok) {
        newWindow?.close();
        toast.error('Failed to load invoice');
        return;
      }
      const data = await res.json();
      if (data.url) {
        if (newWindow) {
          newWindow.location.href = data.url;
        } else {
          window.open(data.url, '_blank', 'noopener,noreferrer');
        }
      } else {
        newWindow?.close();
      }
    } catch {
      newWindow?.close();
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors disabled:opacity-50"
      title="View invoice"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileText className="h-3.5 w-3.5" />
      )}
      Invoice
    </button>
  );
}
