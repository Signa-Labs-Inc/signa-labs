export const ExerciseDifficulty = {
  BEGINNER: 'beginner',
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
} as const;

export type ExerciseDifficulty = (typeof ExerciseDifficulty)[keyof typeof ExerciseDifficulty];

export const ExerciseLanguage = {
  PYTHON: 'python',
  TYPESCRIPT: 'typescript',
  JAVASCRIPT: 'javascript',
  RUBY: 'ruby',
  GO: 'go',
  SQL: 'sql',
} as const;

export type ExerciseLanguage = (typeof ExerciseLanguage)[keyof typeof ExerciseLanguage];

export const ExerciseOrigin = {
  PLATFORM: 'platform',
  USER: 'user',
} as const;

export type ExerciseOrigin = (typeof ExerciseOrigin)[keyof typeof ExerciseOrigin];

export const FileType = {
  STARTER: 'starter',
  SOLUTION: 'solution',
  TEST: 'test',
  SUPPORT: 'support',
} as const;

export type FileType = (typeof FileType)[keyof typeof FileType];
