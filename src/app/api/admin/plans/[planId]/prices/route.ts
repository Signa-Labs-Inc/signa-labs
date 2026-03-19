import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { ValidationError } from '@/lib/utils/errors';
import { getPricesByPlanId } from '@/lib/services/subscriptions/subscriptions.reader';
import { insertPlanPrice } from '@/lib/services/subscriptions/subscriptions.writer';
import { stripe } from '@/lib/stripe/client';
import { revalidateTag } from 'next/cache';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    await requireAdmin();
    const { planId } = await params;

    const prices = await getPricesByPlanId(planId);

    // Enrich with Stripe amounts
    const enriched = await Promise.all(
      prices.map(async (p) => {
        let unitAmount: number | null = null;
        let currency = p.currency;
        if (p.stripePriceId && !p.stripePriceId.startsWith('PLACEHOLDER')) {
          try {
            const stripePrice = await stripe.prices.retrieve(p.stripePriceId);
            unitAmount = stripePrice.unit_amount ?? null;
            currency = stripePrice.currency;
          } catch {
            // Stripe price not found or invalid
          }
        }
        return { ...p, unitAmount, currency };
      })
    );

    return Response.json({ prices: enriched });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    await requireAdmin();
    const { planId } = await params;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: { message: 'Invalid JSON' } }, { status: 400 });
    }

    const stripePriceId = body.stripePriceId;
    const currency = typeof body.currency === 'string' ? body.currency : 'usd';
    const interval = typeof body.interval === 'string' ? body.interval : 'month';

    if (!stripePriceId || typeof stripePriceId !== 'string') {
      throw new ValidationError('stripePriceId is required');
    }

    if (!['month', 'year', 'lifetime'].includes(interval)) {
      throw new ValidationError('interval must be month, year, or lifetime');
    }

    // Validate the Stripe Price ID exists
    try {
      await stripe.prices.retrieve(stripePriceId);
    } catch {
      throw new ValidationError(`Invalid Stripe Price ID: ${stripePriceId}`);
    }

    const created = await insertPlanPrice({ planId, stripePriceId, currency, interval });

    revalidateTag('stripe-prices', 'default');

    return Response.json({ price: created }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
