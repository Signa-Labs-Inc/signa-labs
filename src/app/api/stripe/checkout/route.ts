import { NextRequest } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { createCheckoutSession } from '@/lib/services/subscriptions/subscriptions.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { ValidationError } from '@/lib/utils/errors';

export async function POST(req: NextRequest) {
  try {
    const user = await requireCurrentUser();

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: { message: 'Invalid JSON' } }, { status: 400 });
    }

    const { planId, interval } = body;
    if (!planId || typeof planId !== 'string') {
      throw new ValidationError('planId is required');
    }
    if (interval !== 'month' && interval !== 'year') {
      throw new ValidationError('interval must be "month" or "year"');
    }

    const url = await createCheckoutSession(user.id, user.email, planId, interval);
    return Response.json({ url });
  } catch (error) {
    return handleError(error);
  }
}
