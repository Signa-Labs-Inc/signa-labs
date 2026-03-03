// src/components/exercises/exercise-grid.tsx
import type { ExerciseSummary } from '@/lib/services/exercises/exercises.types';
import { ExerciseCard } from './exercise-card';

type ExerciseGridProps = {
  exercises: ExerciseSummary[];
};

export function ExerciseGrid({ exercises }: ExerciseGridProps) {
  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-muted-foreground text-lg font-medium">No exercises found</p>
        <p className="text-muted-foreground mt-1 text-sm">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
}
