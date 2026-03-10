import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from '../users';
import { exercises } from '../exercises';
import { exerciseSubmissions } from '../exercise_submissions';

export const submissionExplanations = pgTable(
  'submission_explanations',
  {
    id: uuid().primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => exerciseSubmissions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id),
    attemptNumber: integer('attempt_number').notNull().default(1),
    explanation: jsonb().notNull(),
    llmModel: text('llm_model').notNull(),
    generationTimeMs: integer('generation_time_ms'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('unique_submission_explanation').on(table.submissionId),
    index('idx_submission_explanations_exercise').on(table.exerciseId, table.userId),
    index('idx_submission_explanations_user').on(table.userId),
  ]
);
