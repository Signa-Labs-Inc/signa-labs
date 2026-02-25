import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../users';

export const userLearningStats = pgTable('user_learning_stats', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  totalExercisesCompleted: integer('total_exercises_completed').notNull().default(0),
  totalExercisesAttempted: integer('total_exercises_attempted').notNull().default(0),
  totalTimeSpentSeconds: integer('total_time_spent_seconds').notNull().default(0),
  currentStreakDays: integer('current_streak_days').notNull().default(0),
  longestStreakDays: integer('longest_streak_days').notNull().default(0),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
