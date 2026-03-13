import { db } from '@/index';
import { and, arrayContains, eq, ilike, isNull, sql, or } from 'drizzle-orm/sql';
import { Exercise, ExerciseCatalogFilters, ExerciseFile } from './exercises.types';
import type { ExerciseDifficulty, ExerciseLanguage } from './exercises.constants';
import { exercises } from '@/db/schema/tables/exercises';
import { exerciseEnvironments, exerciseFiles } from '@/db/schema/tables';

/** Escape LIKE wildcards so user input is treated as literal text */
function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

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

/** List platform exercises with optional filters and pagination */
export async function listPlatformExercises(
  filters: ExerciseCatalogFilters = {},
  limit?: number,
  offset: number = 0
): Promise<{ exercises: Exercise[]; totalCount: number }> {
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
    conditions.push(ilike(exercises.title, `%${escapeLike(filters.search)}%`));
  }

  const whereClause = and(...conditions);

  let query = db
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
    .where(whereClause)
    .orderBy(sql`${exercises.createdAt} DESC`)
    .$dynamic();

  if (limit !== undefined) {
    query = query.limit(limit).offset(offset);
  }

  const [countResult, exerciseResults] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(exercises)
      .where(whereClause),
    query,
  ]);

  return {
    exercises: exerciseResults,
    totalCount: countResult[0]?.count ?? 0,
  };
}

/**
 * List platform exercises matching ANY of the given tags, with pagination.
 * Returns { exercises, totalCount } for the matching set.
 */
export async function listExercisesByTags(
  tags: string[],
  limit: number = 6,
  offset: number = 0
): Promise<{ exercises: Exercise[]; totalCount: number }> {
  const tagConditions = tags.map((tag) => arrayContains(exercises.tags, [tag]));

  const baseConditions = [
    eq(exercises.origin, 'platform'),
    isNull(exercises.deletedAt),
    eq(exercises.isValidated, true),
    or(...tagConditions)!,
  ];

  const [countResult, exerciseResults] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(exercises)
      .where(and(...baseConditions)),
    db
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
      .where(and(...baseConditions))
      .orderBy(sql`${exercises.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
  ]);

  return {
    exercises: exerciseResults,
    totalCount: countResult[0]?.count ?? 0,
  };
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

/** Get exercises created by a specific user, with pagination and optional filters */
export async function getUserExercises(
  userId: string,
  limit?: number,
  offset: number = 0,
  filters: { search?: string; language?: ExerciseLanguage; difficulty?: ExerciseDifficulty } = {}
): Promise<{ exercises: Exercise[]; totalCount: number }> {
  const conditions = [
    eq(exercises.origin, 'user'),
    eq(exercises.createdBy, userId),
    isNull(exercises.deletedAt),
  ];

  if (filters.search) {
    conditions.push(ilike(exercises.title, `%${escapeLike(filters.search)}%`));
  }

  if (filters.language) {
    conditions.push(eq(exercises.language, filters.language));
  }

  if (filters.difficulty) {
    conditions.push(eq(exercises.difficulty, filters.difficulty));
  }

  const whereClause = and(...conditions);

  let query = db
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
    .where(whereClause)
    .orderBy(sql`${exercises.createdAt} DESC`)
    .$dynamic();

  if (limit !== undefined) {
    query = query.limit(limit).offset(offset);
  }

  const [countResult, exerciseResults] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(exercises)
      .where(whereClause),
    query,
  ]);

  return {
    exercises: exerciseResults,
    totalCount: countResult[0]?.count ?? 0,
  };
}

// --- Cached platform stats ---------------------------------------------------

let _platformCountCache: { value: number; expiresAt: number } | null = null;
const PLATFORM_COUNT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Count all validated platform exercises (cached for 5 min) */
export async function getPlatformExerciseCount(): Promise<number> {
  if (_platformCountCache && Date.now() < _platformCountCache.expiresAt) {
    return _platformCountCache.value;
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(exercises)
    .where(
      and(
        eq(exercises.origin, 'platform'),
        isNull(exercises.deletedAt),
        eq(exercises.isValidated, true)
      )
    );

  const count = result?.count ?? 0;
  _platformCountCache = { value: count, expiresAt: Date.now() + PLATFORM_COUNT_TTL_MS };
  return count;
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
