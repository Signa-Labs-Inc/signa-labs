import { exercises } from '@/db/schema/tables/exercises';
import type { SynthesisContent } from '../teaching/teaching.types';
import { eq } from 'drizzle-orm';
import { db } from '@/index';

export async function updateExerciseSynthesis(
  exerciseId: string,
  synthesisContent: SynthesisContent
): Promise<void> {
  await db.update(exercises).set({ synthesisContent }).where(eq(exercises.id, exerciseId));
}
