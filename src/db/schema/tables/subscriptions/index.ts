import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../users';
import { organizations } from '../organizations';
import { plans } from '../plans';
import { planPrices } from '../plan_prices';
import { timestamps } from '../../../util/timestamps';
import { sql } from 'drizzle-orm/sql/sql';

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid().primaryKey().defaultRandom(),

    // Owner: exactly one must be set
    userId: uuid('user_id').references(() => users.id),
    orgId: uuid('org_id').references(() => organizations.id),
    ownerType: text('owner_type').notNull(),

    // Plan and pricing
    planId: text('plan_id').notNull(),
    planPriceId: uuid('plan_price_id').notNull(),

    // Stripe
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    stripeCustomerId: text('stripe_customer_id').notNull(),

    // Status
    status: text().notNull().default('active'),

    // Org seat management
    totalSeats: integer('total_seats'),

    // Billing period
    currentPeriodStart: timestamp('current_period_start', {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    trialEnd: timestamp('trial_end', { withTimezone: true }),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    canceledAt: timestamp('canceled_at', { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    // Owner type check
    check('subscriptions_owner_type_check', sql`${table.ownerType} IN ('user', 'org')`),
    // Status check
    check(
      'subscriptions_status_check',
      sql`${table.status} IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused', 'incomplete')`
    ),
    // Enforce: exactly one owner must be set
    check(
      'subscriptions_owner_check',
      sql`(${table.ownerType} = 'user' AND ${table.userId} IS NOT NULL AND ${table.orgId} IS NULL) OR (${table.ownerType} = 'org' AND ${table.orgId} IS NOT NULL AND ${table.userId} IS NULL)`
    ),
    // Enforce: org subs must have seats, user subs must not
    check(
      'subscriptions_seats_check',
      sql`(${table.ownerType} = 'user' AND ${table.totalSeats} IS NULL) OR (${table.ownerType} = 'org' AND ${table.totalSeats} IS NOT NULL AND ${table.totalSeats} > 0)`
    ),
    // One active subscription per user
    uniqueIndex('idx_one_active_user_sub')
      .on(table.userId)
      .where(
        sql`${table.userId} IS NOT NULL AND ${table.status} IN ('active', 'trialing', 'past_due')`
      ),
    // One active subscription per org
    uniqueIndex('idx_one_active_org_sub')
      .on(table.orgId)
      .where(
        sql`${table.orgId} IS NOT NULL AND ${table.status} IN ('active', 'trialing', 'past_due')`
      ),
    // FK: planId must exist in plans
    foreignKey({
      columns: [table.planId],
      foreignColumns: [plans.id],
      name: 'fk_subscriptions_plan',
    }),
    // Composite FK: ensures planPriceId belongs to planId
    foreignKey({
      columns: [table.planPriceId, table.planId],
      foreignColumns: [planPrices.id, planPrices.planId],
      name: 'fk_subscriptions_price_plan',
    }),
    index('idx_subscriptions_user').on(table.userId),
    index('idx_subscriptions_org').on(table.orgId),
    index('idx_subscriptions_status').on(table.status),
  ]
);
