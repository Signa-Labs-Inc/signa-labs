import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { getUserPlan } from '@/lib/services/subscriptions/subscriptions.service';
import { handleError } from '@/lib/utils/api.handler-errors';

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const plan = await getUserPlan(user.id);
    return Response.json({ plan });
  } catch (error) {
    return handleError(error);
  }
}
