import { index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from '../users';
import { subscriptions } from '../subscriptions';
import { sql } from 'drizzle-orm/sql/sql';

export const subscriptionSeats = pgTable(
  'subscription_seats',
  {
    id: uuid().primaryKey().defaultRandom(),
    subscriptionId: uuid('subscription_id')
      .notNull()
      .references(() => subscriptions.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    assignedBy: uuid('assigned_by').references(() => users.id),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
    removedAt: timestamp('removed_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('idx_seats_unique').on(table.subscriptionId, table.userId),
    index('idx_seats_subscription').on(table.subscriptionId),
    index('idx_seats_active')
      .on(table.subscriptionId)
      .where(sql`${table.removedAt} IS NULL`),
    index('idx_seats_user').on(table.userId),
  ]
);
