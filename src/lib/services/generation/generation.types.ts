/**
 * Generation Types
 *
 * Types for the AI exercise generation pipeline.
 */

import type { SandboxResult } from '@/lib/sandboxes/types';
import type {
  ExerciseDifficulty,
  ExerciseLanguage,
} from '@/lib/services/exercises/exercises.constants';
import type { LessonContent, SynthesisContent } from '@/lib/services/teaching/teaching.types';
import { AppError } from '@/lib/utils/errors';

// ============================================================
// Input types
// ============================================================

export interface GenerateExerciseInput {
  userId: string;
  userPrompt: string;
  language: 'python' | 'javascript' | 'typescript' | 'sql' | 'go';
  difficulty?: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  exerciseType?:
    | 'algorithm'
    | 'debugging'
    | 'build'
    | 'refactor'
    | 'query'
    | 'api'
    | 'data_pipeline'
    | 'config';
  templateId?: string;
  pathContext?: string; // Injected by the adaptive paths system
}

// ============================================================
// Output types
// ============================================================

export interface GenerateExerciseResult {
  exerciseId: string;
  attemptId: string;
  title: string;
  validationPassed: boolean;
}

// ============================================================
// LLM response shape
// ============================================================

export interface LLMExerciseOutput {
  title: string;
  description: string;
  hints: string[];
  tags: string[];
  starterFiles: LLMFileOutput[];
  solutionFiles: LLMFileOutput[];
  testFiles: LLMFileOutput[];
  supportFiles?: LLMFileOutput[];
  lessonContent?: LessonContent;
  synthesisContent?: SynthesisContent;
}

export interface LLMFileOutput {
  filePath: string;
  fileName: string;
  content: string;
}

// ============================================================
// Internal types
// ============================================================

export interface ExerciseFileInsert {
  fileType: 'starter' | 'solution' | 'test' | 'support';
  filePath: string;
  fileName: string;
  content: string;
  isEditable: boolean;
  sortOrder: number;
}

export interface CreateGeneratedExerciseInput {
  userId: string;
  userPrompt: string;
  title: string;
  description: string;
  language: ExerciseLanguage;
  difficulty: ExerciseDifficulty;
  environmentId: string;
  hints: string[];
  tags: string[];
  llmModel: string;
  llmParameters: Record<string, unknown>;
  generationTimeMs: number;
  isValidated: boolean;
  validationOutput: SandboxResult | null;
  templateId?: string;
  lessonContent?: LessonContent | null;
  synthesisContent?: SynthesisContent | null;
}

export interface CreateGeneratedExerciseResult {
  id: string;
}

// ============================================================
// Prompt template types
// ============================================================

export interface PromptTemplateRecord {
  id: string;
  name: string;
  templateText: string;
  exerciseType: string;
  supportedLanguages: string[] | null;
  environmentId: string | null;
}

// ============================================================
// Error handling
// ============================================================

export type GenerationErrorCode =
  | 'GENERATION_FAILED'
  | 'VALIDATION_FAILED'
  | 'INVALID_LLM_RESPONSE'
  | 'RATE_LIMITED'
  | 'ENVIRONMENT_NOT_FOUND'
  | 'TEMPLATE_NOT_FOUND'
  | 'PROMPT_TOO_SHORT'
  | 'PROMPT_TOO_LONG';

const GENERATION_ERROR_STATUS: Record<GenerationErrorCode, number> = {
  PROMPT_TOO_SHORT: 400,
  PROMPT_TOO_LONG: 400,
  INVALID_LLM_RESPONSE: 400,
  ENVIRONMENT_NOT_FOUND: 404,
  TEMPLATE_NOT_FOUND: 404,
  RATE_LIMITED: 429,
  GENERATION_FAILED: 502,
  VALIDATION_FAILED: 502,
};

export class GenerationError extends AppError {
  constructor(code: GenerationErrorCode, message: string) {
    super(message, code, GENERATION_ERROR_STATUS[code] ?? 500);
    this.name = 'GenerationError';
  }
}
