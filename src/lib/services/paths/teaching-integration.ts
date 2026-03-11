/**
 * Path Teaching Integration
 *
 * Enriches teaching content when exercises are part of a learning path:
 *   - Lesson: adds context about what the user demonstrated previously
 *   - Synthesis nextPreview: fills in what the next exercise/milestone covers
 *
 * These functions are called from the path service when generating
 * path exercises and when recording exercise completions.
 */

import * as pathReader from './paths.reader';
import type { LearningPlan, PlanMilestone, UserPerformance } from './paths.types';
import type { SynthesisContent } from '@/lib/services/teaching/teaching.types';

// ============================================================
// Lesson enrichment (added to pathContext before generation)
// ============================================================

/**
 * Build lesson-specific context that gets appended to the pathContext
 * in the exercise generation prompt. This tells Claude what to teach
 * based on the user's path progress.
 */
export function buildLessonPathContext(input: {
  milestoneTitle: string;
  milestoneDescription: string;
  milestoneSkills: string[];
  targetSkills: string[];
  performance: UserPerformance;
  exerciseIndex: number;
}): string {
  const { performance, targetSkills, exerciseIndex } = input;

  let context = `
**Lesson guidance for this path exercise:**
`;

  if (exerciseIndex === 0) {
    // First exercise in milestone — lesson should introduce the concepts
    context += `This is the first exercise in the "${input.milestoneTitle}" milestone. The lesson should introduce these concepts from scratch: ${targetSkills.join(', ')}. Don't assume prior knowledge of these specific skills.`;
  } else if (performance.demonstratedSkills.length > 0) {
    // Later exercise — lesson should build on what they know
    context += `The user has already demonstrated: ${performance.demonstratedSkills.join(', ')}. `;
    context += `The lesson should build on this foundation and introduce: ${targetSkills.join(', ')}. `;
    context += `Don't re-explain concepts they've already shown understanding of.`;
  }

  if (performance.strugglingSkills.length > 0) {
    context += ` The user has struggled with: ${performance.strugglingSkills.join(', ')}. The lesson should address these concepts with extra clarity and simpler examples.`;
  }

  return context;
}

// ============================================================
// Synthesis enrichment (after exercise completion)
// ============================================================

/**
 * Enrich synthesis content with path-specific "next preview" information.
 * Called after an exercise is completed to update the synthesis with
 * what comes next in the learning path.
 */
export async function enrichSynthesisWithPathContext(
  synthesis: SynthesisContent | null,
  pathId: string,
  milestoneId: string
): Promise<SynthesisContent | null> {
  if (!synthesis) return null;

  const path = await pathReader.getPathById(pathId);
  if (!path) return synthesis;

  const milestones = await pathReader.getMilestonesByPath(pathId);
  const currentMilestone = milestones.find((m) => m.id === milestoneId);
  if (!currentMilestone) return synthesis;

  const plan = path.plan as LearningPlan;
  const currentPlanMilestone = plan.milestones[currentMilestone.milestoneIndex];

  // Check if there are more exercises in this milestone
  const completedCount = await pathReader.getCompletedExerciseCount(milestoneId);
  const estimatedExercises = currentPlanMilestone?.estimatedExercises ?? 4;
  const remainingInMilestone = Math.max(0, estimatedExercises - completedCount);

  if (remainingInMilestone > 0) {
    // More exercises in current milestone
    const remainingSkills = (currentMilestone.skills as string[]).filter(
      (s) => !(currentMilestone.skillGates as string[]).includes(s)
    );
    const nextSkill = remainingSkills[0] ?? (currentMilestone.skills as string[])[0];

    return {
      ...synthesis,
      nextPreview: `Next: continue building ${nextSkill?.replace(/_/g, ' ') ?? 'your skills'} in "${currentMilestone.title}" (~${remainingInMilestone} exercises remaining).`,
    };
  }

  // Current milestone is wrapping up — preview the next one
  const nextMilestoneIndex = currentMilestone.milestoneIndex + 1;
  const nextMilestone = milestones.find((m) => m.milestoneIndex === nextMilestoneIndex);

  if (nextMilestone) {
    return {
      ...synthesis,
      nextPreview: `Up next: "${nextMilestone.title}" — ${nextMilestone.description}`,
    };
  }

  // Last milestone — path is about to complete
  return {
    ...synthesis,
    nextPreview: `You're almost done with "${path.title}"! Complete the remaining skill gates to finish this path.`,
  };
}
