import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  BriefcaseBusiness,
  Layers,
  Globe,
  Atom,
  Terminal,
  BookOpen,
} from 'lucide-react';
import type { ExerciseCategory } from '@/lib/services/exercises/exercise-categories';
import type { ExerciseSummary } from '@/lib/services/exercises/exercises.types';
import { ExerciseCard } from './exercise-card';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BriefcaseBusiness,
  Layers,
  Globe,
  Atom,
  Terminal,
  BookOpen,
};

type CategorySectionProps = {
  category: ExerciseCategory;
  exercises: ExerciseSummary[];
  totalCount: number;
  index: number;
};

export function CategorySection({
  category,
  exercises,
  totalCount,
  index,
}: CategorySectionProps) {
  const Icon = ICON_MAP[category.icon] ?? BookOpen;

  return (
    <section
      className="animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{category.label}</h2>
            <p className="text-muted-foreground text-sm">{category.description}</p>
          </div>
        </div>
        {totalCount > exercises.length && (
          <Link
            href={`/exercises/category/${category.slug}`}
            className="text-muted-foreground hover:text-primary group inline-flex shrink-0 items-center gap-1 text-sm transition-colors"
          >
            View all {totalCount}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exercises.map((exercise, i) => (
          <div
            key={exercise.id}
            className="animate-fade-in"
            style={{ animationDelay: `${(index * 100) + (i * 60)}ms` }}
          >
            <ExerciseCard exercise={exercise} />
          </div>
        ))}
      </div>
    </section>
  );
}
