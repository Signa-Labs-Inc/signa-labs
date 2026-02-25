import { boolean, integer, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { exerciseAttempts } from '../exercise_attempts';
import { users } from '../users';

export const exerciseSubmissions = pgTable(
  'exercise_submissions',
  {
    id: uuid().primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => exerciseAttempts.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    testsPassed: integer('tests_passed').notNull().default(0),
    testsFailed: integer('tests_failed').notNull().default(0),
    testsTotal: integer('tests_total').notNull().default(0),
    testOutput: text('test_output'),
    executionTimeMs: integer('execution_time_ms'),
    isPassing: boolean('is_passing').notNull().default(false),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    // No updatedAt or deletedAt — submissions are immutable
  },
  (table) => [
    index('idx_submissions_attempt').on(table.attemptId),
    index('idx_submissions_user').on(table.userId),
  ]
);
