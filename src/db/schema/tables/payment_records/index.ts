import { subscriptions } from '../subscriptions';
import { check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../users';
import { sql } from 'drizzle-orm';

export const paymentRecords = pgTable(
  'payment_records',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
    stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
    stripeInvoiceId: text('stripe_invoice_id'),
    amountCents: integer('amount_cents').notNull(),
    currency: text().notNull().default('usd'),
    status: text().notNull(),
    description: text(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'payment_records_status_check',
      sql`${table.status} IN ('succeeded', 'failed', 'refunded', 'partial_refund')`
    ),
    index('idx_payment_records_user').on(table.userId),
    index('idx_payment_records_subscription').on(table.subscriptionId),
    index('idx_payment_records_status').on(table.status),
  ]
);
