import { boolean, integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { timestamps } from '../../../util/timestamps';

export const plans = pgTable('plans', {
  id: text().primaryKey(), // 'free', 'pro', 'enterprise'
  name: text().notNull(),
  description: text(),
  features: jsonb().notNull().default({}),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
});
