/**
 * Path Service
 *
 * Orchestrates adaptive learning paths:
 *   - Create paths from user prompts
 *   - Generate adaptive exercises
 *   - Assess skills after completion
 *   - Advance milestones when skill gates are passed
 *   - Track progress
 */

import * as reader from './paths.reader';
import * as writer from './paths.writer';
import { generateLearningPlan } from './plan-generator';
import { resolveEnvironment } from '@/lib/services/generation/environment-resolver';
import type {
  CreatePathInput,
  CreatePathResult,
  PathProgress,
  MilestoneProgress,
  PathSummary,
  LearningPlan,
} from './paths.types';
import { PathError } from './paths.types';

const LLM_MODEL = process.env.GENERATION_LLM_MODEL ?? 'claude-sonnet-4-20250514';

export class PathService {
  // ============================================================
  // Path creation
  // ============================================================

  /**
   * Create a new learning path from a user's prompt.
   * AI generates the full plan with milestones, then we persist it.
   */
  async createPath(input: CreatePathInput): Promise<CreatePathResult> {
    // Detect framework from the prompt
    let detectedFramework: string | null = null;
    try {
      const env = await resolveEnvironment(input.prompt, input.language);
      detectedFramework = env.detectedFramework;
    } catch {
      // No framework detected — that's fine
    }

    // Generate the learning plan via AI
    const { plan, title, generationTimeMs } = await generateLearningPlan({
      userPrompt: input.prompt,
      language: input.language,
      startingLevel: input.startingLevel,
      detectedFramework,
    });

    // Persist path + milestones
    const { pathId } = await writer.createPathWithMilestones({
      userId: input.userId,
      title,
      userPrompt: input.prompt,
      startingLevel: input.startingLevel,
      language: input.language,
      detectedFramework,
      plan,
      llmModel: LLM_MODEL,
      planGenerationTimeMs: generationTimeMs,
    });

    const totalEstimatedExercises = plan.milestones.reduce(
      (sum, m) => sum + m.estimatedExercises,
      0
    );

    return {
      pathId,
      title,
      plan,
      totalMilestones: plan.milestones.length,
      estimatedTotalExercises: totalEstimatedExercises,
    };
  }

  // ============================================================
  // Milestone management
  // ============================================================

  /**
   * Check if the current milestone should be advanced.
   * Returns advance decision with reasoning.
   */
  async shouldAdvanceMilestone(
    pathId: string,
    milestoneId: string
  ): Promise<{ advance: boolean; reasoning: string }> {
    const milestone = await reader.getMilestoneById(milestoneId);
    if (!milestone) {
      return { advance: false, reasoning: 'Milestone not found' };
    }

    const assessments = await reader.getSkillAssessments(pathId, milestoneId);
    const completedCount = await reader.getCompletedExerciseCount(milestoneId);

    // Check skill gates
    const gateSkills = (milestone.skillGates ?? []) as string[];
    const demonstratedGates = gateSkills.filter((skill) => {
      const skillAssessments = assessments.filter((a) => a.skillName === skill && a.demonstrated);
      return skillAssessments.some((a) => a.confidence >= 0.7);
    });

    const allGatesPassed = demonstratedGates.length === gateSkills.length;
    const meetsMinimum = completedCount >= milestone.minExercises;
    const hitsMaximum = completedCount >= milestone.maxExercises;

    if (allGatesPassed && meetsMinimum) {
      return {
        advance: true,
        reasoning: 'All skill gates passed with sufficient practice',
      };
    }

    if (hitsMaximum) {
      return {
        advance: true,
        reasoning: 'Maximum exercises reached — advancing to maintain momentum',
      };
    }

    const missingSkills = gateSkills.filter((s) => !demonstratedGates.includes(s));
    return {
      advance: false,
      reasoning: `Still needs to demonstrate: ${missingSkills.join(', ')}`,
    };
  }

  /**
   * Advance to the next milestone. Completes the current milestone,
   * unlocks the next one, and updates the path.
   */
  async advanceMilestone(pathId: string): Promise<{
    pathCompleted: boolean;
    nextMilestoneId: string | null;
  }> {
    const path = await reader.getPathById(pathId);
    if (!path) throw new PathError('PATH_NOT_FOUND', 'Path not found');

    const milestones = await reader.getMilestonesByPath(pathId);
    const currentIndex = path.currentMilestoneIndex;
    const currentMilestone = milestones.find((m) => m.milestoneIndex === currentIndex);

    if (!currentMilestone) {
      throw new PathError('PATH_NOT_FOUND', 'Current milestone not found');
    }

    // Complete current milestone
    await writer.updateMilestoneStatus(currentMilestone.id, 'completed', {
      completedAt: new Date(),
    });

    // Check if this was the last milestone
    const nextIndex = currentIndex + 1;
    const nextMilestone = milestones.find((m) => m.milestoneIndex === nextIndex);

    if (!nextMilestone) {
      // Path completed!
      await writer.updatePathStatus(pathId, 'completed', new Date());
      return { pathCompleted: true, nextMilestoneId: null };
    }

    // Unlock next milestone
    await writer.updateMilestoneStatus(nextMilestone.id, 'active', {
      unlockedAt: new Date(),
    });
    await writer.advancePathMilestone(pathId, nextIndex);

    return { pathCompleted: false, nextMilestoneId: nextMilestone.id };
  }

  // ============================================================
  // Progress
  // ============================================================

  /**
   * Get detailed progress for a path including milestones and skills.
   */
  async getPathProgress(pathId: string, userId: string): Promise<PathProgress> {
    const path = await reader.getPathByIdAndUser(pathId, userId);
    if (!path) throw new PathError('PATH_NOT_FOUND', 'Path not found');

    const milestones = await reader.getMilestonesByPath(pathId);
    const skillConfidence = await reader.getSkillConfidenceMap(pathId);

    const milestoneProgress: MilestoneProgress[] = await Promise.all(
      milestones.map(async (m) => {
        const completedCount = await reader.getCompletedExerciseCount(m.id);
        const gateSkills = (m.skillGates ?? []) as string[];

        const gatesPassed = gateSkills.filter((skill) => (skillConfidence.get(skill) ?? 0) >= 0.7);
        const gatesRemaining = gateSkills.filter(
          (skill) => (skillConfidence.get(skill) ?? 0) < 0.7
        );

        return {
          id: m.id,
          index: m.milestoneIndex,
          title: m.title,
          description: m.description,
          status: m.status as 'locked' | 'active' | 'completed',
          targetDifficulty: m.targetDifficulty,
          skills: (m.skills ?? []) as string[],
          skillGates: gateSkills,
          exercisesCompleted: completedCount,
          minExercises: m.minExercises,
          maxExercises: m.maxExercises,
          gatesPassed,
          gatesRemaining,
        };
      })
    );

    const totalCompleted = path.totalExercisesCompleted;
    const totalEstimated = path.estimatedTotalExercises;
    const percentComplete =
      totalEstimated > 0 ? Math.round((totalCompleted / totalEstimated) * 100) : 0;

    const skillsAcquired = Array.from(skillConfidence.entries())
      .map(([skill, confidence]) => ({ skill, confidence }))
      .sort((a, b) => b.confidence - a.confidence);

    return {
      id: path.id,
      title: path.title,
      status: path.status,
      language: path.language,
      currentMilestoneIndex: path.currentMilestoneIndex,
      totalMilestones: path.totalMilestones,
      totalExercisesCompleted: totalCompleted,
      estimatedTotalExercises: totalEstimated,
      percentComplete: Math.min(percentComplete, 100),
      milestones: milestoneProgress,
      skillsAcquired,
      createdAt: path.createdAt,
    };
  }

  /**
   * Get summary list of all user's paths.
   */
  async getUserPaths(userId: string): Promise<PathSummary[]> {
    const paths = await reader.getUserPaths(userId);
    const milestones = await Promise.all(paths.map((p) => reader.getMilestonesByPath(p.id)));

    return paths.map((path, i) => {
      const pathMilestones = milestones[i];
      const currentMilestone = pathMilestones.find(
        (m) => m.milestoneIndex === path.currentMilestoneIndex
      );

      const percentComplete =
        path.estimatedTotalExercises > 0
          ? Math.round((path.totalExercisesCompleted / path.estimatedTotalExercises) * 100)
          : 0;

      return {
        id: path.id,
        title: path.title,
        language: path.language,
        status: path.status,
        percentComplete: Math.min(percentComplete, 100),
        totalExercisesCompleted: path.totalExercisesCompleted,
        estimatedTotalExercises: path.estimatedTotalExercises,
        currentMilestoneTitle: currentMilestone?.title ?? 'Completed',
        createdAt: path.createdAt,
        updatedAt: path.updatedAt,
      };
    });
  }

  // ============================================================
  // Path lifecycle
  // ============================================================

  async pausePath(pathId: string, userId: string): Promise<void> {
    const path = await reader.getPathByIdAndUser(pathId, userId);
    if (!path) throw new PathError('PATH_NOT_FOUND', 'Path not found');
    if (path.status !== 'active') {
      throw new PathError('PATH_PAUSED', 'Path is not active');
    }

    await writer.updatePathStatus(pathId, 'paused');
  }

  async resumePath(pathId: string, userId: string): Promise<void> {
    const path = await reader.getPathByIdAndUser(pathId, userId);
    if (!path) throw new PathError('PATH_NOT_FOUND', 'Path not found');
    if (path.status !== 'paused') {
      throw new PathError('PATH_NOT_FOUND', 'Path is not paused');
    }

    await writer.updatePathStatus(pathId, 'active');
  }

  async abandonPath(pathId: string, userId: string): Promise<void> {
    const path = await reader.getPathByIdAndUser(pathId, userId);
    if (!path) throw new PathError('PATH_NOT_FOUND', 'Path not found');

    await writer.updatePathStatus(pathId, 'abandoned');
  }
}
