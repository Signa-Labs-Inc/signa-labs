import { pgTable, uuid, text, integer, timestamp, jsonb, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../users';

export const learningPaths = pgTable(
  'learning_paths',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    title: text().notNull(),
    userPrompt: text('user_prompt').notNull(),
    startingLevel: text('starting_level').notNull(),
    language: text().notNull(),
    detectedFramework: text('detected_framework'),
    plan: jsonb().notNull(),
    status: text().notNull().default('active'),
    currentMilestoneIndex: integer('current_milestone_index').notNull().default(0),
    totalMilestones: integer('total_milestones').notNull(),
    totalExercisesCompleted: integer('total_exercises_completed').notNull().default(0),
    estimatedTotalExercises: integer('estimated_total_exercises').notNull(),
    llmModel: text('llm_model').notNull(),
    planGenerationTimeMs: integer('plan_generation_time_ms'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    check(
      'learning_paths_status_check',
      sql`${table.status} IN ('active', 'completed', 'paused', 'abandoned')`
    ),
    check(
      'learning_paths_starting_level_check',
      sql`${table.startingLevel} IN ('beginner', 'some_experience', 'intermediate', 'advanced')`
    ),
    check(
      'learning_paths_language_check',
      sql`${table.language} IN ('python', 'typescript', 'javascript', 'ruby', 'go', 'sql')`
    ),
    index('idx_learning_paths_user').on(table.userId),
    index('idx_learning_paths_active')
      .on(table.userId)
      .where(sql`${table.status} = 'active'`),
  ]
);
