import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import * as exerciseService from '@/lib/services/exercises/exercises.service';
import { ExerciseWorkspace } from '@/components/exercises/workspace/exercise-workspace';
import { getCurrentUser } from '@/lib/services/auth/auth.service';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const exercise = await exerciseService.getExerciseDetailBySlug(slug);

  if (!exercise) {
    return { title: 'Exercise Not Found' };
  }

  return {
    title: exercise.title,
    description: exercise.description,
    openGraph: {
      title: exercise.title,
      description: exercise.description,
    },
  };
}

export default async function SharedExercisePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  const exercise = await exerciseService.getExerciseDetailBySlug(slug);
  if (!exercise) {
    notFound();
  }

  const user = await getCurrentUser();

  // Logged-in users go to the full workspace
  if (user) {
    redirect(`/exercises/${exercise.id}`);
  }

  // Anonymous users get the sandbox experience
  return (
    <ExerciseWorkspace
      exercise={exercise}
      attemptId={null}
      draftCode={null}
      pathId={null}
      pathExerciseId={null}
      previouslyCompleted={false}
      isAnonymous
    />
  );
}
