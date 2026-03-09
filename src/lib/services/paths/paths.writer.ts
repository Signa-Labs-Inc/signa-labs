/**
 * Path Writer
 *
 * All database writes for learning paths.
 */

import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/index';
import { learningPaths } from '@/db/schema/tables/learning_paths';
import { pathMilestones } from '@/db/schema/tables/path_milestones';
import { pathExercises } from '@/db/schema/tables/path_exercises';
import { pathSkillAssessments } from '@/db/schema/tables/path_skill_assessments';
import type { LearningPlan, ExerciseGenerationContext, SkillAssessment } from './paths.types';

/** Transaction-compatible db handle. */
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | Tx;

// ============================================================
// Path creation
// ============================================================

/**
 * Create a learning path with all its milestones in a transaction.
 */
export async function createPathWithMilestones(input: {
  userId: string;
  title: string;
  userPrompt: string;
  startingLevel: string;
  language: string;
  detectedFramework?: string | null;
  plan: LearningPlan;
  llmModel: string;
  planGenerationTimeMs: number;
}): Promise<{ pathId: string }> {
  const totalEstimatedExercises = input.plan.milestones.reduce(
    (sum, m) => sum + m.estimatedExercises,
    0
  );

  return db.transaction(async (tx) => {
    // Create path
    const [path] = await tx
      .insert(learningPaths)
      .values({
        userId: input.userId,
        title: input.title,
        userPrompt: input.userPrompt,
        startingLevel: input.startingLevel,
        language: input.language,
        detectedFramework: input.detectedFramework ?? null,
        plan: input.plan,
        status: 'active',
        currentMilestoneIndex: 0,
        totalMilestones: input.plan.milestones.length,
        totalExercisesCompleted: 0,
        estimatedTotalExercises: totalEstimatedExercises,
        llmModel: input.llmModel,
        planGenerationTimeMs: input.planGenerationTimeMs,
      })
      .returning({ id: learningPaths.id });

    const pathId = path.id;

    // Create milestones — first one is 'active', rest are 'locked'
    for (const milestone of input.plan.milestones) {
      await tx.insert(pathMilestones).values({
        pathId,
        milestoneIndex: milestone.index,
        title: milestone.title,
        description: milestone.description,
        skills: milestone.skills,
        skillGates: milestone.skillGates,
        topics: milestone.topics,
        targetDifficulty: milestone.targetDifficulty,
        minExercises: Math.max(2, Math.min(milestone.estimatedExercises - 1, 3)),
        maxExercises: Math.max(milestone.estimatedExercises + 2, 8),
        status: milestone.index === 0 ? 'active' : 'locked',
        unlockedAt: milestone.index === 0 ? new Date() : null,
      });
    }

    return { pathId };
  });
}

// ============================================================
// Path updates
// ============================================================

export async function updatePathStatus(
  pathId: string,
  status: string,
  completedAt?: Date,
  txOrDb: DbOrTx = db
): Promise<void> {
  await txOrDb
    .update(learningPaths)
    .set({
      status,
      ...(completedAt && { completedAt }),
    })
    .where(eq(learningPaths.id, pathId));
}

export async function advancePathMilestone(
  pathId: string,
  newMilestoneIndex: number,
  txOrDb: DbOrTx = db
): Promise<void> {
  await txOrDb
    .update(learningPaths)
    .set({ currentMilestoneIndex: newMilestoneIndex })
    .where(eq(learningPaths.id, pathId));
}

export async function incrementPathExercisesCompleted(pathId: string): Promise<void> {
  await db
    .update(learningPaths)
    .set({
      totalExercisesCompleted: sql`${learningPaths.totalExercisesCompleted} + 1`,
    })
    .where(eq(learningPaths.id, pathId));
}

// ============================================================
// Milestone updates
// ============================================================

export async function updateMilestoneStatus(
  milestoneId: string,
  status: string,
  timestamps?: { unlockedAt?: Date; completedAt?: Date },
  txOrDb: DbOrTx = db
): Promise<void> {
  await txOrDb
    .update(pathMilestones)
    .set({
      status,
      ...(timestamps?.unlockedAt && { unlockedAt: timestamps.unlockedAt }),
      ...(timestamps?.completedAt && { completedAt: timestamps.completedAt }),
    })
    .where(eq(pathMilestones.id, milestoneId));
}

export async function incrementMilestoneExercisesCompleted(milestoneId: string): Promise<void> {
  await db
    .update(pathMilestones)
    .set({
      exercisesCompleted: sql`${pathMilestones.exercisesCompleted} + 1`,
    })
    .where(eq(pathMilestones.id, milestoneId));
}

// ============================================================
// Path exercises
// ============================================================

export async function createPathExercise(input: {
  pathId: string;
  milestoneId: string;
  exerciseId: string;
  exerciseIndex: number;
  generationContext: ExerciseGenerationContext;
}): Promise<{ pathExerciseId: string }> {
  const [result] = await db
    .insert(pathExercises)
    .values({
      pathId: input.pathId,
      milestoneId: input.milestoneId,
      exerciseId: input.exerciseId,
      exerciseIndex: input.exerciseIndex,
      generationContext: input.generationContext,
    })
    .returning({ id: pathExercises.id });

  return { pathExerciseId: result.id };
}

export async function markPathExerciseCompleted(
  pathExerciseId: string,
  results: {
    testsPassed: number;
    testsTotal: number;
    timeSpentSeconds: number;
    hintsUsed: number;
    attemptsCount: number;
  }
): Promise<void> {
  await db
    .update(pathExercises)
    .set({
      isCompleted: true,
      testsPassed: results.testsPassed,
      testsTotal: results.testsTotal,
      timeSpentSeconds: results.timeSpentSeconds,
      hintsUsed: results.hintsUsed,
      attemptsCount: results.attemptsCount,
      completedAt: new Date(),
    })
    .where(eq(pathExercises.id, pathExerciseId));
}

// ============================================================
// Skill assessments
// ============================================================

export async function createSkillAssessments(
  assessments: {
    pathId: string;
    milestoneId: string;
    exerciseId: string;
    skillName: string;
    demonstrated: boolean;
    confidence: number;
    evidence: Record<string, unknown>;
  }[]
): Promise<void> {
  if (assessments.length === 0) return;

  await db.insert(pathSkillAssessments).values(assessments);
}
