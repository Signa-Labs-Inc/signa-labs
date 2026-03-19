import { NextRequest } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { stripe } from '@/lib/stripe/client';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { getStripeCustomerId } from '@/lib/services/users/users.reader';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const user = await requireCurrentUser();
    const { invoiceId } = await params;

    // Fetch invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);
    if (!invoice) {
      throw new NotFoundError('Invoice', invoiceId);
    }

    // Verify the invoice belongs to this user's Stripe customer
    const customerId = await getStripeCustomerId(user.id);
    const invoiceCustomerId =
      typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    if (!customerId || invoiceCustomerId !== customerId) {
      throw new ForbiddenError('You do not have access to this invoice');
    }

    const url = invoice.hosted_invoice_url;
    if (!url) {
      throw new NotFoundError('Invoice URL', invoiceId);
    }

    return Response.json({ url });
  } catch (error) {
    return handleError(error);
  }
}
