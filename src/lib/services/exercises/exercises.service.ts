import * as reader from './exercises.reader';
import {
  Exercise,
  ExerciseCatalogFilters,
  ExerciseDetail,
  ExerciseHint,
  ExerciseSolution,
  ExerciseSummary,
} from './exercises.types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/utils/errors';
import { db } from '@/index';
import { exercises } from '@/db/schema/tables/exercises';
import { eq, and, sql } from 'drizzle-orm';
import { generateSlug } from '@/lib/utils/slug';
import { EXERCISE_CATEGORIES, type ExerciseCategory } from './exercise-categories';

export type CategorySection = {
  category: ExerciseCategory;
  exercises: ExerciseSummary[];
  totalCount: number;
};

/** Get a preview of exercises for each category (used on the main exercises page) */
export async function getCategorizedExercises(
  previewLimit: number = 6
): Promise<CategorySection[]> {
  const sections = await Promise.all(
    EXERCISE_CATEGORIES.map(async (category) => {
      const { exercises, totalCount } = await reader.listExercisesByTags(
        category.tags,
        previewLimit
      );
      return {
        category,
        exercises: exercises.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          difficulty: e.difficulty,
          language: e.language,
          tags: e.tags ?? [],
          environmentName: e.environment?.displayName ?? '',
        })),
        totalCount,
      };
    })
  );

  // Only return categories that have at least one exercise
  return sections.filter((s) => s.exercises.length > 0);
}

/** Get exercises for a single category with pagination */
export async function getCategoryExercises(
  categorySlug: string,
  limit: number = 12,
  offset: number = 0
): Promise<{ category: ExerciseCategory; exercises: ExerciseSummary[]; totalCount: number } | null> {
  const category = EXERCISE_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) return null;

  const { exercises, totalCount } = await reader.listExercisesByTags(
    category.tags,
    limit,
    offset
  );

  return {
    category,
    exercises: exercises.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      difficulty: e.difficulty,
      language: e.language,
      tags: e.tags ?? [],
      environmentName: e.environment?.displayName ?? '',
    })),
    totalCount,
  };
}

/** List all platform exercises, optionally filtered, with pagination */
export async function listPlatformExercises(
  filters: ExerciseCatalogFilters = {},
  limit?: number,
  offset: number = 0
): Promise<{ exercises: ExerciseSummary[]; totalCount: number }> {
  const { exercises, totalCount } = await reader.listPlatformExercises(filters, limit, offset);
  return {
    exercises: exercises.map((exercise) => ({
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
      language: exercise.language,
      tags: exercise.tags ?? [],
      environmentName: exercise.environment?.displayName ?? '',
    })),
    totalCount,
  };
}

export async function getAvailableTags(): Promise<string[]> {
  return reader.getAvailableTags();
}

export async function getExerciseDetail(exerciseId: string): Promise<ExerciseDetail> {
  const exercise = await reader.getExerciseById(exerciseId);
  if (!exercise) throw new NotFoundError('Exercise', exerciseId);

  const starterFiles = await reader.getExerciseStarterFiles(exerciseId);
  const supportFiles = await reader.getExerciseSupportFiles(exerciseId);

  return {
    ...exercise,
    tags: exercise.tags ?? [],
    origin: exercise.origin,
    isPublic: exercise.isPublic,
    createdBy: (exercise as Exercise & { createdBy?: string | null }).createdBy ?? null,
    environment: exercise.environment,
    hintCount: exercise.hints?.length ?? 0,
    starterFiles,
    supportFiles,
    lessonContent: exercise.lessonContent ?? null,
    synthesisContent: exercise.synthesisContent ?? null,
  };
}

export async function getExerciseHint(
  exerciseId: string,
  hintIndex: number
): Promise<ExerciseHint> {
  const exercise = await reader.getExerciseById(exerciseId);
  if (!exercise) throw new NotFoundError('Exercise', exerciseId);

  const hints = (exercise.hints ?? []) as string[];

  if (hintIndex < 0 || hintIndex >= hints.length) {
    throw new ValidationError(`Hint index ${hintIndex} is out of range`);
  }
  return {
    index: hintIndex,
    text: hints[hintIndex],
    total: hints.length,
  };
}

// --- Solution ----------------------------------------------------------------
/** Get solution files for an exercise (user explicitly peeks) */
export async function getExerciseSolution(exerciseId: string): Promise<ExerciseSolution> {
  const exercise = await reader.getExerciseById(exerciseId);
  if (!exercise) throw new NotFoundError('Exercise', exerciseId);
  const files = await reader.getExerciseSolutionFiles(exerciseId);
  return { files };
}

// --- Sharing -----------------------------------------------------------------

/** Share a user exercise: generate slug, mark public */
export async function shareExercise(
  exerciseId: string,
  userId: string
): Promise<{ slug: string }> {
  const exercise = await reader.getExerciseById(exerciseId);
  if (!exercise) throw new NotFoundError('Exercise', exerciseId);
  if (exercise.origin !== 'user' || (exercise as { createdBy?: string | null }).createdBy !== userId) {
    throw new ForbiddenError('You can only share your own exercises');
  }

  // If already shared, return existing slug
  if (exercise.isPublic && exercise.slug) {
    return { slug: exercise.slug };
  }

  const slug = generateSlug(exercise.title);

  await db
    .update(exercises)
    .set({
      slug,
      isPublic: true,
      sharedAt: new Date(),
    })
    .where(eq(exercises.id, exerciseId));

  return { slug };
}

/** Unshare a user exercise: clear slug, mark private */
export async function unshareExercise(exerciseId: string, userId: string): Promise<void> {
  const exercise = await reader.getExerciseById(exerciseId);
  if (!exercise) throw new NotFoundError('Exercise', exerciseId);
  if (exercise.origin !== 'user' || (exercise as { createdBy?: string | null }).createdBy !== userId) {
    throw new ForbiddenError('You can only unshare your own exercises');
  }

  await db
    .update(exercises)
    .set({
      slug: null,
      isPublic: false,
      sharedAt: null,
    })
    .where(eq(exercises.id, exerciseId));
}

/** Get exercise detail by sharing slug (for /e/[slug] route) */
export async function getExerciseDetailBySlug(slug: string): Promise<ExerciseDetail | null> {
  const exercise = await reader.getExerciseBySlug(slug);
  if (!exercise) return null;

  const starterFiles = await reader.getExerciseStarterFiles(exercise.id);
  const supportFiles = await reader.getExerciseSupportFiles(exercise.id);

  return {
    ...exercise,
    tags: exercise.tags ?? [],
    origin: exercise.origin,
    isPublic: exercise.isPublic,
    createdBy: (exercise as Exercise & { createdBy?: string | null }).createdBy ?? null,
    environment: exercise.environment,
    hintCount: exercise.hints?.length ?? 0,
    starterFiles,
    supportFiles,
    lessonContent: exercise.lessonContent ?? null,
    synthesisContent: exercise.synthesisContent ?? null,
  };
}

/** Increment public attempt count (fire-and-forget) */
export async function incrementPublicAttemptCount(exerciseId: string): Promise<void> {
  await db
    .update(exercises)
    .set({
      publicAttemptCount: sql`${exercises.publicAttemptCount} + 1`,
    })
    .where(and(eq(exercises.id, exerciseId), eq(exercises.isPublic, true)));
}
