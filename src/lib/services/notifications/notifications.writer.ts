import { db } from '@/index';
import { notifications } from '@/db/schema/tables';
import { and, eq, isNull } from 'drizzle-orm';
import type { CreateNotificationParams } from './notifications.types';

export async function insertNotification(params: CreateNotificationParams) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId: params.userId,
      type: params.type,
      channel: params.channel,
      subject: params.subject,
      body: params.body,
      metadata: params.metadata ?? {},
      status: 'sent',
      sentAt: new Date(),
    })
    .returning();
  return notification ?? null;
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
        isNull(notifications.readAt)
      )
    )
    .returning();
  return updated ?? null;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
    .returning({ id: notifications.id });
  return result.length;
}
