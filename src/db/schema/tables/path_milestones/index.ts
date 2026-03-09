import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { learningPaths } from '../learning_paths/';

export const pathMilestones = pgTable(
  'path_milestones',
  {
    id: uuid().primaryKey().defaultRandom(),
    pathId: uuid('path_id')
      .notNull()
      .references(() => learningPaths.id, { onDelete: 'cascade' }),
    milestoneIndex: integer('milestone_index').notNull(),
    title: text().notNull(),
    description: text().notNull(),
    skills: jsonb().notNull().default([]),
    skillGates: jsonb('skill_gates').notNull().default([]),
    topics: jsonb().notNull().default([]),
    targetDifficulty: text('target_difficulty').notNull(),
    minExercises: integer('min_exercises').notNull().default(3),
    maxExercises: integer('max_exercises').notNull().default(8),
    status: text().notNull().default('locked'),
    exercisesCompleted: integer('exercises_completed').notNull().default(0),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    check(
      'path_milestones_status_check',
      sql`${table.status} IN ('locked', 'active', 'completed')`
    ),
    check(
      'path_milestones_difficulty_check',
      sql`${table.targetDifficulty} IN ('beginner', 'easy', 'medium', 'hard', 'expert')`
    ),
    uniqueIndex('path_milestones_unique_index').on(table.pathId, table.milestoneIndex),
    index('idx_path_milestones_path').on(table.pathId),
  ]
);
