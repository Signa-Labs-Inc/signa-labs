/**
 * Generation Reader
 *
 * Database reads for the exercise generation pipeline.
 */

import { eq, and, sql, desc, count } from 'drizzle-orm';
import { db } from '@/index';
import { exercises } from '@/db/schema/tables/exercises';
import { exerciseEnvironments } from '@/db/schema/tables/exercise_environments';
import { promptTemplates } from '@/db/schema/tables/prompt_templates';
import type { PromptTemplateRecord } from './generation.types';
import { ExerciseEnvironment } from '../exercises/exercises.types';

// ============================================================
// Environment reads
// ============================================================

export async function getActiveEnvironmentByLanguage(
  language: string
): Promise<ExerciseEnvironment | null> {
  const [environment] = await db
    .select({
      id: exerciseEnvironments.id,
      displayName: exerciseEnvironments.displayName,
      name: exerciseEnvironments.name,
      baseImage: exerciseEnvironments.baseImage,
      maxExecutionSeconds: exerciseEnvironments.maxExecutionSeconds,
      maxFiles: exerciseEnvironments.maxFiles,
      maxFileSizeBytes: exerciseEnvironments.maxFileSizeBytes,
    })
    .from(exerciseEnvironments)
    .where(
      and(
        eq(exerciseEnvironments.isActive, true),
        sql`${language} = ANY(${exerciseEnvironments.supportedLanguages})`
      )
    )
    .limit(1);

  return environment ?? null;
}

// ============================================================
// Prompt template reads
// ============================================================

export async function getPromptTemplateById(
  templateId: string
): Promise<PromptTemplateRecord | null> {
  const [template] = await db
    .select({
      id: promptTemplates.id,
      name: promptTemplates.name,
      templateText: promptTemplates.templateText,
      exerciseType: promptTemplates.exerciseType,
      supportedLanguages: promptTemplates.supportedLanguages,
      environmentId: promptTemplates.environmentId,
    })
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, templateId), eq(promptTemplates.isActive, true)))
    .limit(1);

  return template ?? null;
}

export async function getDefaultPromptTemplate(
  language: string,
  exerciseType?: string
): Promise<PromptTemplateRecord | null> {
  const conditions = [eq(promptTemplates.isActive, true)];

  if (exerciseType) {
    conditions.push(eq(promptTemplates.exerciseType, exerciseType));
  }

  const templates = await db
    .select({
      id: promptTemplates.id,
      name: promptTemplates.name,
      templateText: promptTemplates.templateText,
      exerciseType: promptTemplates.exerciseType,
      supportedLanguages: promptTemplates.supportedLanguages,
      environmentId: promptTemplates.environmentId,
    })
    .from(promptTemplates)
    .where(and(...conditions))
    .orderBy(desc(promptTemplates.version))
    .limit(10);

  // Prefer templates that explicitly support this language
  const languageMatch = templates.find(
    (t) => t.supportedLanguages && t.supportedLanguages.includes(language)
  );

  return languageMatch ?? templates[0] ?? null;
}

// ============================================================
// Rate limiting reads
// ============================================================

/**
 * Count how many exercises a user has generated in the last hour.
 * Used for basic rate limiting. Will be extended with plan-based
 * quotas in the subscriptions phase.
 */
export async function getUserGenerationCountLastHour(userId: string): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [result] = await db
    .select({ total: count() })
    .from(exercises)
    .where(
      and(
        eq(exercises.createdBy, userId),
        eq(exercises.origin, 'user'),
        sql`${exercises.createdAt} >= ${oneHourAgo.toISOString()}::timestamptz`
      )
    );

  return result?.total ?? 0;
}
