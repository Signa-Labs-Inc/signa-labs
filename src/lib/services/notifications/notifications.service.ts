import * as reader from './notifications.reader';
import * as writer from './notifications.writer';
import type { UserNotification, NotificationChannel, NotificationStatus } from './notifications.types';

export async function getUserNotifications(userId: string, limit = 20, offset = 0): Promise<UserNotification[]> {
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

  // Don't alert for unlimited features
  if (limit === -1) return false;

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
