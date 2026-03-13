import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCategoryExercises } from '@/lib/services/exercises/exercises.service';
import { getCategoryBySlug } from '@/lib/services/exercises/exercise-categories';
import { ExerciseGrid } from '@/components/exercises/exercise-grid';

const PAGE_SIZE = 12;

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ page?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  return { title: category ? `${category.label} — Exercises` : 'Exercises' };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { page } = await searchParams;

  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const result = await getCategoryExercises(slug, PAGE_SIZE, offset);
  if (!result) notFound();

  const { category, exercises, totalCount } = result;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
            All exercises
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{category.label}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            {totalCount} {totalCount === 1 ? 'exercise' : 'exercises'}
          </p>
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
                href={`/exercises/category/${slug}?page=${currentPage - 1}`}
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
                href={`/exercises/category/${slug}?page=${currentPage + 1}`}
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
