import * as reader from './exercises.reader';
import {
  ExerciseCatalogFilters,
  ExerciseDetail,
  ExerciseHint,
  ExerciseSolution,
  ExerciseSummary,
} from './exercises.types';
import { NotFoundError, ValidationError } from '@/lib/utils/errors';

/** List all platform exercises, optionally filtered */
export async function listPlatformExercises(
  filters: ExerciseCatalogFilters = {}
): Promise<ExerciseSummary[]> {
  const platformExercises = await reader.listPlatformExercises(filters);
  return platformExercises.map((exercise) => ({
    id: exercise.id,
    title: exercise.title,
    description: exercise.description,
    difficulty: exercise.difficulty,
    language: exercise.language,
    tags: exercise.tags ?? [],
    environmentName: exercise.environment?.name ?? '',
  }));
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
