import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { organizations } from '../organizations';
import { softDelete, timestamps } from '../../../util/timestamps';

export const users = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    clerkId: text('clerk_id').notNull().unique(),
    email: text().unique().notNull(),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    role: text().notNull().default('learner').$type<'learner' | 'admin' | 'super_admin'>(),
    orgId: uuid('org_id').references(() => organizations.id),
    stripeCustomerId: text('stripe_customer_id').unique(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    check('users_role_check', sql`${table.role} IN ('learner', 'admin', 'super_admin')`),
    index('idx_users_clerk').on(table.clerkId),
    index('idx_users_active')
      .on(table.email)
      .where(sql`${table.deletedAt} IS NULL`),
    index('idx_users_org').on(table.orgId),
    index('idx_users_stripe').on(table.stripeCustomerId),
  ]
);
