import {
  pgTable,
  boolean,
  jsonb,
  uuid,
  text,
  timestamp,
  integer,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { promptTemplates } from '../prompt_templates';
import { exerciseEnvironments } from '../exercise_environments';
import { users } from '../users';
import { sql } from 'drizzle-orm';
import type {
  ExerciseDifficulty,
  ExerciseLanguage,
  ExerciseOrigin,
} from '@/lib/services/exercises/exercises.constants';
import type { LessonContent, SynthesisContent } from '@/lib/services/teaching/teaching.types';

export const exercises = pgTable(
  'exercises',
  {
    id: uuid().primaryKey().defaultRandom(),

    // Origin
    origin: text().$type<ExerciseOrigin>().notNull(),
    createdBy: uuid('created_by').references(() => users.id),
    userPrompt: text('user_prompt'),

    // Generation metadata
    promptTemplateId: uuid('prompt_template_id').references(() => promptTemplates.id),
    environmentId: uuid('environment_id')
      .notNull()
      .references(() => exerciseEnvironments.id),
    llmModel: text('llm_model').notNull(),
    llmParameters: jsonb('llm_parameters').notNull().default({}),
    generationTimeMs: integer('generation_time_ms'),

    // Content
    title: text().notNull(),
    description: text().notNull(),
    difficulty: text().$type<ExerciseDifficulty>().notNull().default('medium'),
    language: text().$type<ExerciseLanguage>().notNull(),

    // Learning content
    lessonContent: jsonb('lesson_content').$type<LessonContent>(),
    synthesisContent: jsonb('synthesis_content').$type<SynthesisContent>(),

    // Hints
    hints: jsonb().$type<string[]>().notNull().default([]),

    // Validation
    isValidated: boolean('is_validated').notNull().default(false),
    validationOutput: jsonb('validation_output'),

    // Metadata
    tags: text()
      .array()
      .default(sql`'{}'`),
    metadata: jsonb().default({}),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Origin check
    check('exercises_origin_check', sql`${table.origin} IN ('platform', 'user')`),
    // Difficulty check
    check(
      'exercises_difficulty_check',
      sql`${table.difficulty} IN ('beginner', 'easy', 'medium', 'hard', 'expert')`
    ),
    // Language check
    check(
      'exercises_language_check',
      sql`${table.language} IN ('python', 'typescript', 'javascript', 'ruby', 'go', 'sql')`
    ),
    // Origin consistency: platform exercises have no creator, user exercises must have one
    check(
      'exercises_origin_consistency_check',
      sql`(${table.origin} = 'platform' AND ${table.createdBy} IS NULL AND ${table.userPrompt} IS NULL) OR (${table.origin} = 'user' AND ${table.createdBy} IS NOT NULL AND ${table.userPrompt} IS NOT NULL)`
    ),
    // Indexes
    index('idx_exercises_origin')
      .on(table.origin)
      .where(sql`${table.deletedAt} IS NULL`),
    index('idx_exercises_created_by')
      .on(table.createdBy)
      .where(sql`${table.createdBy} IS NOT NULL AND ${table.deletedAt} IS NULL`),
    index('idx_exercises_language')
      .on(table.language)
      .where(sql`${table.deletedAt} IS NULL`),
    index('idx_exercises_difficulty')
      .on(table.difficulty)
      .where(sql`${table.deletedAt} IS NULL`),
    index('idx_exercises_environment').on(table.environmentId),
    index('idx_exercises_prompt_template').on(table.promptTemplateId),
  ]
);
