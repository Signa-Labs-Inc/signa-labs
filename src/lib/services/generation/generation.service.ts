/**
 * ExerciseGenerationService
 *
 * Orchestrates AI exercise generation:
 *   1. Build prompt from user input + template
 *   2. Call Claude for structured exercise output
 *   3. Parse and validate the LLM response
 *   4. Run solution against tests in the sandbox
 *   5. Retry with feedback if validation fails (up to 2 retries)
 *   6. Persist the validated exercise + files
 *   7. Create an attempt for the user
 *   8. Return exerciseId + attemptId
 */

import Anthropic from '@anthropic-ai/sdk';
import { createExecutionClient } from '@/lib/sandboxes/execution_clients';
import type { ExecutionClient } from '@/lib/sandboxes/execution_clients';
import type { SandboxResult } from '@/lib/sandboxes/types';
import { SubmissionService } from '@/lib/services/submissions/submissions.service';
import * as reader from './generation.reader';
import * as writer from './generation.writer';
import { buildGenerationPrompt } from './prompt-builder';
import { GenerationError } from './generation.types';
import type {
  GenerateExerciseInput,
  GenerateExerciseResult,
  LLMExerciseOutput,
  ExerciseFileInsert,
} from './generation.types';

// ============================================================
// Constants
// ============================================================

const LLM_MODEL = 'claude-sonnet-4-20250514';
const MAX_RETRIES = 2;
const MAX_GENERATIONS_PER_HOUR = 10;
const MIN_PROMPT_LENGTH = 10;
const MAX_PROMPT_LENGTH = 2000;

// ============================================================
// Service
// ============================================================

export class ExerciseGenerationService {
  private anthropic: Anthropic;
  private executionClient: ExecutionClient;
  private submissionService: SubmissionService;

  constructor(executionClient?: ExecutionClient, submissionService?: SubmissionService) {
    this.anthropic = new Anthropic();
    this.executionClient = executionClient ?? createExecutionClient();
    this.submissionService = submissionService ?? new SubmissionService(this.executionClient);
  }

  /**
   * Generate a complete exercise from a user prompt.
   * Returns the exerciseId and attemptId so the user can be redirected to the workspace.
   */
  async generateExercise(input: GenerateExerciseInput): Promise<GenerateExerciseResult> {
    const startTime = Date.now();

    // 1. Validate input
    this.validateInput(input);

    // 2. Rate limit check
    await this.checkRateLimit(input.userId);

    // 3. Resolve environment for the language
    const environment = await reader.getActiveEnvironmentByLanguage(input.language);
    if (!environment) {
      throw new GenerationError(
        'ENVIRONMENT_NOT_FOUND',
        `No active sandbox environment found for ${input.language}`
      );
    }

    // 4. Resolve prompt template (optional)
    let template = null;
    if (input.templateId) {
      template = await reader.getPromptTemplateById(input.templateId);
      if (!template) {
        throw new GenerationError('TEMPLATE_NOT_FOUND', 'Prompt template not found');
      }
    } else if (input.exerciseType) {
      template = await reader.getDefaultPromptTemplate(input.language, input.exerciseType);
    }

    // 5. Generate + validate with retries
    const difficulty = input.difficulty ?? 'medium';
    let lastError: string = '';
    let lastFailedTests: string = '';
    let exerciseOutput: LLMExerciseOutput | null = null;
    let validationResult: SandboxResult | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      // Build prompt
      const prompt = buildGenerationPrompt({
        userPrompt: input.userPrompt,
        language: input.language,
        difficulty,
        exerciseType: input.exerciseType,
        template,
        retryContext:
          attempt > 0
            ? { attempt, previousError: lastError, failedTests: lastFailedTests }
            : undefined,
      });

      // Call Claude
      exerciseOutput = await this.callLLM(prompt);

      // Validate in sandbox
      validationResult = await this.validateInSandbox(exerciseOutput, input.language, environment);

      if (
        validationResult.status === 'completed' &&
        validationResult.tests_failed === 0 &&
        validationResult.tests_total > 0
      ) {
        // Validation passed
        break;
      }

      // Validation failed — prepare retry context
      lastError =
        validationResult.error_message ??
        `${validationResult.tests_failed}/${validationResult.tests_total} tests failed`;

      const failedTestNames = validationResult.results
        .filter((r) => !r.passed)
        .map((r) => `${r.name}: ${r.error ?? 'failed'}`)
        .join('\n');

      lastFailedTests = failedTestNames;

      if (attempt === MAX_RETRIES) {
        throw new GenerationError(
          'VALIDATION_FAILED',
          `Exercise generation failed validation after ${MAX_RETRIES + 1} attempts. Last error: ${lastError}`
        );
      }
    }

    if (!exerciseOutput || !validationResult) {
      throw new GenerationError('GENERATION_FAILED', 'Exercise generation produced no output');
    }

    const generationTimeMs = Date.now() - startTime;

    // 6. Persist exercise + files
    const files = this.buildFileInserts(exerciseOutput);

    const exercise = await writer.createExerciseWithFiles(
      {
        userId: input.userId,
        userPrompt: input.userPrompt,
        title: exerciseOutput.title,
        description: exerciseOutput.description,
        language: input.language,
        difficulty,
        environmentId: environment.id,
        hints: exerciseOutput.hints,
        tags: exerciseOutput.tags,
        llmModel: LLM_MODEL,
        llmParameters: { temperature: 1, max_tokens: 8096 },
        generationTimeMs,
        isValidated: true,
        validationOutput: validationResult,
        templateId: input.templateId,
      },
      files
    );

    // 7. Create an attempt for the user
    const { attemptId } = await this.submissionService.getOrCreateAttempt(
      input.userId,
      exercise.id
    );

    return {
      exerciseId: exercise.id,
      attemptId,
      title: exerciseOutput.title,
      validationPassed: true,
    };
  }

  // ============================================================
  // Private: LLM interaction
  // ============================================================

  private async callLLM(prompt: string): Promise<LLMExerciseOutput> {
    let response: Anthropic.Message;

    try {
      response = await this.anthropic.messages.create({
        model: LLM_MODEL,
        max_tokens: 8096,
        temperature: 1,
        messages: [{ role: 'user', content: prompt }],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown LLM error';
      throw new GenerationError('GENERATION_FAILED', `Claude API call failed: ${message}`);
    }

    // Extract text content
    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new GenerationError('INVALID_LLM_RESPONSE', 'Claude returned no text content');
    }

    // Parse JSON
    const rawText = textBlock.text.trim();
    // Strip markdown fences if Claude added them despite instructions
    const jsonText = rawText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    let parsed: LLMExerciseOutput;
    try {
      parsed = JSON.parse(jsonText) as LLMExerciseOutput;
    } catch {
      throw new GenerationError(
        'INVALID_LLM_RESPONSE',
        `Failed to parse Claude's response as JSON. Raw output starts with: "${rawText.slice(0, 200)}"`
      );
    }

    // Basic structure validation
    this.validateLLMOutput(parsed);

    return parsed;
  }

  private validateLLMOutput(output: LLMExerciseOutput): void {
    if (!output.title || typeof output.title !== 'string') {
      throw new GenerationError('INVALID_LLM_RESPONSE', 'Missing or invalid title');
    }
    if (!output.description || typeof output.description !== 'string') {
      throw new GenerationError('INVALID_LLM_RESPONSE', 'Missing or invalid description');
    }
    if (!Array.isArray(output.starterFiles) || output.starterFiles.length === 0) {
      throw new GenerationError('INVALID_LLM_RESPONSE', 'Missing starter files');
    }
    if (!Array.isArray(output.solutionFiles) || output.solutionFiles.length === 0) {
      throw new GenerationError('INVALID_LLM_RESPONSE', 'Missing solution files');
    }
    if (!Array.isArray(output.testFiles) || output.testFiles.length === 0) {
      throw new GenerationError('INVALID_LLM_RESPONSE', 'Missing test files');
    }
    if (!Array.isArray(output.hints)) {
      output.hints = [];
    }
    if (!Array.isArray(output.tags)) {
      output.tags = [];
    }
    if (!Array.isArray(output.supportFiles)) {
      output.supportFiles = [];
    }

    // Validate each file has required fields
    const allFiles = [
      ...output.starterFiles,
      ...output.solutionFiles,
      ...output.testFiles,
      ...(output.supportFiles ?? []),
    ];
    for (const file of allFiles) {
      if (!file.filePath || !file.fileName || typeof file.content !== 'string') {
        throw new GenerationError(
          'INVALID_LLM_RESPONSE',
          `File missing required fields: ${JSON.stringify(file).slice(0, 100)}`
        );
      }
    }
  }

  // ============================================================
  // Private: Sandbox validation
  // ============================================================

  private async validateInSandbox(
    output: LLMExerciseOutput,
    language: string,
    environment: { baseImage: string; maxExecutionSeconds: number }
  ): Promise<SandboxResult> {
    const response = await this.executionClient.executeSubmission({
      image: environment.baseImage,
      language: language as 'python' | 'javascript' | 'typescript',
      // Use solution files as the submission (validating that the solution passes)
      submissionFiles: output.solutionFiles.map((f) => ({
        filePath: f.filePath,
        content: f.content,
      })),
      testFiles: output.testFiles.map((f) => ({
        filePath: f.filePath,
        content: f.content,
      })),
      supportFiles: (output.supportFiles ?? []).map((f) => ({
        filePath: f.filePath,
        content: f.content,
      })),
      timeoutSeconds: environment.maxExecutionSeconds,
    });

    if (!response.success || !response.result) {
      return {
        status: 'error',
        error_type: 'runner_error',
        error_message: response.error ?? 'Sandbox execution failed',
        tests_passed: 0,
        tests_failed: 0,
        tests_total: 0,
        execution_time_ms: response.totalDurationMs,
        results: [],
      };
    }

    return response.result;
  }

  // ============================================================
  // Private: File building
  // ============================================================

  private buildFileInserts(output: LLMExerciseOutput): ExerciseFileInsert[] {
    const files: ExerciseFileInsert[] = [];

    for (let i = 0; i < output.starterFiles.length; i++) {
      const f = output.starterFiles[i];
      files.push({
        exerciseId: '', // Set by writer in transaction
        fileType: 'starter',
        filePath: f.filePath,
        fileName: f.fileName,
        content: f.content,
        isEditable: true,
        sortOrder: i,
      });
    }

    for (let i = 0; i < output.solutionFiles.length; i++) {
      const f = output.solutionFiles[i];
      files.push({
        exerciseId: '',
        fileType: 'solution',
        filePath: f.filePath,
        fileName: f.fileName,
        content: f.content,
        isEditable: false,
        sortOrder: i,
      });
    }

    for (let i = 0; i < output.testFiles.length; i++) {
      const f = output.testFiles[i];
      files.push({
        exerciseId: '',
        fileType: 'test',
        filePath: f.filePath,
        fileName: f.fileName,
        content: f.content,
        isEditable: false,
        sortOrder: i,
      });
    }

    for (let i = 0; i < (output.supportFiles ?? []).length; i++) {
      const f = output.supportFiles![i];
      files.push({
        exerciseId: '',
        fileType: 'support',
        filePath: f.filePath,
        fileName: f.fileName,
        content: f.content,
        isEditable: false,
        sortOrder: i,
      });
    }

    return files;
  }

  // ============================================================
  // Private: Validation
  // ============================================================

  private validateInput(input: GenerateExerciseInput): void {
    if (!input.userPrompt || input.userPrompt.trim().length < MIN_PROMPT_LENGTH) {
      throw new GenerationError(
        'PROMPT_TOO_SHORT',
        `Prompt must be at least ${MIN_PROMPT_LENGTH} characters`
      );
    }

    if (input.userPrompt.length > MAX_PROMPT_LENGTH) {
      throw new GenerationError(
        'PROMPT_TOO_LONG',
        `Prompt must be under ${MAX_PROMPT_LENGTH} characters`
      );
    }
  }

  private async checkRateLimit(userId: string): Promise<void> {
    const count = await reader.getUserGenerationCountLastHour(userId);
    if (count >= MAX_GENERATIONS_PER_HOUR) {
      throw new GenerationError(
        'RATE_LIMITED',
        `Generation limit reached (${MAX_GENERATIONS_PER_HOUR}/hour). Please try again later.`
      );
    }
  }
}
