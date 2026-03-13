'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Trash2, ArrowRight } from 'lucide-react';
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
import { ExerciseCard } from './exercise-card';
import type { ExerciseCardData } from './exercise-card';

type UserExercisesProps = {
  exercises: ExerciseCardData[];
  totalCount: number;
  showPracticeLibraryHeading?: boolean;
};

export function UserExercises({
  exercises,
  totalCount,
  showPracticeLibraryHeading,
}: UserExercisesProps) {
  const [localExercises, setLocalExercises] =
    useState<ExerciseCardData[]>(exercises);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/exercises/${deleteTarget}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLocalExercises((prev) =>
          prev.filter((ex) => ex.id !== deleteTarget)
        );
      }
    } catch (err) {
      console.error('Failed to delete exercise:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  if (localExercises.length === 0 && totalCount === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Exercises</h2>
          {totalCount > localExercises.length && (
            <Link
              href="/exercises/my"
              className="text-muted-foreground hover:text-primary group inline-flex shrink-0 items-center gap-1 text-sm transition-colors"
            >
              View all {totalCount}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localExercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <ExerciseCard
                exercise={exercise}
                actions={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete exercise"
                    className="text-muted-foreground hover:text-destructive absolute bottom-3 right-3 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTarget(exercise.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                }
              />
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
              This will permanently remove this exercise and all your
              submissions. This action cannot be undone.
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
