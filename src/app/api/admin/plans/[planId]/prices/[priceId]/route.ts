import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/utils/errors';
import { updatePlanPrice, deletePlanPrice } from '@/lib/services/subscriptions/subscriptions.writer';
import { countActiveSubscriptionsForPrice } from '@/lib/services/subscriptions/subscriptions.reader';
import { stripe } from '@/lib/stripe/client';
import { revalidateTag } from 'next/cache';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string; priceId: string }> }
) {
  try {
    await requireAdmin();
    const { planId, priceId } = await params;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: { message: 'Invalid JSON' } }, { status: 400 });
    }

    const { stripePriceId, isActive, interval } = body;

    const set: Record<string, unknown> = {};

    if (stripePriceId !== undefined) {
      if (typeof stripePriceId !== 'string') {
        throw new ValidationError('stripePriceId must be a string');
      }
      // Validate the new Stripe Price ID exists and is active
      try {
        await stripe.prices.retrieve(stripePriceId);
      } catch {
        throw new ValidationError(`Invalid Stripe Price ID: ${stripePriceId}`);
      }
      set.stripePriceId = stripePriceId;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        throw new ValidationError('isActive must be a boolean');
      }
      set.isActive = isActive;
    }

    if (interval !== undefined) {
      if (typeof interval !== 'string' || !['month', 'year', 'lifetime'].includes(interval)) {
        throw new ValidationError('interval must be month, year, or lifetime');
      }
      set.interval = interval;
    }

    if (Object.keys(set).length === 0) {
      throw new ValidationError('At least one field must be provided to update');
    }

    const updated = await updatePlanPrice(priceId, planId, set);

    if (!updated) {
      throw new NotFoundError('Price', priceId);
    }

    revalidateTag('stripe-prices', 'default');

    return Response.json({ price: updated });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string; priceId: string }> }
) {
  try {
    await requireAdmin();
    const { planId, priceId } = await params;

    // Guard: prevent deleting a price with active subscriptions
    const activeSubCount = await countActiveSubscriptionsForPrice(priceId);
    if (activeSubCount > 0) {
      throw new ConflictError(
        `Cannot delete price with ${activeSubCount} active subscription(s). ` +
        `Deactivate the price instead.`
      );
    }

    const deleted = await deletePlanPrice(priceId, planId);

    if (!deleted) {
      throw new NotFoundError('Price', priceId);
    }

    revalidateTag('stripe-prices', 'default');

    return Response.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
