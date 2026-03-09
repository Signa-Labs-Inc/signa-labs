/**
 * Path Reader
 *
 * All database reads for learning paths.
 */

import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { db } from '@/index';
import { learningPaths } from '@/db/schema/tables/learning_paths';
import { pathMilestones } from '@/db/schema/tables/path_milestones';
import { pathExercises } from '@/db/schema/tables/path_exercises';
import { pathSkillAssessments } from '@/db/schema/tables/path_skill_assessments';
import { exercises } from '@/db/schema/tables/exercises';

// ============================================================
// Paths
// ============================================================

export async function getPathById(pathId: string) {
  const [path] = await db.select().from(learningPaths).where(eq(learningPaths.id, pathId)).limit(1);

  return path ?? null;
}

export async function getPathByIdAndUser(pathId: string, userId: string) {
  const [path] = await db
    .select()
    .from(learningPaths)
    .where(and(eq(learningPaths.id, pathId), eq(learningPaths.userId, userId)))
    .limit(1);

  return path ?? null;
}

export async function getUserPaths(userId: string) {
  return db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.userId, userId))
    .orderBy(desc(learningPaths.updatedAt));
}

export async function getUserActivePaths(userId: string) {
  return db
    .select()
    .from(learningPaths)
    .where(and(eq(learningPaths.userId, userId), eq(learningPaths.status, 'active')))
    .orderBy(desc(learningPaths.updatedAt));
}

// ============================================================
// Milestones
// ============================================================

export async function getMilestonesByPath(pathId: string) {
  return db
    .select()
    .from(pathMilestones)
    .where(eq(pathMilestones.pathId, pathId))
    .orderBy(pathMilestones.milestoneIndex);
}

export async function getMilestoneById(milestoneId: string, pathId?: string) {
  const conditions = [eq(pathMilestones.id, milestoneId)];
  if (pathId) conditions.push(eq(pathMilestones.pathId, pathId));

  const [milestone] = await db
    .select()
    .from(pathMilestones)
    .where(and(...conditions))
    .limit(1);

  return milestone ?? null;
}

export async function getActiveMilestone(pathId: string) {
  const [milestone] = await db
    .select()
    .from(pathMilestones)
    .where(and(eq(pathMilestones.pathId, pathId), eq(pathMilestones.status, 'active')))
    .limit(1);

  return milestone ?? null;
}

// ============================================================
// Path exercises
// ============================================================

export async function getMilestoneExercises(milestoneId: string) {
  return db
    .select({
      pathExercise: pathExercises,
      exercise: exercises,
    })
    .from(pathExercises)
    .innerJoin(exercises, eq(pathExercises.exerciseId, exercises.id))
    .where(eq(pathExercises.milestoneId, milestoneId))
    .orderBy(pathExercises.exerciseIndex);
}

export async function getPathExerciseById(pathExerciseId: string) {
  const [result] = await db
    .select()
    .from(pathExercises)
    .where(eq(pathExercises.id, pathExerciseId))
    .limit(1);

  return result ?? null;
}

export async function getPathExerciseCount(milestoneId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pathExercises)
    .where(eq(pathExercises.milestoneId, milestoneId));

  return result?.count ?? 0;
}

export async function getCompletedExerciseCount(milestoneId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pathExercises)
    .where(and(eq(pathExercises.milestoneId, milestoneId), eq(pathExercises.isCompleted, true)));

  return result?.count ?? 0;
}

export async function getLatestPathExercise(milestoneId: string) {
  const [result] = await db
    .select()
    .from(pathExercises)
    .where(eq(pathExercises.milestoneId, milestoneId))
    .orderBy(desc(pathExercises.exerciseIndex))
    .limit(1);

  return result ?? null;
}

export async function getRecentPathExercises(pathId: string, limit: number = 5) {
  return db
    .select({
      pathExercise: pathExercises,
      exercise: exercises,
    })
    .from(pathExercises)
    .innerJoin(exercises, eq(pathExercises.exerciseId, exercises.id))
    .where(and(eq(pathExercises.pathId, pathId), eq(pathExercises.isCompleted, true)))
    .orderBy(desc(pathExercises.completedAt))
    .limit(limit);
}

// ============================================================
// Skill assessments
// ============================================================

export async function getSkillAssessments(pathId: string, milestoneId: string) {
  return db
    .select()
    .from(pathSkillAssessments)
    .where(
      and(
        eq(pathSkillAssessments.pathId, pathId),
        eq(pathSkillAssessments.milestoneId, milestoneId)
      )
    )
    .orderBy(desc(pathSkillAssessments.assessedAt));
}

export async function getAllPathSkillAssessments(pathId: string) {
  return db
    .select()
    .from(pathSkillAssessments)
    .where(eq(pathSkillAssessments.pathId, pathId))
    .orderBy(desc(pathSkillAssessments.assessedAt));
}

/**
 * Get the highest-confidence assessment for each skill within a specific milestone.
 */
export async function getMilestoneSkillConfidenceMap(
  pathId: string,
  milestoneId: string
): Promise<Map<string, number>> {
  const assessments = await db
    .select({
      skillName: pathSkillAssessments.skillName,
      maxConfidence: sql<number>`max(${pathSkillAssessments.confidence})`,
    })
    .from(pathSkillAssessments)
    .where(
      and(
        eq(pathSkillAssessments.pathId, pathId),
        eq(pathSkillAssessments.milestoneId, milestoneId),
        eq(pathSkillAssessments.demonstrated, true)
      )
    )
    .groupBy(pathSkillAssessments.skillName);

  const map = new Map<string, number>();
  for (const row of assessments) {
    map.set(row.skillName, row.maxConfidence);
  }
  return map;
}

/**
 * Get the highest-confidence assessment for each skill across the entire path.
 */
export async function getSkillConfidenceMap(pathId: string): Promise<Map<string, number>> {
  const assessments = await db
    .select({
      skillName: pathSkillAssessments.skillName,
      maxConfidence: sql<number>`max(${pathSkillAssessments.confidence})`,
    })
    .from(pathSkillAssessments)
    .where(
      and(eq(pathSkillAssessments.pathId, pathId), eq(pathSkillAssessments.demonstrated, true))
    )
    .groupBy(pathSkillAssessments.skillName);

  const map = new Map<string, number>();
  for (const row of assessments) {
    map.set(row.skillName, row.maxConfidence);
  }
  return map;
}
