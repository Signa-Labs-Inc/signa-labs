/**
 * Teaching Types
 *
 * Types for the teaching layer: lessons, failure explanations, and synthesis.
 */

// ============================================================
// Lesson content (stored on exercises.lesson_content)
// ============================================================

export interface LessonContent {
  title: string;
  body: string; // Markdown
  codeExample: CodeExample;
  keyTakeaways: string[];
}

export interface CodeExample {
  code: string;
  language: string;
  annotations: CodeAnnotation[];
}

export interface CodeAnnotation {
  line: number;
  text: string;
}

// ============================================================
// Synthesis content (stored on exercises.synthesis_content)
// ============================================================

export interface SynthesisContent {
  summary: string;
  connections: string;
  realWorld: string;
  nextPreview: string | null;
}

// ============================================================
// Failure explanation (stored in submission_explanations)
// ============================================================

export interface FailureExplanation {
  whatWentWrong: string;
  whyItFailed: string;
  nudge: string;
  severity: 'syntax' | 'logic' | 'conceptual' | 'edge_case';
  relatedLessonSection?: string;
}

// ============================================================
// Generation inputs
// ============================================================

export interface GenerateExplanationInput {
  userId: string;
  exerciseId: string;
  submissionId: string;
  exerciseTitle: string;
  exerciseDescription: string;
  exerciseDifficulty: string;
  userCode: string;
  testsPassed: number;
  testsTotal: number;
  testResults: { name: string; passed: boolean; error?: string }[];
  attemptNumber: number;
  previousExplanations?: FailureExplanation[];
  lessonTitle?: string | null;
}

// ============================================================
// Explanation record (from DB)
// ============================================================

export interface ExplanationRecord {
  id: string;
  submissionId: string;
  userId: string;
  exerciseId: string;
  attemptNumber: number;
  explanation: FailureExplanation;
  createdAt: Date;
}

// ============================================================
// Errors
// ============================================================

export class TeachingError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'TeachingError';
  }

  get httpStatus(): number {
    switch (this.code) {
      case 'EXERCISE_NOT_FOUND':
      case 'SUBMISSION_NOT_FOUND':
        return 404;
      case 'EXPLANATION_GENERATION_FAILED':
        return 500;
      case 'ALREADY_PASSING':
        return 400;
      default:
        return 500;
    }
  }
}
