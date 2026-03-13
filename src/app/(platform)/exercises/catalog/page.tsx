import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import * as exerciseService from '@/lib/services/exercises/exercises.service';
import { ExerciseGrid } from '@/components/exercises/exercise-grid';
import { ExerciseFilters } from '@/components/exercises/exercise-filters';
import type { ExerciseCatalogFilters } from '@/lib/services/exercises/exercises.types';

export const metadata: Metadata = { title: 'Browse Exercises' };

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  language?: string;
  difficulty?: string;
  tag?: string;
  search?: string;
  page?: string;
}>;

export default async function CatalogPage({
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

  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [{ exercises, totalCount }, tags] = await Promise.all([
    exerciseService.listPlatformExercises(filters, PAGE_SIZE, offset),
    exerciseService.getAvailableTags(),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Build query string preserving active filters
  function pageHref(page: number) {
    const p = new URLSearchParams();
    if (filters.language) p.set('language', filters.language);
    if (filters.difficulty) p.set('difficulty', filters.difficulty);
    if (filters.tag) p.set('tag', filters.tag);
    if (filters.search) p.set('search', filters.search);
    if (page > 1) p.set('page', String(page));
    const qs = p.toString();
    return `/exercises/catalog${qs ? `?${qs}` : ''}`;
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
          <h1 className="text-2xl font-bold tracking-tight">Browse All Exercises</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Search and filter across the entire exercise library.
          </p>

          <div className="mt-5">
            <ExerciseFilters
              tags={tags}
              activeFilters={filters}
              resultCount={totalCount}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl px-6 py-8">
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
      </div>
    </div>
  );
}
