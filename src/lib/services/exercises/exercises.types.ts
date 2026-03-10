import { LessonContent, SynthesisContent } from '../teaching/teaching.types';
import { ExerciseDifficulty, ExerciseLanguage } from './exercises.constants';
export type Exercise = {
  id: string;
  title: string;
  origin: string;
  difficulty: ExerciseDifficulty;
  description: string;
  language: ExerciseLanguage;
  tags: string[] | null;
  hints?: string[] | null;
  environment: ExerciseEnvironment;
  lessonContent?: LessonContent | null;
  synthesisContent?: SynthesisContent | null;
};
/** Minimal exercise data for catalog listings */
export type ExerciseSummary = {
  id: string;
  title: string;
  description: string;
  difficulty: ExerciseDifficulty;
  language: ExerciseLanguage;
  tags: string[];
  environmentName: string;
};
/** Full exercise data for the workspace page */
export type ExerciseDetail = {
  id: string;
  title: string;
  description: string;
  difficulty: ExerciseDifficulty;
  language: ExerciseLanguage;
  tags: string[];
  hintCount: number;
  environment: ExerciseEnvironment;
  starterFiles: ExerciseFile[];
  supportFiles: ExerciseFile[];
  lessonContent: LessonContent | null;
  synthesisContent: SynthesisContent | null;
};
/** A single file belonging to an exercise */
export type ExerciseFile = {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  isEditable: boolean;
  sortOrder: number;
};

/** Hints returned one at a time */
export type ExerciseHint = {
  index: number;
  text: string;
  total: number;
};

/** Solution files (revealed on request) */
export type ExerciseSolution = {
  files: ExerciseFile[];
};

export type ExerciseCatalogFilters = {
  language?: ExerciseLanguage;
  difficulty?: ExerciseDifficulty;
  tag?: string;
  search?: string;
};

export type ExerciseEnvironment = {
  id: string;
  name: string;
  displayName: string;
  baseImage: string;
  maxExecutionSeconds: number;
  maxFiles: number;
  maxFileSizeBytes: number;
};
