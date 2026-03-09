/**
 * Path Types
 *
 * Types for the adaptive learning paths feature.
 */

// ============================================================
// Plan structure (stored as JSONB in learning_paths.plan)
// ============================================================

export interface LearningPlan {
  overview: string;
  estimatedDurationHours: number;
  milestones: PlanMilestone[];
}

export interface PlanMilestone {
  index: number;
  title: string;
  description: string;
  skills: string[];
  skillGates: string[];
  topics: string[];
  targetDifficulty: string;
  estimatedExercises: number;
}

// ============================================================
// Path creation
// ============================================================

export interface CreatePathInput {
  userId: string;
  prompt: string;
  startingLevel: 'beginner' | 'some_experience' | 'intermediate' | 'advanced';
  language: string;
}

export interface CreatePathResult {
  pathId: string;
  title: string;
  plan: LearningPlan;
  totalMilestones: number;
  estimatedTotalExercises: number;
}

// ============================================================
// Exercise generation within a path
// ============================================================

export interface NextExerciseResult {
  exerciseId: string;
  attemptId: string;
  pathExerciseId: string;
  milestoneTitle: string;
  milestoneIndex: number;
  exerciseIndex: number;
  reasoning: string;
}

export interface ExerciseGenerationContext {
  reasoning: string;
  targetSkills: string[];
  adaptedFromPerformance: {
    prevExerciseId?: string;
    testsFailed?: string[];
    avgPassRate?: number;
  } | null;
  difficultyAdjustment: 'easier' | 'same' | 'harder';
}

// ============================================================
// Exercise completion
// ============================================================

export interface RecordCompletionInput {
  pathId: string;
  pathExerciseId: string;
  exerciseId: string;
  attemptId: string;
  testsPassed: number;
  testsTotal: number;
  timeSpentSeconds: number;
  hintsUsed: number;
  userSolutionCode: string;
}

export interface RecordCompletionResult {
  milestoneAdvanced: boolean;
  pathCompleted: boolean;
  skillsAssessed: SkillAssessment[];
  nextAction: 'continue' | 'milestone_complete' | 'path_complete';
  message: string;
}

// ============================================================
// Skill assessment
// ============================================================

export interface SkillAssessment {
  skill: string;
  demonstrated: boolean;
  confidence: number;
  reasoning: string;
}

// ============================================================
// User performance (for adaptive generation)
// ============================================================

export interface UserPerformance {
  exercisesCompleted: number;
  avgPassRate: number;
  avgTimeSeconds: number;
  avgHintsUsed: number;
  demonstratedSkills: string[];
  strugglingSkills: string[];
  nextSkillToTeach: string;
  weakestSkill: string | null;
  recentExercises: RecentExercisePerformance[];
}

export interface RecentExercisePerformance {
  exerciseId: string;
  title: string;
  testsPassed: number;
  testsTotal: number;
  timeSpentSeconds: number;
  hintsUsed: number;
  failedTestConcepts: string[];
}

// ============================================================
// Progress views
// ============================================================

export interface PathProgress {
  id: string;
  title: string;
  status: string;
  language: string;
  currentMilestoneIndex: number;
  totalMilestones: number;
  totalExercisesCompleted: number;
  estimatedTotalExercises: number;
  percentComplete: number;
  milestones: MilestoneProgress[];
  skillsAcquired: { skill: string; confidence: number }[];
  createdAt: Date;
}

export interface MilestoneProgress {
  id: string;
  index: number;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'completed';
  targetDifficulty: string;
  skills: string[];
  skillGates: string[];
  exercisesCompleted: number;
  minExercises: number;
  maxExercises: number;
  gatesPassed: string[];
  gatesRemaining: string[];
}

export interface PathSummary {
  id: string;
  title: string;
  language: string;
  status: string;
  percentComplete: number;
  totalExercisesCompleted: number;
  estimatedTotalExercises: number;
  currentMilestoneTitle: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Errors
// ============================================================

export class PathError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'PathError';
  }

  get httpStatus(): number {
    switch (this.code) {
      case 'PATH_NOT_FOUND':
        return 404;
      case 'PATH_COMPLETED':
      case 'PATH_PAUSED':
      case 'MILESTONE_COMPLETED':
        return 400;
      case 'PLAN_GENERATION_FAILED':
      case 'EXERCISE_GENERATION_FAILED':
        return 500;
      default:
        return 500;
    }
  }
}
