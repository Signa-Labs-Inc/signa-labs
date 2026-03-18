import { NextRequest } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/services/notifications/notifications.service';
import { ValidationError } from '@/lib/utils/errors';

export async function POST(req: NextRequest) {
  try {
    const user = await requireCurrentUser();

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const notificationId = typeof body.notificationId === 'string' ? body.notificationId : null;
    const all = body.all === true;

    if (!notificationId && !all) {
      throw new ValidationError('Provide either notificationId or { all: true }');
    }

    // Validate UUID format to prevent invalid DB queries
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (notificationId && !UUID_RE.test(notificationId)) {
      throw new ValidationError('Invalid notification ID format');
    }

    if (all) {
      const count = await markAllNotificationsRead(user.id);
      return Response.json({ marked: count });
    }

    const updated = await markNotificationRead(notificationId!, user.id);
    return Response.json({ success: !!updated });
  } catch (error) {
    return handleError(error);
  }
}
