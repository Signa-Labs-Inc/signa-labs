import { pgTable, uuid, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { learningPaths } from '../learning_paths';
import { pathMilestones } from '../path_milestones';
import { exercises } from '../exercises';

export const pathExercises = pgTable(
  'path_exercises',
  {
    id: uuid().primaryKey().defaultRandom(),
    pathId: uuid('path_id')
      .notNull()
      .references(() => learningPaths.id, { onDelete: 'cascade' }),
    milestoneId: uuid('milestone_id')
      .notNull()
      .references(() => pathMilestones.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id),
    exerciseIndex: integer('exercise_index').notNull(),
    generationContext: jsonb('generation_context').notNull().default({}),
    isCompleted: boolean('is_completed').notNull().default(false),
    testsPassed: integer('tests_passed'),
    testsTotal: integer('tests_total'),
    timeSpentSeconds: integer('time_spent_seconds'),
    hintsUsed: integer('hints_used'),
    attemptsCount: integer('attempts_count').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_path_exercises_path').on(table.pathId),
    index('idx_path_exercises_milestone').on(table.milestoneId),
    index('idx_path_exercises_exercise').on(table.exerciseId),
  ]
);
