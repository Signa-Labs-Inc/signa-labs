import { db } from '@/index';
import { notifications } from '@/db/schema/tables';
import { and, eq, gte, isNull, sql } from 'drizzle-orm';

export async function getRecentNotificationsByUserId(userId: string, limit = 20, offset = 0) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(sql`${notifications.createdAt} DESC`)
    .limit(limit)
    .offset(offset);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return result?.count ?? 0;
}

export async function hasRecentUsageAlert(
  userId: string,
  feature: string,
  since: Date
): Promise<boolean> {
  const [row] = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, 'usage_alert'),
        eq(notifications.channel, 'in_app'),
        gte(notifications.createdAt, since),
        sql`${notifications.metadata}->>'feature' = ${feature}`
      )
    )
    .limit(1);
  return !!row;
}
