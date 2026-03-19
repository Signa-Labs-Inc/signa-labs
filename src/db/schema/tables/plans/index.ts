import { boolean, integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { timestamps } from '../../../util/timestamps';

export const plans = pgTable('plans', {
  id: text().primaryKey(), // 'free', 'pro', 'enterprise'
  name: text().notNull(),
  description: text(),
  features: jsonb().notNull().default({}),
  displayFeatures: text('display_features')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  stripeProductId: text('stripe_product_id').unique(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
});
