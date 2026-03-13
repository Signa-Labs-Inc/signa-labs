import * as reader from './exercises.reader';
import {
  ExerciseCatalogFilters,
  ExerciseDetail,
  ExerciseHint,
  ExerciseSolution,
  ExerciseSummary,
} from './exercises.types';
import { NotFoundError, ValidationError } from '@/lib/utils/errors';
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
