export type AdminDashboardStats = {
  totalExercises: number;
  validatedExercises: number;
  totalUsers: number;
  activePaths: number;
  totalTemplates: number;
  totalEnvironments: number;
};

export type AdminExerciseFilters = {
  origin?: 'platform' | 'user';
  language?: string;
  difficulty?: string;
  isValidated?: boolean;
  isPublic?: boolean;
  includeDeleted?: boolean;
  search?: string;
};

export type CategoryInput = {
  slug: string;
  label: string;
  description: string;
  icon: string;
  tags: string[];
  sortOrder: number;
  isActive?: boolean;
};

export type PromptTemplateInput = {
  name: string;
  description?: string;
  templateText: string;
  exerciseType: string;
  supportedLanguages: string[];
  environmentId?: string;
};

export type AdminUserFilters = {
  search?: string;
  role?: 'learner' | 'admin' | 'super_admin';
};

export type AdminPathFilters = {
  status?: string;
  language?: string;
};

// --- Analytics ------------------------------------------------------------------

export type BreakdownItem = {
  label: string;
  value: number;
  percentage: number;
};

export type DailyCount = {
  date: string;
  count: number;
};

export type RankedExercise = {
  id: string;
  title: string;
  language: string;
  difficulty: string;
  passRate: number;
  attempts: number;
  completions: number;
};

export type TopUser = {
  userId: string;
  email: string;
  displayName: string | null;
  completions: number;
  timeSpentHours: number;
  streak: number;
};

export type AnalyticsData = {
  overview: {
    totalCompletions: number;
    totalSubmissions: number;
    overallPassRate: number;
    activeUsersLast30d: number;
    totalTimeSpentHours: number;
    avgCompletionTimeMinutes: number;
  };
  dailyCompletions: DailyCount[];
  exerciseInsights: {
    byLanguage: BreakdownItem[];
    byDifficulty: BreakdownItem[];
    hardestExercises: RankedExercise[];
    mostAttempted: RankedExercise[];
  };
  userEngagement: {
    activeUsers7d: number;
    activeUsers30d: number;
    activeUsers90d: number;
    dauTrend: DailyCount[];
    wauTrend: DailyCount[];
    mauTrend: DailyCount[];
    newSignupsLast30d: DailyCount[];
    roleDistribution: BreakdownItem[];
  };
  userSegmentation: {
    byActivityLevel: BreakdownItem[];
    byPlan: BreakdownItem[];
    byPreferredLanguage: BreakdownItem[];
    retentionDay7: number;
    retentionDay30: number;
    retentionDay90: number;
    topUsers: TopUser[];
    avgCompletionsPerUser: number;
    avgTimePerUserMinutes: number;
    medianStreak: number;
  };
  learningPathStats: {
    totalPaths: number;
    completionRate: number;
    avgMilestonesCompleted: number;
    statusDistribution: BreakdownItem[];
    popularLanguages: BreakdownItem[];
  };
  submissionPerformance: {
    overallPassRate: number;
    avgAttemptsPerCompletion: number;
    hintUsageRate: number;
    solutionViewRate: number;
    avgExecutionTimeMs: number;
    totalSubmissions: number;
  };
};
