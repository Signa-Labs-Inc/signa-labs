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

import { db } from '@/index';
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
  NextExerciseResult,
  RecordCompletionInput,
  RecordCompletionResult,
} from './paths.types';
import {
  analyzePerformance,
  getAdaptationStrategy,
  buildPathContext,
  buildGenerationContext,
} from './exercise-adapter';
import { PathError } from './paths.types';
import { SubmissionService } from '../submissions/submissions.service';
import { assessSkills } from './skill-assessor';
import { ExerciseGenerationService } from '../generation/generation.service';
import type { GenerateExerciseInput } from '../generation/generation.types';

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
    const env = await resolveEnvironment(input.prompt, input.language);
    const detectedFramework = env.detectedFramework;

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
    const milestone = await reader.getMilestoneById(milestoneId, pathId);
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

    const nextIndex = currentIndex + 1;
    const nextMilestone = milestones.find((m) => m.milestoneIndex === nextIndex);

    const result = await db.transaction(async (tx) => {
      // Complete current milestone
      await writer.updateMilestoneStatus(
        currentMilestone.id,
        'completed',
        { completedAt: new Date() },
        tx
      );

      if (!nextMilestone) {
        // Path completed!
        await writer.updatePathStatus(pathId, 'completed', new Date(), tx);
        return { pathCompleted: true as const, nextMilestoneId: null };
      }

      // Unlock next milestone
      await writer.updateMilestoneStatus(
        nextMilestone.id,
        'active',
        { unlockedAt: new Date() },
        tx
      );
      await writer.advancePathMilestone(pathId, nextIndex, tx);

      return { pathCompleted: false as const, nextMilestoneId: nextMilestone.id };
    });

    return result;
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
    // Path-wide confidence is used for the overall skillsAcquired summary
    const pathSkillConfidence = await reader.getSkillConfidenceMap(pathId);

    const milestoneProgress: MilestoneProgress[] = await Promise.all(
      milestones.map(async (m) => {
        const completedCount = await reader.getCompletedExerciseCount(m.id);
        const gateSkills = (m.skillGates ?? []) as string[];

        // Use milestone-scoped confidence to match shouldAdvanceMilestone logic
        const milestoneConfidence = await reader.getMilestoneSkillConfidenceMap(pathId, m.id);
        const gatesPassed = gateSkills.filter(
          (skill) => (milestoneConfidence.get(skill) ?? 0) >= 0.7
        );
        const gatesRemaining = gateSkills.filter(
          (skill) => (milestoneConfidence.get(skill) ?? 0) < 0.7
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

    const skillsAcquired = Array.from(pathSkillConfidence.entries())
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
      throw new PathError('PATH_NOT_PAUSED', 'Path is not paused');
    }

    await writer.updatePathStatus(pathId, 'active');
  }

  async abandonPath(pathId: string, userId: string): Promise<void> {
    const path = await reader.getPathByIdAndUser(pathId, userId);
    if (!path) throw new PathError('PATH_NOT_FOUND', 'Path not found');

    await writer.updatePathStatus(pathId, 'abandoned');
  }

  /**
   * Generate and return the next exercise in the user's active milestone.
   * The exercise is adaptively generated based on performance history.
   */
  async getNextExercise(pathId: string, userId: string): Promise<NextExerciseResult> {
    const path = await reader.getPathByIdAndUser(pathId, userId);
    if (!path) throw new PathError('PATH_NOT_FOUND', 'Path not found');
    if (path.status !== 'active') {
      throw new PathError('PATH_PAUSED', `Path is ${path.status}`);
    }

    // Get the active milestone
    const milestone = await reader.getActiveMilestone(pathId);
    if (!milestone) {
      throw new PathError('PATH_COMPLETED', 'No active milestone — path may be completed');
    }

    // Check if there's an incomplete exercise already generated
    const milestoneExercises = await reader.getMilestoneExercises(milestone.id);
    const incompleteExercise = milestoneExercises.find((e) => !e.pathExercise.isCompleted);

    if (incompleteExercise) {
      // Return the existing incomplete exercise
      const submissionService = new SubmissionService();
      const { attemptId } = await submissionService.getOrCreateAttempt(
        userId,
        incompleteExercise.exercise.id
      );

      return {
        exerciseId: incompleteExercise.exercise.id,
        attemptId,
        pathExerciseId: incompleteExercise.pathExercise.id,
        milestoneTitle: milestone.title,
        milestoneIndex: milestone.milestoneIndex,
        exerciseIndex: incompleteExercise.pathExercise.exerciseIndex,
        reasoning: 'Continuing incomplete exercise',
      };
    }

    // Analyze performance and determine adaptation strategy
    const performance = await analyzePerformance(pathId, milestone.id);
    const strategy = getAdaptationStrategy(performance);

    // Build the path context for the generation prompt
    const plan = path.plan as LearningPlan;
    const planMilestone = plan.milestones[milestone.milestoneIndex];

    const pathContext = buildPathContext({
      pathTitle: path.title,
      milestoneTitle: milestone.title,
      milestoneDescription: milestone.description,
      milestoneSkills: (milestone.skills ?? []) as string[],
      milestoneTopics: (milestone.topics ?? []) as string[],
      exerciseIndex: milestoneExercises.length,
      estimatedExercises: planMilestone?.estimatedExercises ?? 4,
      performance,
      adaptationInstructions: strategy.instructions,
      targetSkills: strategy.targetSkills,
      difficultyAdjustment: strategy.difficultyAdjustment,
    });

    // Determine effective difficulty
    const baseDifficulty = milestone.targetDifficulty;
    const effectiveDifficulty = this.adjustDifficulty(
      baseDifficulty,
      strategy.difficultyAdjustment
    );

    // Generate the exercise using the existing generation service
    // We pass the path context as an additional prompt section
    const generationService = new ExerciseGenerationService();
    const result = await generationService.generateExercise({
      userId,
      userPrompt: this.buildExercisePrompt(milestone, strategy.targetSkills),
      language: path.language as GenerateExerciseInput['language'],
      difficulty: effectiveDifficulty as GenerateExerciseInput['difficulty'],
      pathContext, // This gets injected into the generation prompt
    });

    // Record the path exercise
    const exerciseIndex = milestoneExercises.length;
    const generationContext = buildGenerationContext(
      performance,
      strategy,
      performance.recentExercises[0] ?? null
    );

    const { pathExerciseId } = await writer.createPathExercise({
      pathId,
      milestoneId: milestone.id,
      exerciseId: result.exerciseId,
      exerciseIndex,
      generationContext,
    });

    return {
      exerciseId: result.exerciseId,
      attemptId: result.attemptId,
      pathExerciseId,
      milestoneTitle: milestone.title,
      milestoneIndex: milestone.milestoneIndex,
      exerciseIndex,
      reasoning: strategy.instructions.split('\n')[0],
    };
  }

  /**
   * Record that the user completed an exercise in a path.
   * Assesses skills, updates progress, and potentially advances the milestone.
   */
  async recordExerciseCompletion(input: RecordCompletionInput): Promise<RecordCompletionResult> {
    const pathExercise = await reader.getPathExerciseById(input.pathExerciseId);
    if (!pathExercise) {
      throw new PathError('PATH_NOT_FOUND', 'Path exercise not found');
    }

    if (pathExercise.isCompleted) {
      return {
        milestoneAdvanced: false,
        pathCompleted: false,
        skillsAssessed: [],
        nextAction: 'continue',
        message: 'Exercise already completed',
      };
    }

    const milestone = await reader.getMilestoneById(pathExercise.milestoneId, input.pathId);
    if (!milestone) {
      throw new PathError('PATH_NOT_FOUND', 'Milestone not found');
    }

    const path = await reader.getPathById(input.pathId);
    if (!path) {
      throw new PathError('PATH_NOT_FOUND', 'Path not found');
    }

    // Assess skills (calls AI, so run outside the transaction)
    const milestoneSkills = (milestone.skills ?? []) as string[];
    const testResults =
      input.testsPassed === input.testsTotal
        ? [{ name: 'all_tests', passed: true }]
        : [
            { name: 'passed_tests', passed: true },
            {
              name: 'failed_tests',
              passed: false,
              error: `${input.testsTotal - input.testsPassed} tests failed`,
            },
          ];

    const skillAssessments = await assessSkills({
      exerciseTitle: path.title,
      exerciseDescription: milestone.description,
      milestoneSkills,
      testsPassed: input.testsPassed,
      testsTotal: input.testsTotal,
      testResults,
      userSolutionCode: input.userSolutionCode,
    });

    // Persist all writes atomically
    await db.transaction(async (tx) => {
      // 1. Mark the path exercise as completed
      await writer.markPathExerciseCompleted(
        input.pathExerciseId,
        {
          testsPassed: input.testsPassed,
          testsTotal: input.testsTotal,
          timeSpentSeconds: input.timeSpentSeconds,
          hintsUsed: input.hintsUsed,
          attemptsCount: 1,
        },
        tx
      );

      // 2. Update milestone and path counters
      await writer.incrementMilestoneExercisesCompleted(milestone.id, tx);
      await writer.incrementPathExercisesCompleted(input.pathId, tx);

      // 3. Store skill assessments
      await writer.createSkillAssessments(
        skillAssessments.map((a) => ({
          pathId: input.pathId,
          milestoneId: milestone.id,
          exerciseId: input.exerciseId,
          skillName: a.skill,
          demonstrated: a.demonstrated,
          confidence: a.confidence,
          evidence: {
            reasoning: a.reasoning,
            testsPassed: input.testsPassed,
            testsTotal: input.testsTotal,
          },
        })),
        tx
      );
    });

    // 5. Check if milestone should advance
    const { advance, reasoning } = await this.shouldAdvanceMilestone(input.pathId, milestone.id);

    if (advance) {
      const { pathCompleted } = await this.advanceMilestone(input.pathId);

      if (pathCompleted) {
        return {
          milestoneAdvanced: true,
          pathCompleted: true,
          skillsAssessed: skillAssessments,
          nextAction: 'path_complete',
          message: `Congratulations! You've completed "${path.title}"!`,
        };
      }

      return {
        milestoneAdvanced: true,
        pathCompleted: false,
        skillsAssessed: skillAssessments,
        nextAction: 'milestone_complete',
        message: `Milestone "${milestone.title}" complete! ${reasoning}`,
      };
    }

    return {
      milestoneAdvanced: false,
      pathCompleted: false,
      skillsAssessed: skillAssessments,
      nextAction: 'continue',
      message: reasoning,
    };
  }

  private adjustDifficulty(base: string, adjustment: 'easier' | 'same' | 'harder'): string {
    const levels = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    const currentIndex = levels.indexOf(base);
    if (currentIndex === -1) return base;

    if (adjustment === 'easier') {
      return levels[Math.max(0, currentIndex - 1)];
    }
    if (adjustment === 'harder') {
      return levels[Math.min(levels.length - 1, currentIndex + 1)];
    }
    return base;
  }

  private buildExercisePrompt(
    milestone: { title: string; description: string; topics: unknown },
    targetSkills: string[]
  ): string {
    const topics = (milestone.topics ?? []) as string[];
    const topicStr = topics.length > 0 ? topics.join(', ') : milestone.description;

    return `Create an exercise for the "${milestone.title}" milestone. Focus on: ${targetSkills.join(', ')}. Topics: ${topicStr}`;
  }
}
