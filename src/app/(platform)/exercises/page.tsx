import type { Metadata } from 'next';
import Link from 'next/link';
import { FlaskConical, BookOpen, Search } from 'lucide-react';
import { getCurrentUser } from '@/lib/services/auth/auth.service';
import { getUserExercises } from '@/lib/services/exercises/exercises.reader';
import { getCategorizedExercises } from '@/lib/services/exercises/exercises.service';
import { CategorySection } from '@/components/exercises/category-section';
import { UserExercises } from '@/components/exercises/user-exercises';
import { ExerciseCatalogLink } from '@/components/exercises/exercise-catalog-link';

export const metadata: Metadata = { title: 'Exercises' };

const PREVIEW_LIMIT = 3;

export default async function ExercisesPage() {
  const user = await getCurrentUser();

  const [sections, userResult] = await Promise.all([
    getCategorizedExercises(PREVIEW_LIMIT),
    user
      ? getUserExercises(user.id, PREVIEW_LIMIT)
      : { exercises: [], totalCount: 0 },
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
                Practice coding with hands-on exercises across multiple languages and topics.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ExerciseCatalogLink />
              <Link
                href="/exercises/generate"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                <FlaskConical className="h-4 w-4" />
                Craft
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* User's generated exercises */}
        {user && userResult.totalCount > 0 && (
          <div className="mb-12">
            <UserExercises
              exercises={userResult.exercises}
              totalCount={userResult.totalCount}
              showPracticeLibraryHeading
            />
          </div>
        )}

        {/* Categorized platform exercises */}
        {sections.length > 0 ? (
          <div className="space-y-12">
            {sections.map((section, index) => (
              <CategorySection
                key={section.category.slug}
                category={section.category}
                exercises={section.exercises}
                totalCount={section.totalCount}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No exercises yet</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Generate a custom exercise to get started, or check back soon for new content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
