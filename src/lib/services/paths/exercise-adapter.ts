/**
 * Exercise Adapter
 *
 * The adaptive intelligence layer. Builds enriched generation prompts
 * based on the user's performance history within a learning path.
 *
 * Responsibilities:
 *   - Analyze user performance across recent exercises
 *   - Determine difficulty adjustment (easier / same / harder)
 *   - Identify skills to target or reinforce
 *   - Build the path context that gets injected into the generation prompt
 */

import * as reader from './paths.reader';
import type {
  UserPerformance,
  RecentExercisePerformance,
  ExerciseGenerationContext,
} from './paths.types';

// ============================================================
// Performance analysis
// ============================================================

/**
 * Analyze the user's performance across recent exercises in this path.
 */
export async function analyzePerformance(
  pathId: string,
  milestoneId: string
): Promise<UserPerformance> {
  const recentExercises = await reader.getRecentPathExercises(pathId, 5);
  const milestoneExercises = await reader.getMilestoneExercises(milestoneId);
  const skillConfidence = await reader.getSkillConfidenceMap(pathId);
  const milestone = await reader.getMilestoneById(milestoneId);

  const completedInMilestone = milestoneExercises.filter((e) => e.pathExercise.isCompleted);

  // Calculate averages from completed exercises
  const avgPassRate =
    completedInMilestone.length > 0
      ? completedInMilestone.reduce((sum, e) => {
          const passed = e.pathExercise.testsPassed ?? 0;
          const total = e.pathExercise.testsTotal ?? 1;
          return sum + (passed / total) * 100;
        }, 0) / completedInMilestone.length
      : 100; // No exercises yet = assume capable

  const avgTimeSeconds =
    completedInMilestone.length > 0
      ? completedInMilestone.reduce((sum, e) => sum + (e.pathExercise.timeSpentSeconds ?? 0), 0) /
        completedInMilestone.length
      : 0;

  const avgHintsUsed =
    completedInMilestone.length > 0
      ? completedInMilestone.reduce((sum, e) => sum + (e.pathExercise.hintsUsed ?? 0), 0) /
        completedInMilestone.length
      : 0;

  // Determine demonstrated and struggling skills
  const milestoneSkills = (milestone?.skills ?? []) as string[];
  const demonstratedSkills: string[] = [];
  const strugglingSkills: string[] = [];

  for (const skill of milestoneSkills) {
    const confidence = skillConfidence.get(skill) ?? 0;
    if (confidence >= 0.7) {
      demonstratedSkills.push(skill);
    } else if (confidence > 0 && confidence < 0.5) {
      strugglingSkills.push(skill);
    }
  }

  // Determine next skill to teach — first undemonstrated skill
  const untaughtSkills = milestoneSkills.filter((s) => !demonstratedSkills.includes(s));
  const nextSkillToTeach = untaughtSkills[0] ?? milestoneSkills[milestoneSkills.length - 1];

  // Weakest skill — lowest confidence among assessed skills
  let weakestSkill: string | null = null;
  let lowestConfidence = 1.0;
  for (const skill of milestoneSkills) {
    const confidence = skillConfidence.get(skill) ?? 0;
    if (confidence < lowestConfidence && confidence > 0) {
      lowestConfidence = confidence;
      weakestSkill = skill;
    }
  }

  // Build recent exercise performance summaries
  const recentPerformance: RecentExercisePerformance[] = recentExercises.map((e) => ({
    exerciseId: e.exercise.id,
    title: e.exercise.title,
    testsPassed: e.pathExercise.testsPassed ?? 0,
    testsTotal: e.pathExercise.testsTotal ?? 0,
    timeSpentSeconds: e.pathExercise.timeSpentSeconds ?? 0,
    hintsUsed: e.pathExercise.hintsUsed ?? 0,
    failedTestConcepts: [], // Populated by skill assessments
  }));

  return {
    exercisesCompleted: completedInMilestone.length,
    avgPassRate,
    avgTimeSeconds,
    avgHintsUsed,
    demonstratedSkills,
    strugglingSkills,
    nextSkillToTeach,
    weakestSkill,
    recentExercises: recentPerformance,
  };
}

// ============================================================
// Adaptation logic
// ============================================================

/**
 * Determine how to adapt the next exercise based on performance.
 */
export function getAdaptationStrategy(performance: UserPerformance): {
  difficultyAdjustment: 'easier' | 'same' | 'harder';
  instructions: string;
  targetSkills: string[];
} {
  // First exercise in milestone — no adaptation needed
  if (performance.exercisesCompleted === 0) {
    return {
      difficultyAdjustment: 'same',
      instructions: `This is the first exercise in this milestone. Introduce the core concepts gradually. Provide helpful starter code with clear TODO comments.`,
      targetSkills: [performance.nextSkillToTeach],
    };
  }

  // User is crushing it — advance faster
  if (performance.avgPassRate > 90 && performance.avgHintsUsed < 0.5) {
    return {
      difficultyAdjustment: 'harder',
      instructions: `The user is performing very well (${Math.round(performance.avgPassRate)}% pass rate, minimal hints). Increase complexity:
- Combine multiple skills in one exercise
- Reduce scaffolding in the starter code
- Add edge cases that require deeper understanding
- Consider introducing concepts from the next milestone early`,
      targetSkills: [
        performance.nextSkillToTeach,
        ...(performance.demonstratedSkills.length > 0
          ? [performance.demonstratedSkills[performance.demonstratedSkills.length - 1]]
          : []),
      ],
    };
  }

  // User is struggling — reinforce
  if (performance.avgPassRate < 50) {
    const targetSkill = performance.weakestSkill ?? performance.nextSkillToTeach;
    return {
      difficultyAdjustment: 'easier',
      instructions: `The user is struggling (${Math.round(performance.avgPassRate)}% pass rate). Generate a simpler exercise:
- Focus on ONE skill: "${targetSkill}"
- Provide more detailed starter code with clear comments
- Keep the scope small and achievable
- Add extra hints that guide toward the solution
- Use straightforward test cases without tricky edge cases`,
      targetSkills: [targetSkill],
    };
  }

  // User is using too many hints — they understand but need practice
  if (performance.avgHintsUsed > 2) {
    return {
      difficultyAdjustment: 'same',
      instructions: `The user is relying on hints (avg ${performance.avgHintsUsed.toFixed(1)} per exercise). Generate a similar-difficulty exercise that reinforces the same concepts:
- Target skill: "${performance.nextSkillToTeach}"
- Include clear examples in the description
- Starter code should have helpful comments but not give away the solution
- This is a reinforcement exercise — similar patterns, different problem`,
      targetSkills: [performance.nextSkillToTeach],
    };
  }

  // Normal progression
  return {
    difficultyAdjustment: 'same',
    instructions: `The user is progressing well (${Math.round(performance.avgPassRate)}% pass rate). Continue building skills:
- Build on demonstrated skills: ${performance.demonstratedSkills.join(', ') || 'none yet'}
- Introduce: "${performance.nextSkillToTeach}"
- Moderate scaffolding in starter code`,
    targetSkills: [performance.nextSkillToTeach],
  };
}

// ============================================================
// Path context for generation prompt
// ============================================================

/**
 * Build the path context section that gets injected into the
 * standard exercise generation prompt.
 */
export function buildPathContext(input: {
  pathTitle: string;
  milestoneTitle: string;
  milestoneDescription: string;
  milestoneSkills: string[];
  milestoneTopics: string[];
  exerciseIndex: number;
  estimatedExercises: number;
  performance: UserPerformance;
  adaptationInstructions: string;
  targetSkills: string[];
  difficultyAdjustment: 'easier' | 'same' | 'harder';
}): string {
  const prevExercise = input.performance.recentExercises[0];

  let previousExerciseSection = '';
  if (prevExercise) {
    previousExerciseSection = `
**Previous exercise in this path:**
- Title: ${prevExercise.title}
- Tests passed: ${prevExercise.testsPassed}/${prevExercise.testsTotal}
- Time spent: ${prevExercise.timeSpentSeconds}s
- Hints used: ${prevExercise.hintsUsed}`;
  }

  return `
## Learning Path Context

This exercise is part of a structured learning path. It should feel like a natural next step in the user's journey, not a random problem.

**Path:** ${input.pathTitle}
**Current milestone:** ${input.milestoneTitle} — ${input.milestoneDescription}
**Target skills for this milestone:** ${input.milestoneSkills.join(', ')}
**Topics to cover:** ${input.milestoneTopics.join(', ')}
**Exercise:** #${input.exerciseIndex + 1} of ~${input.estimatedExercises} in this milestone

**User's performance so far:**
- Exercises completed in this milestone: ${input.performance.exercisesCompleted}
- Average test pass rate: ${Math.round(input.performance.avgPassRate)}%
- Skills demonstrated: ${input.performance.demonstratedSkills.join(', ') || 'none yet'}
- Skills to work on: ${input.performance.strugglingSkills.join(', ') || 'none identified'}
- Average hints used: ${input.performance.avgHintsUsed.toFixed(1)} per exercise
${previousExerciseSection}

**Focus this exercise on:** ${input.targetSkills.join(', ')}
**Difficulty adjustment:** ${input.difficultyAdjustment} (relative to milestone target)

**Adaptation instructions:**
${input.adaptationInstructions}

IMPORTANT: This exercise must teach or reinforce the target skills listed above. It should build naturally on what the user has already demonstrated. Do NOT repeat an exercise the user has already completed — create something new that advances their understanding.`;
}

// ============================================================
// Generation context (stored with the path exercise)
// ============================================================

/**
 * Build the generation context object that gets persisted with the path exercise.
 * This records WHY this particular exercise was generated.
 */
export function buildGenerationContext(
  performance: UserPerformance,
  strategy: ReturnType<typeof getAdaptationStrategy>,
  prevExercise?: RecentExercisePerformance | null
): ExerciseGenerationContext {
  return {
    reasoning: strategy.instructions.split('\n')[0], // First line as summary
    targetSkills: strategy.targetSkills,
    adaptedFromPerformance: prevExercise
      ? {
          prevExerciseId: prevExercise.exerciseId,
          testsFailed: prevExercise.failedTestConcepts,
          avgPassRate: performance.avgPassRate,
        }
      : null,
    difficultyAdjustment: strategy.difficultyAdjustment,
  };
}
