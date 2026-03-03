// src/app/(platform)/exercises/[id]/page.tsx
import { notFound } from 'next/navigation';
import * as exerciseService from '@/lib/services/exercises/exercises.service';
import { ExerciseWorkspace } from '@/components/exercises/workspace/exercise-workspace';

type Params = Promise<{ id: string }>;

export default async function ExerciseWorkspacePage({ params }: { params: Params }) {
  const { id } = await params;

  let exercise;
  try {
    exercise = await exerciseService.getExerciseDetail(id);
  } catch {
    notFound();
  }

  return <ExerciseWorkspace exercise={exercise} />;
}
