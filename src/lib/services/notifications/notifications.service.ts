import * as reader from './notifications.reader';
import * as writer from './notifications.writer';
import { NotificationError } from '@/lib/utils/errors';
import type {
  UserNotification,
  NotificationChannel,
  NotificationStatus,
  CreateInAppNotificationParams,
} from './notifications.types';

export async function getUserNotifications(
  userId: string,
  limit = 20,
  offset = 0
): Promise<UserNotification[]> {
  const rows = await reader.getRecentNotificationsByUserId(userId, limit, offset);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    channel: r.channel as NotificationChannel,
    subject: r.subject,
    body: r.body,
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
    status: r.status as NotificationStatus,
    sentAt: r.sentAt?.toISOString() ?? null,
    readAt: r.readAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return reader.getUnreadCount(userId);
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return writer.markNotificationRead(notificationId, userId);
}

export async function markAllNotificationsRead(userId: string) {
  return writer.markAllNotificationsRead(userId);
}

/**
 * Create an in-app notification for a user.
 * Throws NotificationError if the notification could not be created.
 */
export async function createInAppNotification(
  params: CreateInAppNotificationParams
): Promise<UserNotification> {
  const row = await writer.insertNotification({
    userId: params.userId,
    type: params.type,
    channel: 'in_app',
    subject: params.subject,
    body: params.body,
    metadata: params.metadata,
  });

  if (!row) {
    throw new NotificationError('Failed to create notification');
  }

  return {
    id: row.id,
    type: row.type,
    channel: row.channel as NotificationChannel,
    subject: row.subject,
    body: row.body,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    status: row.status as NotificationStatus,
    sentAt: row.sentAt?.toISOString() ?? null,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Creates a usage alert notification if one hasn't been sent recently
 * for this feature (within the current rate-limit window).
 */
export async function createUsageAlertIfNeeded(params: {
  userId: string;
  feature: string;
  label: string;
  current: number;
  limit: number;
  windowStart: Date;
}): Promise<boolean> {
  const { userId, feature, label, current, limit, windowStart } = params;

  // Don't alert for unlimited or zero-allowance features
  if (limit <= 0) return false;

  const percentage = (current / limit) * 100;

  // Only alert at 80%+ usage
  if (percentage < 80) return false;

  // Check if we already sent an alert for this feature in the current window
  const alreadySent = await reader.hasRecentUsageAlert(userId, feature, windowStart);
  if (alreadySent) return false;

  const isAtLimit = current >= limit;
  const subject = isAtLimit
    ? `${label} limit reached`
    : `${label} usage at ${Math.round(percentage)}%`;
  const body = isAtLimit
    ? `You've used all ${limit} ${label.toLowerCase()} for this period. Upgrade your plan for higher limits.`
    : `You've used ${current} of ${limit} ${label.toLowerCase()}. Consider upgrading before you hit your limit.`;

  await writer.insertNotification({
    userId,
    type: 'usage_alert',
    channel: 'in_app',
    subject,
    body,
    metadata: { feature, current, limit, percentage: Math.round(percentage) },
  });

  return true;
}
