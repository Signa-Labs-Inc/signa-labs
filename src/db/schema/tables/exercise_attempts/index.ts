import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  check,
  index,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from '../users';
import { exercises } from '../exercises';
import { sql } from 'drizzle-orm';
export const exerciseAttempts = pgTable(
  'exercise_attempts',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id),
    status: text().notNull().default('in_progress'),
    hintsRevealed: integer('hints_revealed').notNull().default(0),
    solutionViewed: boolean('solution_viewed').notNull().default(false),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    check(
      'exercise_attempts_status_check',
      sql`${table.status} IN ('in_progress', 'completed', 'abandoned')`
    ),
    check('exercise_attempts_nonnegative_hints', sql`${table.hintsRevealed} >= 0`),
    check('exercise_attempts_nonnegative_time', sql`${table.timeSpentSeconds} >= 0`),
    check(
      'exercise_attempts_completed_at_required',
      sql`${table.status} != 'completed' OR ${table.completedAt} IS NOT NULL`
    ),
    index('idx_attempts_user').on(table.userId),
    index('idx_attempts_exercise').on(table.exerciseId),
    index('idx_attempts_active')
      .on(table.userId)
      .where(sql`${table.status} = 'in_progress'`),
    index('idx_attempts_user_exercise').on(table.userId, table.exerciseId),
    uniqueIndex('idx_attempts_id_user').on(table.id, table.userId),
  ]
);
