import {
  pgTable,
  check,
  index,
  boolean,
  uuid,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { exerciseEnvironments } from '../exercise_environments';
import { sql } from 'drizzle-orm';
export const promptTemplates = pgTable(
  'prompt_templates',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    description: text(),
    templateText: text('template_text').notNull(),
    exerciseType: text('exercise_type').notNull(),
    supportedLanguages: text('supported_languages').array().notNull(),
    environmentId: uuid('environment_id').references(() => exerciseEnvironments.id),
    version: integer().notNull().default(1),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    check(
      'prompt_templates_exercise_type_check',
      sql`${table.exerciseType} IN ('algorithm', 'debugging', 'build', 'refactor', 'query', 'api', 'data_pipeline', 'config')`
    ),
    index('idx_prompt_templates_type')
      .on(table.exerciseType)
      .where(sql`${table.isActive} = true`),
  ]
);
