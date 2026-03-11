import { notFound } from 'next/navigation';
import * as exerciseService from '@/lib/services/exercises/exercises.service';
import { ExerciseWorkspace } from '@/components/exercises/workspace/exercise-workspace';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ pathId?: string; pathExerciseId?: string }>;

export default async function ExerciseWorkspacePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { pathId, pathExerciseId } = await searchParams;
  const user = await requireCurrentUser();

  let exercise;
  try {
    exercise = await exerciseService.getExerciseDetail(id);
  } catch {
    notFound();
  }

  const submissionService = new SubmissionService();
  const { attemptId, isNew } = await submissionService.getOrCreateAttempt(user.id, exercise.id);
  const draftCode = await submissionService.getDraftCode(user.id, attemptId);
  const previouslyCompleted =
    isNew && (await submissionService.hasPassingSubmission(user.id, exercise.id));

  return (
    <ExerciseWorkspace
      exercise={exercise}
      attemptId={attemptId}
      draftCode={draftCode}
      pathId={pathId ?? null}
      pathExerciseId={pathExerciseId ?? null}
      previouslyCompleted={previouslyCompleted}
    />
  );
}
