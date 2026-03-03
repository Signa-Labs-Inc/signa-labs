// src/app/(platform)/exercises/page.tsx
import * as exerciseService from '@/lib/services/exercises/exercises.service';
import { ExerciseGrid } from '@/components/exercises/exercise-grid';
import { ExerciseFilters } from '@/components/exercises/exercise-filters';
import type { ExerciseCatalogFilters } from '@/lib/services/exercises/exercises.types';

type SearchParams = Promise<{
  language?: string;
  difficulty?: string;
  tag?: string;
  search?: string;
}>;

export default async function ExercisesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const filters: ExerciseCatalogFilters = {
    language: params.language as ExerciseCatalogFilters['language'],
    difficulty: params.difficulty as ExerciseCatalogFilters['difficulty'],
    tag: params.tag,
    search: params.search,
  };

  const [exercises, tags] = await Promise.all([
    exerciseService.listPlatformExercises(filters),
    exerciseService.getAvailableTags(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
        <p className="text-muted-foreground mt-2">
          Practice coding with hands-on exercises across multiple languages.
        </p>
      </div>

      <ExerciseFilters tags={tags} activeFilters={filters} />

      <ExerciseGrid exercises={exercises} />
    </div>
  );
}
