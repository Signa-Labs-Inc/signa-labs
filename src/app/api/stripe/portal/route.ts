import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { createBillingPortalSession } from '@/lib/services/subscriptions/subscriptions.service';
import { handleError } from '@/lib/utils/api.handler-errors';

export async function POST() {
  try {
    const user = await requireCurrentUser();
    const url = await createBillingPortalSession(user.id, user.email);
    return Response.json({ url });
  } catch (error) {
    return handleError(error);
  }
}
