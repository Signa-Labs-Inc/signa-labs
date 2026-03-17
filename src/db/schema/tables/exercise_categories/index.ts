import { pgTable, uuid, text, integer, boolean, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { timestamps } from '../../../util/timestamps';

export const exerciseCategories = pgTable(
  'exercise_categories',
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().unique().notNull(),
    label: text().notNull(),
    description: text().notNull(),
    icon: text().notNull(),
    tags: text().array().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index('idx_exercise_categories_active')
      .on(table.sortOrder)
      .where(sql`${table.isActive} = true`),
  ]
);
