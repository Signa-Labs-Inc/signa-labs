import { sql } from 'drizzle-orm';
import {
  integer,
  timestamp,
  primaryKey,
  index,
  text,
  uuid,
  check,
  pgTable,
  jsonb,
} from 'drizzle-orm/pg-core';
import { users } from '../users';

export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    key: text().notNull(),
    scope: text().notNull(),
    userId: uuid('user_id').references(() => users.id),
    status: text().notNull().default('completed'),
    responseStatus: integer('response_status'),
    responseBody: jsonb('response_body'),
    metadata: jsonb().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.key, table.scope] }),
    check(
      'idempotency_keys_status_check',
      sql`${table.status} IN ('processing', 'completed', 'failed')`
    ),
    index('idx_idempotency_expires').on(table.expiresAt),
  ]
);
