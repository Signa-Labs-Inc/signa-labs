import { integer, jsonb, pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const exerciseEnvironments = pgTable('exercise_environments', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().unique().notNull(),
  displayName: text('display_name').notNull(),
  description: text(),
  baseImage: text('base_image').notNull(),
  preinstalledPackages: jsonb('preinstalled_packages').notNull().default([]),
  setupCommands: text('setup_commands').array(),
  supportedLanguages: text('supported_languages').array().notNull(),
  maxExecutionSeconds: integer('max_execution_seconds').notNull().default(30),
  maxFiles: integer('max_files').notNull().default(20),
  maxFileSizeBytes: integer('max_file_size_bytes').notNull().default(1048576),
  metadata: jsonb().default({}),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
