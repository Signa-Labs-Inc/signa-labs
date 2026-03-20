import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { NotFoundError, ValidationError } from '@/lib/utils/errors';
import {
  updatePlan,
  type UpdatePlanParams,
} from '@/lib/services/subscriptions/subscriptions.writer';
import { validatePlanFeatures } from '@/lib/services/subscriptions/subscriptions.service';
import { revalidateTag } from 'next/cache';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    await requireAdmin();

    const { planId } = await params;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: { message: 'Invalid JSON' } }, { status: 400 });
    }

    // Reject unknown fields to prevent accidental data leaks
    const ALLOWED_FIELDS = new Set([
      'features',
      'displayFeatures',
      'description',
      'name',
      'isActive',
    ]);
    const unknownFields = Object.keys(body).filter((k) => !ALLOWED_FIELDS.has(k));
    if (unknownFields.length > 0) {
      throw new ValidationError(`Unknown fields: ${unknownFields.join(', ')}`);
    }

    const { features, displayFeatures, description, name, isActive } = body;

    const set: UpdatePlanParams = {};

    if (features !== undefined) {
      set.features = validatePlanFeatures(features);
    }

    if (displayFeatures !== undefined) {
      if (
        !Array.isArray(displayFeatures) ||
        !displayFeatures.every((f: unknown) => typeof f === 'string')
      ) {
        throw new ValidationError('displayFeatures must be an array of strings');
      }
      set.displayFeatures = displayFeatures;
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== 'string') {
        throw new ValidationError('description must be a string or null');
      }
      set.description = typeof description === 'string' ? description.trim() || null : null;
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new ValidationError('name must be a non-empty string');
      }
      set.name = name.trim();
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        throw new ValidationError('isActive must be a boolean');
      }
      // Deactivating hides the plan from pricing/checkout for new users.
      // Existing subscribers are unaffected — their subscriptions, rate limits,
      // and billing all reference the plan directly and don't check isActive.
      set.isActive = isActive;
    }

    if (Object.keys(set).length === 0) {
      throw new ValidationError('At least one field must be provided to update');
    }

    const updated = await updatePlan(planId, set);

    if (!updated) {
      throw new NotFoundError('Plan', planId);
    }

    // Revalidate cached pricing data when features or active status change
    if (
      set.features !== undefined ||
      set.isActive !== undefined ||
      set.displayFeatures !== undefined
    ) {
      revalidateTag('stripe-prices', 'default');
    }

    return Response.json({ plan: updated });
  } catch (error) {
    return handleError(error);
  }
}
