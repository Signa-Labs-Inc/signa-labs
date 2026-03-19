import { NextRequest } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { getUserNotifications, getUnreadNotificationCount } from '@/lib/services/notifications/notifications.service';

export async function GET(req: NextRequest) {
  try {
    const user = await requireCurrentUser();

    const url = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 1), 50);
    const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10) || 0, 0);

    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(user.id, limit, offset),
      getUnreadNotificationCount(user.id),
    ]);

    return Response.json({ notifications, unreadCount });
  } catch (error) {
    return handleError(error);
  }
}
