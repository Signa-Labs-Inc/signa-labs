// src/app/(platform)/exercises/page.tsx
import * as exerciseService from '@/lib/services/exercises/exercises.service';
import { ExerciseGrid } from '@/components/exercises/exercise-grid';
import { ExerciseFilters } from '@/components/exercises/exercise-filters';
import { UserExercises } from '@/components/exercises/user-exercises';
import { getCurrentUser } from '@/lib/services/auth/auth.service';
import { getUserExercises } from '@/lib/services/exercises/exercises.reader';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
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

  const user = await getCurrentUser();

  const [exercises, tags, userExercises] = await Promise.all([
    exerciseService.listPlatformExercises(filters),
    exerciseService.getAvailableTags(),
    user ? getUserExercises(user.id) : [],
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
          <p className="text-muted-foreground mt-2">
            Practice coding with hands-on exercises across multiple languages.
          </p>
        </div>
        <Link
          href="/exercises/generate"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Generate New
        </Link>
      </div>

      <ExerciseFilters tags={tags} activeFilters={filters} />

      {/* User's generated exercises */}
      {user && userExercises.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">My Exercises</h2>
          <UserExercises exercises={userExercises} />
        </div>
      )}

      {/* Platform exercises */}
      <div>
        {user && userExercises.length > 0 && (
          <h2 className="mb-4 text-lg font-semibold">Practice Library</h2>
        )}
        <ExerciseGrid exercises={exercises} />
      </div>
    </div>
  );
}
