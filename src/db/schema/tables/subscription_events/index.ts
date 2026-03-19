import { check, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../users';
import { subscriptions } from '../subscriptions';
import { sql } from 'drizzle-orm';

export const subscriptionEvents = pgTable(
  'subscription_events',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
    type: text().notNull(),
    description: text().notNull(),
    metadata: text(), // JSON string for extra context (old plan, new plan, etc.)
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'subscription_events_type_check',
      sql`${table.type} IN ('created', 'upgraded', 'downgraded', 'cancelled', 'reactivated', 'renewed', 'payment_failed')`
    ),
    index('idx_subscription_events_user').on(table.userId),
    index('idx_subscription_events_sub').on(table.subscriptionId),
    index('idx_subscription_events_created').on(table.createdAt),
  ]
);
