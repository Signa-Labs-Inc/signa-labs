import { index, pgTable, text, uuid, uniqueIndex, timestamp } from 'drizzle-orm/pg-core';
import { exerciseSubmissions } from '../exercise_submissions';

export const submissionFiles = pgTable(
  'submission_files',
  {
    id: uuid().primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => exerciseSubmissions.id, { onDelete: 'cascade' }),
    filePath: text('file_path').notNull(),
    content: text().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_submission_files_unique').on(table.submissionId, table.filePath),
    index('idx_submission_files_submission').on(table.submissionId),
  ]
);
