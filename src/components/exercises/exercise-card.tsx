import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LanguageIcon } from '@/components/ui/language-icon';

export type ExerciseCardData = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  tags: string[] | null;
};

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

type ExerciseCardProps = {
  exercise: ExerciseCardData;
  /** Optional overlay content rendered above the card link (e.g. delete button) */
  actions?: React.ReactNode;
};

export function ExerciseCard({ exercise, actions }: ExerciseCardProps) {
  const preview =
    exercise.description.length > 120
      ? exercise.description.slice(0, 120).trimEnd() + '...'
      : exercise.description;

  const tags = exercise.tags ?? [];

  return (
    <Card className="group relative h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md bg-linear-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={DIFFICULTY_COLORS[exercise.difficulty] ?? ''}
          >
            {exercise.difficulty}
          </Badge>
          <LanguageIcon language={exercise.language} showLabel className="h-4 w-4" />
        </div>
        <CardTitle className="mt-2 text-lg leading-snug">
          {exercise.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-3">
        <CardDescription className="line-clamp-3 text-sm">
          {preview}
        </CardDescription>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      </CardFooter>

      {/* Full card click area */}
      <Link
        href={`/exercises/${exercise.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Open ${exercise.title}`}
      />

      {/* Actions rendered above the link overlay */}
      {actions && <div className="z-10">{actions}</div>}
    </Card>
  );
}
