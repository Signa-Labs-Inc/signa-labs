/**
 * Generation Writer
 *
 * Database writes for the exercise generation pipeline.
 */

import { db } from '@/index';
import { exercises } from '@/db/schema/tables/exercises';
import { exerciseFiles } from '@/db/schema/tables/exercise_files';
import type {
  CreateGeneratedExerciseInput,
  CreateGeneratedExerciseResult,
  ExerciseFileInsert,
} from './generation.types';

// ============================================================
// Exercise writes
// ============================================================

/**
 * Create a generated exercise with all its files in a single transaction.
 */
export async function createExerciseWithFiles(
  input: CreateGeneratedExerciseInput,
  files: ExerciseFileInsert[]
): Promise<CreateGeneratedExerciseResult> {
  return await db.transaction(async (tx) => {
    const [exercise] = await tx
      .insert(exercises)
      .values({
        origin: 'user',
        createdBy: input.userId,
        userPrompt: input.userPrompt,
        promptTemplateId: input.templateId ?? null,
        environmentId: input.environmentId,
        llmModel: input.llmModel,
        llmParameters: input.llmParameters,
        generationTimeMs: input.generationTimeMs,
        title: input.title,
        description: input.description,
        difficulty: input.difficulty,
        language: input.language,
        hints: input.hints,
        isValidated: input.isValidated,
        validationOutput: input.validationOutput,
        tags: input.tags,
        lessonContent: input.lessonContent ?? null,
        synthesisContent: input.synthesisContent ?? null,
      })
      .returning({ id: exercises.id });

    if (files.length > 0) {
      await tx.insert(exerciseFiles).values(
        files.map((f) => ({
          exerciseId: exercise.id,
          fileType: f.fileType,
          filePath: f.filePath,
          fileName: f.fileName,
          content: f.content,
          isEditable: f.isEditable,
          sortOrder: f.sortOrder,
        }))
      );
    }

    return exercise;
  });
}
