import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, FlaskConical, Search } from 'lucide-react';
import { getCurrentUser } from '@/lib/services/auth/auth.service';
import { getUserExercises } from '@/lib/services/exercises/exercises.reader';
import { ExerciseGrid } from '@/components/exercises/exercise-grid';
import { ExerciseFilters } from '@/components/exercises/exercise-filters';
import type { ExerciseCatalogFilters } from '@/lib/services/exercises/exercises.types';

export const metadata: Metadata = { title: 'My Exercises' };

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  search?: string;
  language?: string;
  difficulty?: string;
  tag?: string;
  page?: string;
}>;

export default async function MyExercisesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const filters: ExerciseCatalogFilters = {
    language: params.language as ExerciseCatalogFilters['language'],
    difficulty: params.difficulty as ExerciseCatalogFilters['difficulty'],
    tag: params.tag,
    search: params.search,
  };

  const { exercises: rawExercises, totalCount } = await getUserExercises(
    user.id,
    PAGE_SIZE,
    offset,
    {
      search: filters.search,
      language: filters.language,
      difficulty: filters.difficulty,
    }
  );

  const exercises = rawExercises.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    difficulty: e.difficulty,
    language: e.language,
    tags: e.tags ?? [],
    environmentName: e.environment?.displayName ?? '',
  }));

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasActiveFilters = !!(filters.language || filters.difficulty || filters.search);

  function pageHref(page: number) {
    const p = new URLSearchParams();
    if (filters.language) p.set('language', filters.language);
    if (filters.difficulty) p.set('difficulty', filters.difficulty);
    if (filters.search) p.set('search', filters.search);
    if (page > 1) p.set('page', String(page));
    const qs = p.toString();
    return `/exercises/my${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-8">
          <Link
            href="/exercises"
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Exercises
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Exercises</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Exercises you have crafted with AI.
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

          <div className="mt-5">
            <ExerciseFilters
              tags={[]}
              activeFilters={filters}
              resultCount={totalCount}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {exercises.length > 0 ? (
          <>
            <ExerciseGrid exercises={exercises} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={pageHref(currentPage - 1)}
                    className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-muted-foreground px-3 text-sm tabular-nums">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={pageHref(currentPage + 1)}
                    className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">
              {hasActiveFilters ? 'No exercises found' : 'No exercises yet'}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              {hasActiveFilters
                ? 'Try adjusting your filters or search query.'
                : 'Craft your first exercise to get started.'}
            </p>
            {!hasActiveFilters && (
              <Link
                href="/exercises/generate"
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                <FlaskConical className="h-4 w-4" />
                Craft Exercise
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
