import { sql } from 'drizzle-orm';
import { jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestamps, softDelete } from '../../../util/timestamps';
import { index } from 'drizzle-orm/pg-core';

export const organizations = pgTable(
  'organizations',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    metadata: jsonb().default({}),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    index('organizations_slug_idx')
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
  ]
);
