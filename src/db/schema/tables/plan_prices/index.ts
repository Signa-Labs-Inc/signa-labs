import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { plans } from '../plans';
import { sql } from 'drizzle-orm/sql/sql';
export const planPrices = pgTable(
  'plan_prices',
  {
    id: uuid().primaryKey().defaultRandom(),
    planId: text('plan_id')
      .notNull()
      .references(() => plans.id),
    stripePriceId: text('stripe_price_id').notNull().unique(),
    currency: text().notNull().default('usd'),
    interval: text().notNull().default('month'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('plan_prices_interval_check', sql`${table.interval} IN ('month', 'year', 'lifetime')`),
    uniqueIndex('idx_plan_prices_id_plan').on(table.id, table.planId),
    index('idx_plan_prices_plan').on(table.planId),
    index('idx_plan_prices_active')
      .on(table.planId)
      .where(sql`${table.isActive} = true`),
  ]
);
