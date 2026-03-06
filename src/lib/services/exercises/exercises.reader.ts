import { db } from '@/index';
import { and, arrayContains, eq, ilike, isNull, sql } from 'drizzle-orm/sql';
import { Exercise, ExerciseCatalogFilters, ExerciseFile } from './exercises.types';
import { exercises } from '@/db/schema/tables/exercises';
import { exerciseEnvironments, exerciseFiles } from '@/db/schema/tables';

// --- Single Exercise ---------------------------------------------------------
/** Get an exercise with its environment */
export async function getExerciseById(exerciseId: string): Promise<Exercise | null> {
  const [exercise] = await db
    .select({ exercise: exercises, environment: exerciseEnvironments })
    .from(exercises)
    .innerJoin(exerciseEnvironments, eq(exercises.environmentId, exerciseEnvironments.id))
    .where(and(eq(exercises.id, exerciseId), isNull(exercises.deletedAt)));
  if (!exercise) return null;

  return { ...exercise.exercise, environment: exercise.environment };
}

// --- Exercise Files ----------------------------------------------------------

/** Get files for an exercise by file type */
export async function getExerciseFilesByType(
  exerciseId: string,
  fileType: string
): Promise<ExerciseFile[]> {
  const files = await db
    .select()
    .from(exerciseFiles)
    .where(and(eq(exerciseFiles.exerciseId, exerciseId), eq(exerciseFiles.fileType, fileType)))
    .orderBy(exerciseFiles.sortOrder);
  return files;
}

/** Get starter + support files (what the editor loads) */
export async function getEditorFiles(exerciseId: string): Promise<ExerciseFile[]> {
  const files = await db
    .select()
    .from(exerciseFiles)
    .where(
      and(
        eq(exerciseFiles.exerciseId, exerciseId),
        sql`${exerciseFiles.fileType} IN ('starter', 'support')`
      )
    )
    .orderBy(exerciseFiles.sortOrder);
  return files;
}

export async function getExerciseStarterFiles(exerciseId: string): Promise<ExerciseFile[]> {
  const files = await db
    .select()
    .from(exerciseFiles)
    .where(
      and(eq(exerciseFiles.exerciseId, exerciseId), sql`${exerciseFiles.fileType} IN ('starter')`)
    )
    .orderBy(exerciseFiles.sortOrder);
  return files;
}

export async function getExerciseSupportFiles(exerciseId: string): Promise<ExerciseFile[]> {
  const files = await db
    .select()
    .from(exerciseFiles)
    .where(
      and(eq(exerciseFiles.exerciseId, exerciseId), sql`${exerciseFiles.fileType} IN ('support')`)
    )
    .orderBy(exerciseFiles.sortOrder);
  return files;
}
/** Get solution files */
export async function getExerciseSolutionFiles(exerciseId: string): Promise<ExerciseFile[]> {
  const files = await db
    .select()
    .from(exerciseFiles)
    .where(and(eq(exerciseFiles.exerciseId, exerciseId), eq(exerciseFiles.fileType, 'solution')))
    .orderBy(exerciseFiles.sortOrder);
  return files;
}

/** List platform exercises with optional filters */
export async function listPlatformExercises(
  filters: ExerciseCatalogFilters = {}
): Promise<Exercise[]> {
  const conditions = [
    eq(exercises.origin, 'platform'),
    isNull(exercises.deletedAt),
    eq(exercises.isValidated, true),
  ];

  if (filters.language) {
    conditions.push(eq(exercises.language, filters.language));
  }

  if (filters.difficulty) {
    conditions.push(eq(exercises.difficulty, filters.difficulty));
  }

  if (filters.tag) {
    conditions.push(arrayContains(exercises.tags, [filters.tag]));
  }

  if (filters.search) {
    conditions.push(ilike(exercises.title, `%${filters.search}%`));
  }

  const platformExercises = await db
    .select({
      id: exercises.id,
      title: exercises.title,
      origin: exercises.origin,
      description: exercises.description,
      difficulty: exercises.difficulty,
      language: exercises.language,
      tags: exercises.tags,
      environmentName: exerciseEnvironments.displayName,
      environment: {
        id: exerciseEnvironments.id,
        name: exerciseEnvironments.name,
        displayName: exerciseEnvironments.displayName,
        baseImage: exerciseEnvironments.baseImage,
        maxExecutionSeconds: exerciseEnvironments.maxExecutionSeconds,
        maxFiles: exerciseEnvironments.maxFiles,
        maxFileSizeBytes: exerciseEnvironments.maxFileSizeBytes,
      },
    })
    .from(exercises)
    .innerJoin(exerciseEnvironments, eq(exercises.environmentId, exerciseEnvironments.id))
    .where(and(...conditions))
    .orderBy(exercises.title);

  return platformExercises;
}

/** Get all distinct tags across platform exercises */
export async function getAvailableTags(): Promise<string[]> {
  const availableTags = await db
    .selectDistinct({ tags: sql<string>`unnest(${exercises.tags})` })
    .from(exercises)
    .where(
      and(
        isNull(exercises.deletedAt),
        eq(exercises.origin, 'platform'),
        eq(exercises.isValidated, true)
      )
    )
    .orderBy(sql`unnest(${exercises.tags})`);

  return availableTags.map((row) => row.tags);
}

// --- User Exercises ----------------------------------------------------------

/** Get exercises created by a specific user */
export async function getUserExercises(userId: string): Promise<Exercise[]> {
  const userExercises = await db
    .select({
      id: exercises.id,
      title: exercises.title,
      origin: exercises.origin,
      description: exercises.description,
      difficulty: exercises.difficulty,
      language: exercises.language,
      tags: exercises.tags,
      environmentName: exerciseEnvironments.displayName,
      environment: {
        id: exerciseEnvironments.id,
        name: exerciseEnvironments.name,
        displayName: exerciseEnvironments.displayName,
        baseImage: exerciseEnvironments.baseImage,
        maxExecutionSeconds: exerciseEnvironments.maxExecutionSeconds,
        maxFiles: exerciseEnvironments.maxFiles,
        maxFileSizeBytes: exerciseEnvironments.maxFileSizeBytes,
      },
    })
    .from(exercises)
    .innerJoin(exerciseEnvironments, eq(exercises.environmentId, exerciseEnvironments.id))
    .where(
      and(
        eq(exercises.origin, 'user'),
        eq(exercises.createdBy, userId),
        isNull(exercises.deletedAt)
      )
    )
    .orderBy(sql`${exercises.createdAt} DESC`);

  return userExercises;
}

/** Soft delete a user's exercise */
export async function softDeleteUserExercise(exerciseId: string, userId: string): Promise<boolean> {
  const result = await db
    .update(exercises)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(exercises.id, exerciseId),
        eq(exercises.createdBy, userId),
        eq(exercises.origin, 'user'),
        isNull(exercises.deletedAt)
      )
    )
    .returning({ id: exercises.id });

  return result.length > 0;
}
