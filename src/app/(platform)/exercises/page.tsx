import type { Metadata } from 'next';
import * as exerciseService from '@/lib/services/exercises/exercises.service';

export const metadata: Metadata = { title: 'Exercises' };
import { ExerciseGrid } from '@/components/exercises/exercise-grid';
import { ExerciseFilters } from '@/components/exercises/exercise-filters';
import { UserExercises } from '@/components/exercises/user-exercises';
import { getCurrentUser } from '@/lib/services/auth/auth.service';
import { getUserExercises } from '@/lib/services/exercises/exercises.reader';
import { FlaskConical, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { ExerciseCatalogFilters } from '@/lib/services/exercises/exercises.types';

type SearchParams = Promise<{
  language?: string;
  difficulty?: string;
  tag?: string;
  search?: string;
}>;

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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
    <div className="animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                <BookOpen className="h-4 w-4" />
                Exercises
              </div>
              <p className="text-muted-foreground text-sm">
                Practice coding with hands-on exercises across multiple languages.
              </p>
            </div>
            <Link
              href="/exercises/generate"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              <FlaskConical className="h-4 w-4" />
              Craft
            </Link>
          </div>

          {/* Search + Filters */}
          <div className="mt-5">
            <ExerciseFilters
              tags={tags}
              activeFilters={filters}
              resultCount={exercises.length + (user ? userExercises.length : 0)}
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* User's generated exercises */}
        {user && userExercises.length > 0 && (
          <div className="mb-8">
            <UserExercises exercises={userExercises} showPracticeLibraryHeading />
          </div>
        )}

        {/* Platform exercises */}
        <ExerciseGrid exercises={exercises} />
      </div>
    </div>
  );
}
