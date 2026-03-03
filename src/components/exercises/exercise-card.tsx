import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
// src/components/exercises/exercise-grid.tsx
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ExerciseSummary } from '@/lib/services/exercises/exercises.types';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  easy: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
  medium:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  hard: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  expert:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  go: 'Go',
  ruby: 'Ruby',
  sql: 'SQL',
};

export function ExerciseCard({ exercise }: { exercise: ExerciseSummary }) {
  // Truncate description for card preview
  const preview =
    exercise.description.length > 120
      ? exercise.description.slice(0, 120).trimEnd() + '...'
      : exercise.description;

  return (
    <Link href={`/exercises/${exercise.id}`}>
      <Card className="hover:border-foreground/20 h-full transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={DIFFICULTY_COLORS[exercise.difficulty] ?? ''}>
              {exercise.difficulty}
            </Badge>
            <span className="text-muted-foreground text-xs font-medium">
              {LANGUAGE_LABELS[exercise.language] ?? exercise.language}
            </span>
          </div>
          <CardTitle className="mt-2 text-lg leading-snug">{exercise.title}</CardTitle>
        </CardHeader>

        <CardContent className="pb-3">
          <CardDescription className="line-clamp-3 text-sm">{preview}</CardDescription>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex flex-wrap gap-1.5">
            {exercise.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {exercise.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{exercise.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
