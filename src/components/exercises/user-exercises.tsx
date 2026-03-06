'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ============================================================
// Types
// ============================================================

type UserExercise = {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  tags: string[] | null;
};

type UserExercisesProps = {
  exercises: UserExercise[];
  showPracticeLibraryHeading?: boolean;
};

// ============================================================
// Constants
// ============================================================

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

// ============================================================
// Component
// ============================================================

export function UserExercises({ exercises, showPracticeLibraryHeading }: UserExercisesProps) {
  const [localExercises, setLocalExercises] = useState<UserExercise[]>(exercises);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/exercises/${deleteTarget}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLocalExercises((prev) => prev.filter((ex) => ex.id !== deleteTarget));
      }
    } catch (err) {
      console.error('Failed to delete exercise:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  if (localExercises.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">My Exercises</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {localExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="group bg-card hover:border-foreground/20 relative rounded-lg border p-4 transition-colors"
            >
              <Link href={`/exercises/${exercise.id}`} className="block">
                <h3 className="text-foreground truncate font-medium">{exercise.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={DIFFICULTY_COLORS[exercise.difficulty] ?? ''}>
                    {exercise.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {LANGUAGE_LABELS[exercise.language] ?? exercise.language}
                  </Badge>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete exercise"
                className="text-muted-foreground hover:text-destructive absolute top-3 right-3 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteTarget(exercise.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {showPracticeLibraryHeading && (
        <h2 className="mb-4 text-lg font-semibold">Practice Library</h2>
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete exercise?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this exercise and all your submissions. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
