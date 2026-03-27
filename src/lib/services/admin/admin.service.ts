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
  AnalyticsFilters,
} from './admin.types';
import type { generateExerciseTask } from '@/trigger/generate-exercise';
import type { GenerateExerciseInput } from '@/lib/services/generation/generation.types';
import type {
  ExerciseDifficulty,
  ExerciseLanguage,
} from '@/lib/services/exercises/exercises.constants';
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

export function getAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsData> {
  return reader.getAnalyticsData(filters);
}

// --- Exercises ---------------------------------------------------------------

export function listExercises(filters: AdminExerciseFilters, limit?: number, offset?: number) {
  return reader.listAllExercises(filters, limit, offset);
}

export function getExercise(id: string) {
  return reader.getExerciseForAdmin(id);
}

export async function updateExercise(id: string, raw: Record<string, unknown>) {
  const ALLOWED_DIFFICULTIES = ['beginner', 'easy', 'medium', 'hard', 'expert'];

  const data: {
    title?: string;
    description?: string;
    difficulty?: ExerciseDifficulty;
    language?: ExerciseLanguage;
    tags?: string[];
    isPublic?: boolean;
    isValidated?: boolean;
  } = {};

  if (raw.title !== undefined) {
    if (typeof raw.title !== 'string' || !raw.title.trim())
      throw new ValidationError('title must be a non-empty string');
    data.title = raw.title.trim();
  }
  if (raw.description !== undefined) {
    if (typeof raw.description !== 'string')
      throw new ValidationError('description must be a string');
    data.description = raw.description;
  }
  if (raw.difficulty !== undefined) {
    if (!ALLOWED_DIFFICULTIES.includes(raw.difficulty as string))
      throw new ValidationError(`difficulty must be one of: ${ALLOWED_DIFFICULTIES.join(', ')}`);
    data.difficulty = raw.difficulty as ExerciseDifficulty;
  }
  if (raw.language !== undefined) {
    if (!SUPPORTED_LANGUAGES.includes(raw.language as string))
      throw new ValidationError(`language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`);
    data.language = raw.language as ExerciseLanguage;
  }
  if (raw.tags !== undefined) {
    if (!Array.isArray(raw.tags) || !raw.tags.every((t) => typeof t === 'string'))
      throw new ValidationError('tags must be an array of strings');
    data.tags = raw.tags;
  }
  if (raw.isPublic !== undefined) {
    if (typeof raw.isPublic !== 'boolean') throw new ValidationError('isPublic must be a boolean');
    data.isPublic = raw.isPublic;
  }
  if (raw.isValidated !== undefined) {
    if (typeof raw.isValidated !== 'boolean')
      throw new ValidationError('isValidated must be a boolean');
    data.isValidated = raw.isValidated;
  }

  if (Object.keys(data).length === 0) throw new ValidationError('No valid fields provided');

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

export async function updateExerciseSynthesisContent(
  id: string,
  synthesisContent: SynthesisContent | null
) {
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
  }
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
    origin: 'platform',
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
  }[]
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
    files
  );
}

// --- Exercise Files ----------------------------------------------------------

const ALLOWED_FILE_TYPES = ['starter', 'solution', 'test', 'support'];

function validateExerciseFileInput(raw: Record<string, unknown>) {
  if (typeof raw.fileType !== 'string' || !ALLOWED_FILE_TYPES.includes(raw.fileType)) {
    throw new ValidationError(`fileType must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`);
  }
  if (typeof raw.filePath !== 'string' || !raw.filePath.trim()) {
    throw new ValidationError('filePath must be a non-empty string');
  }
  if (typeof raw.fileName !== 'string' || !raw.fileName.trim()) {
    throw new ValidationError('fileName must be a non-empty string');
  }
  if (typeof raw.content !== 'string') {
    throw new ValidationError('content must be a string');
  }
  if (typeof raw.isEditable !== 'boolean') {
    throw new ValidationError('isEditable must be a boolean');
  }
  if (typeof raw.sortOrder !== 'number' || !Number.isFinite(raw.sortOrder)) {
    throw new ValidationError('sortOrder must be a finite number');
  }
  return {
    fileType: raw.fileType,
    filePath: raw.filePath.trim(),
    fileName: raw.fileName.trim(),
    content: raw.content,
    isEditable: raw.isEditable,
    sortOrder: raw.sortOrder,
  };
}

export function createExerciseFile(exerciseId: string, raw: Record<string, unknown>) {
  const data = validateExerciseFileInput(raw);
  return writer.createExerciseFile(exerciseId, data);
}

export async function updateExerciseFile(fileId: string, raw: Record<string, unknown>) {
  const data: {
    content?: string;
    filePath?: string;
    fileName?: string;
    isEditable?: boolean;
    sortOrder?: number;
  } = {};

  if (raw.filePath !== undefined) {
    if (typeof raw.filePath !== 'string' || !raw.filePath.trim())
      throw new ValidationError('filePath must be a non-empty string');
    data.filePath = raw.filePath.trim();
  }
  if (raw.fileName !== undefined) {
    if (typeof raw.fileName !== 'string' || !raw.fileName.trim())
      throw new ValidationError('fileName must be a non-empty string');
    data.fileName = raw.fileName.trim();
  }
  if (raw.content !== undefined) {
    if (typeof raw.content !== 'string') throw new ValidationError('content must be a string');
    data.content = raw.content;
  }
  if (raw.isEditable !== undefined) {
    if (typeof raw.isEditable !== 'boolean')
      throw new ValidationError('isEditable must be a boolean');
    data.isEditable = raw.isEditable;
  }
  if (raw.sortOrder !== undefined) {
    if (typeof raw.sortOrder !== 'number' || !Number.isFinite(raw.sortOrder))
      throw new ValidationError('sortOrder must be a finite number');
    data.sortOrder = raw.sortOrder;
  }

  if (Object.keys(data).length === 0) throw new ValidationError('No valid fields provided');

  const result = await writer.updateExerciseFile(fileId, data);
  if (!result) throw new NotFoundError('Exercise file not found');
  return result;
}

export async function deleteExerciseFile(fileId: string) {
  const result = await writer.deleteExerciseFile(fileId);
  if (!result) throw new NotFoundError('Exercise file not found');
  return result;
}

export function replaceExerciseFiles(exerciseId: string, rawFiles: unknown) {
  if (!Array.isArray(rawFiles)) throw new ValidationError('files must be an array');
  const files = rawFiles.map((f: unknown, i: number) => {
    if (typeof f !== 'object' || f === null)
      throw new ValidationError(`files[${i}] must be an object`);
    return validateExerciseFileInput(f as Record<string, unknown>);
  });
  return writer.replaceExerciseFiles(exerciseId, files);
}

// --- Categories --------------------------------------------------------------

export function listCategories() {
  return reader.listAllCategories();
}

function validateCategoryInput(raw: Record<string, unknown>, partial: false): CategoryInput;
function validateCategoryInput(raw: Record<string, unknown>, partial: true): Partial<CategoryInput>;
function validateCategoryInput(raw: Record<string, unknown>, partial: boolean) {
  const data: Partial<CategoryInput> = {};

  if (raw.slug !== undefined) {
    if (typeof raw.slug !== 'string' || !raw.slug.trim())
      throw new ValidationError('slug must be a non-empty string');
    data.slug = raw.slug.trim();
  } else if (!partial) {
    throw new ValidationError('slug is required');
  }
  if (raw.label !== undefined) {
    if (typeof raw.label !== 'string' || !raw.label.trim())
      throw new ValidationError('label must be a non-empty string');
    data.label = raw.label.trim();
  } else if (!partial) {
    throw new ValidationError('label is required');
  }
  if (raw.description !== undefined) {
    if (typeof raw.description !== 'string')
      throw new ValidationError('description must be a string');
    data.description = raw.description;
  } else if (!partial) {
    throw new ValidationError('description is required');
  }
  if (raw.icon !== undefined) {
    if (typeof raw.icon !== 'string' || !raw.icon.trim())
      throw new ValidationError('icon must be a non-empty string');
    data.icon = raw.icon.trim();
  } else if (!partial) {
    throw new ValidationError('icon is required');
  }
  if (raw.tags !== undefined) {
    if (!Array.isArray(raw.tags) || !raw.tags.every((t) => typeof t === 'string'))
      throw new ValidationError('tags must be an array of strings');
    data.tags = raw.tags;
  } else if (!partial) {
    throw new ValidationError('tags is required');
  }
  if (raw.sortOrder !== undefined) {
    if (typeof raw.sortOrder !== 'number' || !Number.isFinite(raw.sortOrder))
      throw new ValidationError('sortOrder must be a finite number');
    data.sortOrder = raw.sortOrder;
  } else if (!partial) {
    throw new ValidationError('sortOrder is required');
  }
  if (raw.isActive !== undefined) {
    if (typeof raw.isActive !== 'boolean') throw new ValidationError('isActive must be a boolean');
    data.isActive = raw.isActive;
  }

  if (partial && Object.keys(data).length === 0)
    throw new ValidationError('No valid fields provided');

  return data;
}

export function createCategory(raw: Record<string, unknown>) {
  const input = validateCategoryInput(raw, false);
  return writer.createCategory(input);
}

export async function updateCategory(id: string, raw: Record<string, unknown>) {
  const input = validateCategoryInput(raw, true);
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

export function createTemplate(raw: Record<string, unknown>) {
  if (typeof raw.name !== 'string' || !raw.name.trim())
    throw new ValidationError('name is required');
  if (typeof raw.templateText !== 'string' || !raw.templateText.trim())
    throw new ValidationError('templateText is required');
  if (typeof raw.exerciseType !== 'string' || !raw.exerciseType.trim())
    throw new ValidationError('exerciseType is required');
  if (
    !Array.isArray(raw.supportedLanguages) ||
    !raw.supportedLanguages.every((l) => typeof l === 'string')
  ) {
    throw new ValidationError('supportedLanguages must be an array of strings');
  }

  const input: PromptTemplateInput = {
    name: raw.name.trim(),
    templateText: raw.templateText,
    exerciseType: raw.exerciseType.trim(),
    supportedLanguages: raw.supportedLanguages,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    environmentId: typeof raw.environmentId === 'string' ? raw.environmentId : undefined,
  };

  return writer.createPromptTemplate(input);
}

export async function updateTemplate(id: string, raw: Record<string, unknown>) {
  const data: Partial<PromptTemplateInput> = {};

  if (raw.name !== undefined) {
    if (typeof raw.name !== 'string' || !raw.name.trim())
      throw new ValidationError('name must be a non-empty string');
    data.name = raw.name.trim();
  }
  if (raw.description !== undefined) {
    if (typeof raw.description !== 'string')
      throw new ValidationError('description must be a string');
    data.description = raw.description;
  }
  if (raw.templateText !== undefined) {
    if (typeof raw.templateText !== 'string' || !raw.templateText.trim())
      throw new ValidationError('templateText must be a non-empty string');
    data.templateText = raw.templateText;
  }
  if (raw.exerciseType !== undefined) {
    if (typeof raw.exerciseType !== 'string' || !raw.exerciseType.trim())
      throw new ValidationError('exerciseType must be a non-empty string');
    data.exerciseType = raw.exerciseType.trim();
  }
  if (raw.supportedLanguages !== undefined) {
    if (
      !Array.isArray(raw.supportedLanguages) ||
      !raw.supportedLanguages.every((l) => typeof l === 'string')
    ) {
      throw new ValidationError('supportedLanguages must be an array of strings');
    }
    data.supportedLanguages = raw.supportedLanguages;
  }
  if (raw.environmentId !== undefined) {
    if (typeof raw.environmentId !== 'string')
      throw new ValidationError('environmentId must be a string');
    data.environmentId = raw.environmentId;
  }

  if (Object.keys(data).length === 0) throw new ValidationError('No valid fields provided');

  const result = await writer.updatePromptTemplate(id, data);
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
  }
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
export async function updateUserRole(currentUserId: string, targetUserId: string, role: string) {
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
