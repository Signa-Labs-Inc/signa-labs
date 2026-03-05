// src/app/(platform)/exercises/[id]/page.tsx
import { notFound } from 'next/navigation';
import * as exerciseService from '@/lib/services/exercises/exercises.service';
import { ExerciseWorkspace } from '@/components/exercises/workspace/exercise-workspace';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';

type Params = Promise<{ id: string }>;

export default async function ExerciseWorkspacePage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireCurrentUser();

  let exercise;
  try {
    exercise = await exerciseService.getExerciseDetail(id);
  } catch {
    notFound();
  }

  // Get or create an active attempt for this user + exercise
  const submissionService = new SubmissionService();
  const { attemptId } = await submissionService.getOrCreateAttempt(user.id, exercise.id);

  return <ExerciseWorkspace exercise={exercise} attemptId={attemptId} />;
}
