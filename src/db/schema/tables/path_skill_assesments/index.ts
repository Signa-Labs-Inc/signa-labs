import { pgTable, uuid, text, boolean, real, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { learningPaths } from '../learning_paths';
import { pathMilestones } from '../path_milestones';
import { exercises } from '../exercises';

export const pathSkillAssessments = pgTable(
  'path_skill_assessments',
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
    skillName: text('skill_name').notNull(),
    demonstrated: boolean().notNull(),
    confidence: real().notNull().default(0.0),
    evidence: jsonb().notNull().default({}),
    assessedAt: timestamp('assessed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_skill_assessments_path').on(table.pathId),
    index('idx_skill_assessments_skill').on(table.pathId, table.skillName),
  ]
);
