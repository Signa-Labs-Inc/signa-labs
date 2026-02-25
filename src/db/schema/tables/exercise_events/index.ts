import { sql } from 'drizzle-orm';
import { check, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { exerciseAttempts } from '../exercise_attempts';
import { users } from '../users';
export const exerciseEvents = pgTable(
  'exercise_events',
  {
    id: uuid().primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => exerciseAttempts.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    eventType: text('event_type').notNull(),
    payload: jsonb().notNull().default({}),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    // No updatedAt or deletedAt — events are immutable
  },
  (table) => [
    check(
      'exercise_events_type_check',
      sql`${table.eventType} IN ('attempt_started', 'code_submitted', 'tests_run', 'tests_passed', 'tests_failed', 'hint_revealed', 'solution_viewed', 'attempt_completed', 'attempt_abandoned')`
    ),
    index('idx_events_attempt').on(table.attemptId),
    index('idx_events_user').on(table.userId),
    index('idx_events_type').on(table.eventType),
    index('idx_events_occurred').on(table.occurredAt),
  ]
);
