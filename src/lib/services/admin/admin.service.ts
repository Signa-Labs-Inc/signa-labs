import { tasks } from '@trigger.dev/sdk/v3';
import * as reader from './admin.reader';
import * as writer from './admin.writer';
import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/utils/errors';
import type {
  AdminExerciseFilters,
  AdminUserFilters,
  AdminPathFilters,
  CategoryInput,
  PromptTemplateInput,
  AnalyticsData,
} from './admin.types';
import type { generateExerciseTask } from '@/trigger/generate-exercise';
import type { GenerateExerciseInput } from '@/lib/services/generation/generation.types';
import type { ExerciseDifficulty, ExerciseLanguage } from '@/lib/services/exercises/exercises.constants';
import type { LessonContent, SynthesisContent } from '@/lib/services/teaching/teaching.types';

// --- Constants ---------------------------------------------------------------

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'typescript', 'sql', 'go'];
const ALLOWED_ROLES = ['learner', 'admin', 'super_admin'] as const;
type UserRole = (typeof ALLOWED_ROLES)[number];

// --- Helpers -----------------------------------------------------------------

function parsePagination(params: { limit?: string | null; offset?: string | null }) {
  const parsedLimit = parseInt(params.limit ?? '', 10);
  const parsedOffset = parseInt(params.offset ?? '', 10);
  return {
    limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
    offset: Number.isFinite(parsedOffset) ? parsedOffset : undefined,
  };
}

// --- Dashboard & Analytics ---------------------------------------------------

export function getDashboardStats() {
  return reader.getAdminDashboardStats();
}

export function getAnalytics(): Promise<AnalyticsData> {
  return reader.getAnalyticsData();
}

// --- Exercises ---------------------------------------------------------------

export function listExercises(
  filters: AdminExerciseFilters,
  limit?: number,
  offset?: number,
) {
  return reader.listAllExercises(filters, limit, offset);
}

export function getExercise(id: string) {
  return reader.getExerciseForAdmin(id);
}

export async function updateExercise(
  id: string,
  data: {
    title?: string;
    description?: string;
    difficulty?: ExerciseDifficulty;
    language?: ExerciseLanguage;
    tags?: string[];
    isPublic?: boolean;
    isValidated?: boolean;
  },
) {
  const result = await writer.adminUpdateExercise(id, data);
  if (!result) throw new NotFoundError('Exercise not found');
  return result;
}

export async function toggleExerciseValidation(id: string) {
  const result = await writer.adminToggleValidation(id);
  if (!result) throw new NotFoundError('Exercise not found');
  return result;
}

export async function softDeleteExercise(id: string) {
  const result = await writer.adminSoftDeleteExercise(id);
  if (!result) throw new NotFoundError('Exercise not found');
  return result;
}

export async function restoreExercise(id: string) {
  const result = await writer.adminRestoreExercise(id);
  if (!result) throw new NotFoundError('Exercise not found');
  return result;
}

export async function updateExerciseHints(id: string, hints: string[]) {
  const result = await writer.adminUpdateHints(id, hints);
  if (!result) throw new NotFoundError('Exercise not found');
  return result;
}

export async function updateExerciseLessonContent(id: string, lessonContent: LessonContent | null) {
  const result = await writer.adminUpdateLessonContent(id, lessonContent);
  if (!result) throw new NotFoundError('Exercise not found');
  return result;
}

export async function updateExerciseSynthesisContent(id: string, synthesisContent: SynthesisContent | null) {
  const result = await writer.adminUpdateSynthesisContent(id, synthesisContent);
  if (!result) throw new NotFoundError('Exercise not found');
  return result;
}

/** Trigger AI exercise generation as an async background task */
export async function generateExercise(
  userId: string,
  input: {
    prompt: string;
    language: string;
    difficulty?: string;
    exerciseType?: string;
  },
) {
  if (!input.prompt || typeof input.prompt !== 'string' || input.prompt.trim().length < 10) {
    throw new ValidationError('Prompt must be at least 10 characters');
  }
  if (!input.language || !SUPPORTED_LANGUAGES.includes(input.language)) {
    throw new ValidationError(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`);
  }

  const handle = await tasks.trigger<typeof generateExerciseTask>('generate-exercise', {
    userId,
    userPrompt: input.prompt.trim(),
    language: input.language as GenerateExerciseInput['language'],
    difficulty: input.difficulty as GenerateExerciseInput['difficulty'],
    exerciseType: input.exerciseType as GenerateExerciseInput['exerciseType'],
  });

  return { runId: handle.id, publicAccessToken: handle.publicAccessToken };
}

/** Create a platform exercise manually with files */
export function createExerciseManually(
  input: {
    title: string;
    description: string;
    difficulty?: string;
    language: string;
    environmentId: string;
    tags?: string[];
    hints?: string[];
    isValidated?: boolean;
    isPublic?: boolean;
  },
  files: {
    fileType: 'starter' | 'solution' | 'test' | 'support';
    filePath: string;
    fileName: string;
    content: string;
    isEditable: boolean;
    sortOrder: number;
  }[],
) {
  if (!input.title || !input.description || !input.language || !input.environmentId) {
    throw new ValidationError('title, description, language, and environmentId are required');
  }
  if (!SUPPORTED_LANGUAGES.includes(input.language)) {
    throw new ValidationError(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`);
  }

  return writer.createPlatformExercise(
    {
      title: input.title,
      description: input.description,
      difficulty: (input.difficulty ?? 'medium') as ExerciseDifficulty,
      language: input.language as ExerciseLanguage,
      environmentId: input.environmentId,
      tags: input.tags ?? [],
      hints: input.hints ?? [],
      isValidated: input.isValidated ?? false,
      isPublic: input.isPublic ?? false,
    },
    files,
  );
}

// --- Exercise Files ----------------------------------------------------------

export function createExerciseFile(
  exerciseId: string,
  data: {
    fileType: string;
    filePath: string;
    fileName: string;
    content: string;
    isEditable: boolean;
    sortOrder: number;
  },
) {
  return writer.createExerciseFile(exerciseId, data);
}

export async function updateExerciseFile(
  fileId: string,
  data: {
    content?: string;
    filePath?: string;
    fileName?: string;
    isEditable?: boolean;
    sortOrder?: number;
  },
) {
  const result = await writer.updateExerciseFile(fileId, data);
  if (!result) throw new NotFoundError('Exercise file not found');
  return result;
}

export async function deleteExerciseFile(fileId: string) {
  const result = await writer.deleteExerciseFile(fileId);
  if (!result) throw new NotFoundError('Exercise file not found');
  return result;
}

export function replaceExerciseFiles(
  exerciseId: string,
  files: {
    fileType: string;
    filePath: string;
    fileName: string;
    content: string;
    isEditable: boolean;
    sortOrder: number;
  }[],
) {
  return writer.replaceExerciseFiles(exerciseId, files);
}

// --- Categories --------------------------------------------------------------

export function listCategories() {
  return reader.listAllCategories();
}

export function createCategory(input: CategoryInput) {
  return writer.createCategory(input);
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const result = await writer.updateCategory(id, input);
  if (!result) throw new NotFoundError('Category not found');
  return result;
}

export async function deleteCategory(id: string) {
  const result = await writer.deleteCategory(id);
  if (!result) throw new NotFoundError('Category not found');
  return result;
}

export function reorderCategories(orderedIds: string[]) {
  return writer.reorderCategories(orderedIds);
}

// --- Prompt Templates --------------------------------------------------------

export function listTemplates(filters?: { search?: string }) {
  return reader.listAllPromptTemplates(filters);
}

export function createTemplate(input: PromptTemplateInput) {
  return writer.createPromptTemplate(input);
}

export async function updateTemplate(id: string, input: Partial<PromptTemplateInput>) {
  const result = await writer.updatePromptTemplate(id, input);
  if (!result) throw new NotFoundError('Prompt template not found');
  return result;
}

export async function toggleTemplateActive(id: string) {
  const result = await writer.togglePromptTemplateActive(id);
  if (!result) throw new NotFoundError('Prompt template not found');
  return result;
}

// --- Environments ------------------------------------------------------------

export function listEnvironments() {
  return reader.listAllEnvironments();
}

export async function updateEnvironment(
  id: string,
  data: {
    displayName?: string;
    description?: string;
    maxExecutionSeconds?: number;
    maxFiles?: number;
    maxFileSizeBytes?: number;
  },
) {
  const result = await writer.updateEnvironment(id, data);
  if (!result) throw new NotFoundError('Environment not found');
  return result;
}

export async function toggleEnvironmentActive(id: string) {
  const result = await writer.toggleEnvironmentActive(id);
  if (!result) throw new NotFoundError('Environment not found');
  return result;
}

// --- Learning Paths ----------------------------------------------------------

export function listPaths(filters: AdminPathFilters, limit?: number, offset?: number) {
  return reader.listAllLearningPaths(filters, limit, offset);
}

// --- Users -------------------------------------------------------------------

export function listUsers(filters: AdminUserFilters, limit?: number, offset?: number) {
  return reader.listAllUsers(filters, limit, offset);
}

/** Update a user's role with validation and self-demotion prevention */
export async function updateUserRole(
  currentUserId: string,
  targetUserId: string,
  role: string,
) {
  if (!role || !ALLOWED_ROLES.includes(role as UserRole)) {
    throw new ValidationError(`role must be one of: ${ALLOWED_ROLES.join(', ')}`);
  }

  if (targetUserId === currentUserId) {
    throw new ForbiddenError('You cannot change your own role');
  }

  const result = await writer.updateUserRole(targetUserId, role as UserRole);
  if (!result) throw new NotFoundError('User not found');
  return result;
}

// --- Re-exports for convenience ----------------------------------------------

export { parsePagination, SUPPORTED_LANGUAGES, ALLOWED_ROLES };
