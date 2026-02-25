import {
  check,
  index,
  integer,
  pgTable,
  text,
  uuid,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { exercises } from '../exercises';
import { timestamps } from '../../../util/timestamps';
export const exerciseFiles = pgTable(
  'exercise_files',
  {
    id: uuid().primaryKey().defaultRandom(),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    fileType: text('file_type').notNull(),
    filePath: text('file_path').notNull(),
    fileName: text('file_name').notNull(),
    content: text().notNull(),
    isEditable: boolean('is_editable').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  (table) => [
    check(
      'exercise_files_type_check',
      sql`${table.fileType} IN ('starter', 'solution', 'test', 'support')`
    ),
    uniqueIndex('idx_exercise_files_unique').on(table.exerciseId, table.fileType, table.filePath),
    index('idx_exercise_files_exercise').on(table.exerciseId),
  ]
);
