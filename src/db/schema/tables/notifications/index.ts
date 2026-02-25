import { sql } from 'drizzle-orm';
import { timestamp, index, pgTable, text, uuid, check, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../users';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: text().notNull(),
    channel: text().notNull().default('email'),
    subject: text(),
    body: text(),
    metadata: jsonb().default({}),
    status: text().notNull().default('pending'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('notifications_channel_check', sql`${table.channel} IN ('email', 'push', 'in_app')`),
    check(
      'notifications_status_check',
      sql`${table.status} IN ('pending', 'sent', 'failed', 'bounced')`
    ),
    index('idx_notifications_user').on(table.userId),
    index('idx_notifications_pending')
      .on(table.createdAt)
      .where(sql`${table.status} = 'pending'`),
  ]
);
