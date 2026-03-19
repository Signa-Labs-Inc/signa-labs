import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { getAllPlansWithPrices } from '@/lib/services/subscriptions/subscriptions.reader';
import { createPlanWithStripeProducts, validatePlanFeatures } from '@/lib/services/subscriptions/subscriptions.service';
import { ValidationError } from '@/lib/utils/errors';

export async function GET() {
  try {
    await requireAdmin();
    const plans = await getAllPlansWithPrices();
    return Response.json({ plans });
  } catch (error) {
    return handleError(error);
  }
}

const PLAN_ID_REGEX = /^[a-z][a-z0-9_]{1,48}[a-z0-9]$/;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    let body: {
      id?: string;
      name?: string;
      description?: string;
      features?: Record<string, unknown>;
      sortOrder?: number;
      monthlyPriceCents?: number;
      yearlyPriceCents?: number;
      currency?: string;
    };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: { message: 'Invalid JSON' } }, { status: 400 });
    }

    if (!body.id || typeof body.id !== 'string') {
      throw new ValidationError('Plan ID is required');
    }

    if (!PLAN_ID_REGEX.test(body.id)) {
      throw new ValidationError(
        'Plan ID must be 3-50 lowercase characters, starting with a letter, using only letters, numbers, and underscores'
      );
    }

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new ValidationError('Plan name is required');
    }

    // Build pricing param only if any price field is provided
    const hasPricing =
      body.monthlyPriceCents !== undefined ||
      body.yearlyPriceCents !== undefined ||
      body.currency !== undefined;

    let pricing: { currency: string; monthlyPriceCents?: number; yearlyPriceCents?: number } | undefined;

    if (hasPricing) {
      if (!body.currency || typeof body.currency !== 'string') {
        throw new ValidationError('Currency is required when setting prices');
      }

      pricing = {
        currency: body.currency.toLowerCase().trim(),
        monthlyPriceCents: body.monthlyPriceCents,
        yearlyPriceCents: body.yearlyPriceCents,
      };
    }

    const plan = await createPlanWithStripeProducts({
      id: body.id,
      name: body.name.trim(),
      description: body.description?.trim(),
      features: body.features
        ? validatePlanFeatures(body.features)
        : {
            exercises: { limit: 0, window: 'day' },
            paths: { limit: 0, window: 'day' },
            aiGenerations: { limit: 0, window: 'day' },
            submissions: { limit: 0, window: 'day' },
          },
      sortOrder: body.sortOrder ?? 0,
      pricing,
    });

    return Response.json({ plan }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
