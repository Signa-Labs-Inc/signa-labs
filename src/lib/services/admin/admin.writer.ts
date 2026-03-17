import { db } from '@/index';
import { eq, sql } from 'drizzle-orm';
import { exercises } from '@/db/schema/tables/exercises';
import { exerciseFiles } from '@/db/schema/tables/exercise_files';
import { exerciseEnvironments } from '@/db/schema/tables/exercise_environments';
import { exerciseCategories } from '@/db/schema/tables/exercise_categories';
import { promptTemplates } from '@/db/schema/tables/prompt_templates';
import { users } from '@/db/schema/tables/users';
import type { CategoryInput, PromptTemplateInput } from './admin.types';
import type { ExerciseDifficulty, ExerciseLanguage, ExerciseOrigin } from '@/lib/services/exercises/exercises.constants';
import type { LessonContent, SynthesisContent } from '@/lib/services/teaching/teaching.types';

// --- Exercises ---------------------------------------------------------------

/** Update an exercise's editable fields */
export async function adminUpdateExercise(
  id: string,
  data: {
    title?: string;
    description?: string;
    difficulty?: ExerciseDifficulty;
    language?: ExerciseLanguage;
    tags?: string[];
    isPublic?: boolean;
    isValidated?: boolean;
  }
) {
  const [updated] = await db
    .update(exercises)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(exercises.id, id))
    .returning();

  return updated;
}

/** Toggle isValidated for an exercise */
export async function adminToggleValidation(id: string) {
  const [updated] = await db
    .update(exercises)
    .set({
      isValidated: sql`NOT ${exercises.isValidated}`,
      updatedAt: new Date(),
    })
    .where(eq(exercises.id, id))
    .returning();

  return updated;
}

/** Soft-delete an exercise (set deletedAt to now) */
export async function adminSoftDeleteExercise(id: string) {
  const [updated] = await db
    .update(exercises)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(exercises.id, id))
    .returning();

  return updated;
}

/** Restore a soft-deleted exercise (set deletedAt to null) */
export async function adminRestoreExercise(id: string) {
  const [updated] = await db
    .update(exercises)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(exercises.id, id))
    .returning();

  return updated;
}

/** Create a platform exercise with files in a transaction */
export async function createPlatformExercise(
  data: {
    title: string;
    description: string;
    difficulty: ExerciseDifficulty;
    language: ExerciseLanguage;
    environmentId: string;
    tags?: string[];
    hints?: string[];
    isValidated?: boolean;
    isPublic?: boolean;
    lessonContent?: LessonContent | null;
    synthesisContent?: SynthesisContent | null;
  },
  files: {
    fileType: 'starter' | 'solution' | 'test' | 'support';
    filePath: string;
    fileName: string;
    content: string;
    isEditable: boolean;
    sortOrder: number;
  }[]
) {
  return await db.transaction(async (tx) => {
    const [exercise] = await tx
      .insert(exercises)
      .values({
        origin: 'platform' as ExerciseOrigin,
        createdBy: null,
        userPrompt: null,
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        language: data.language,
        environmentId: data.environmentId,
        tags: data.tags ?? [],
        hints: data.hints ?? [],
        isValidated: data.isValidated ?? false,
        isPublic: data.isPublic ?? false,
        llmModel: 'manual',
        llmParameters: {},
        lessonContent: data.lessonContent ?? null,
        synthesisContent: data.synthesisContent ?? null,
      })
      .returning();

    if (files.length > 0) {
      await tx.insert(exerciseFiles).values(
        files.map((f) => ({
          exerciseId: exercise.id,
          fileType: f.fileType,
          filePath: f.filePath,
          fileName: f.fileName,
          content: f.content,
          isEditable: f.isEditable,
          sortOrder: f.sortOrder,
        }))
      );
    }

    return exercise;
  });
}

/** Update exercise hints */
export async function adminUpdateHints(id: string, hints: string[]) {
  const [updated] = await db
    .update(exercises)
    .set({ hints, updatedAt: new Date() })
    .where(eq(exercises.id, id))
    .returning();
  return updated;
}

/** Update exercise lesson content */
export async function adminUpdateLessonContent(id: string, lessonContent: LessonContent | null) {
  const [updated] = await db
    .update(exercises)
    .set({ lessonContent, updatedAt: new Date() })
    .where(eq(exercises.id, id))
    .returning();
  return updated;
}

/** Update exercise synthesis content */
export async function adminUpdateSynthesisContent(id: string, synthesisContent: SynthesisContent | null) {
  const [updated] = await db
    .update(exercises)
    .set({ synthesisContent, updatedAt: new Date() })
    .where(eq(exercises.id, id))
    .returning();
  return updated;
}

// --- Exercise Files -----------------------------------------------------------

/** Create a new exercise file */
export async function createExerciseFile(
  exerciseId: string,
  data: {
    fileType: string;
    filePath: string;
    fileName: string;
    content: string;
    isEditable: boolean;
    sortOrder: number;
  }
) {
  const [created] = await db
    .insert(exerciseFiles)
    .values({ exerciseId, ...data })
    .returning();
  return created;
}

/** Update an exercise file's content and metadata */
export async function updateExerciseFile(
  fileId: string,
  data: {
    content?: string;
    filePath?: string;
    fileName?: string;
    isEditable?: boolean;
    sortOrder?: number;
  }
) {
  const [updated] = await db
    .update(exerciseFiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(exerciseFiles.id, fileId))
    .returning();
  return updated;
}

/** Delete an exercise file */
export async function deleteExerciseFile(fileId: string) {
  const [deleted] = await db
    .delete(exerciseFiles)
    .where(eq(exerciseFiles.id, fileId))
    .returning();
  return deleted;
}

/** Replace all files for an exercise (used when saving all files at once) */
export async function replaceExerciseFiles(
  exerciseId: string,
  files: {
    fileType: string;
    filePath: string;
    fileName: string;
    content: string;
    isEditable: boolean;
    sortOrder: number;
  }[]
) {
  return await db.transaction(async (tx) => {
    await tx.delete(exerciseFiles).where(eq(exerciseFiles.exerciseId, exerciseId));
    if (files.length > 0) {
      await tx.insert(exerciseFiles).values(
        files.map((f) => ({ exerciseId, ...f }))
      );
    }
    // Return the new files
    return tx
      .select()
      .from(exerciseFiles)
      .where(eq(exerciseFiles.exerciseId, exerciseId))
      .orderBy(exerciseFiles.sortOrder);
  });
}

// --- Categories --------------------------------------------------------------

/** Create a new exercise category */
export async function createCategory(input: CategoryInput) {
  const [created] = await db
    .insert(exerciseCategories)
    .values({
      slug: input.slug,
      label: input.label,
      description: input.description,
      icon: input.icon,
      tags: input.tags,
      sortOrder: input.sortOrder,
      isActive: input.isActive ?? true,
    })
    .returning();

  return created;
}

/** Update an existing exercise category */
export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const [updated] = await db
    .update(exerciseCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(exerciseCategories.id, id))
    .returning();

  return updated;
}

/** Delete an exercise category */
export async function deleteCategory(id: string) {
  const [deleted] = await db
    .delete(exerciseCategories)
    .where(eq(exerciseCategories.id, id))
    .returning();

  return deleted;
}

/** Reorder categories by setting sortOrder based on array index */
export async function reorderCategories(orderedIds: string[]) {
  return db.transaction(async (trx) => {
    const results = await Promise.all(
      orderedIds.map((id, index) =>
        trx
          .update(exerciseCategories)
          .set({ sortOrder: index, updatedAt: new Date() })
          .where(eq(exerciseCategories.id, id))
          .returning()
      )
    );

    return results.map(([row]) => row);
  });
}

// --- Prompt Templates --------------------------------------------------------

/** Create a new prompt template */
export async function createPromptTemplate(input: PromptTemplateInput) {
  const [created] = await db
    .insert(promptTemplates)
    .values({
      name: input.name,
      description: input.description,
      templateText: input.templateText,
      exerciseType: input.exerciseType,
      supportedLanguages: input.supportedLanguages,
      environmentId: input.environmentId,
    })
    .returning();

  return created;
}

/** Update an existing prompt template */
export async function updatePromptTemplate(id: string, input: Partial<PromptTemplateInput>) {
  const [updated] = await db
    .update(promptTemplates)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(promptTemplates.id, id))
    .returning();

  return updated;
}

/** Toggle isActive for a prompt template */
export async function togglePromptTemplateActive(id: string) {
  const [updated] = await db
    .update(promptTemplates)
    .set({
      isActive: sql`NOT ${promptTemplates.isActive}`,
      updatedAt: new Date(),
    })
    .where(eq(promptTemplates.id, id))
    .returning();

  return updated;
}

// --- Environments ------------------------------------------------------------

/** Update an environment's editable fields */
export async function updateEnvironment(
  id: string,
  data: {
    displayName?: string;
    description?: string;
    maxExecutionSeconds?: number;
    maxFiles?: number;
    maxFileSizeBytes?: number;
  }
) {
  const [updated] = await db
    .update(exerciseEnvironments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(exerciseEnvironments.id, id))
    .returning();

  return updated;
}

/** Toggle isActive for an environment */
export async function toggleEnvironmentActive(id: string) {
  const [updated] = await db
    .update(exerciseEnvironments)
    .set({
      isActive: sql`NOT ${exerciseEnvironments.isActive}`,
      updatedAt: new Date(),
    })
    .where(eq(exerciseEnvironments.id, id))
    .returning();

  return updated;
}

// --- Users -------------------------------------------------------------------

/** Update a user's role */
export async function updateUserRole(
  userId: string,
  role: 'learner' | 'admin' | 'super_admin'
) {
  const [updated] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}
