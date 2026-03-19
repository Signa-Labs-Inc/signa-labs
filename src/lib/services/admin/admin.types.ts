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

// --- Analytics Filters -----------------------------------------------------------

export type AnalyticsTimeRange = '7d' | '30d' | '90d' | '6mo' | '1y' | 'all';

export type AnalyticsFilters = {
  range: AnalyticsTimeRange;
  plan: string; // 'all' | plan id
  status: string; // 'all' | 'active' | 'churned' | 'trial'
};

export const VALID_TIME_RANGES: AnalyticsTimeRange[] = ['7d', '30d', '90d', '6mo', '1y', 'all'];

export function rangeToInterval(range: AnalyticsTimeRange): string | null {
  switch (range) {
    case '7d':
      return '7 days';
    case '30d':
      return '30 days';
    case '90d':
      return '90 days';
    case '6mo':
      return '6 months';
    case '1y':
      return '1 year';
    case 'all':
      return null;
  }
}

// --- Financial Analytics ---------------------------------------------------------

export type RecentPayment = {
  id: string;
  userEmail: string;
  amountCents: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

export type MonthlyRevenue = {
  month: string;
  totalCents: number;
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
  revenueMetrics: {
    mrr: number;
    totalRevenue: number;
    arpu: number;
    revenueTrend: MonthlyRevenue[];
  };
  subscriptionHealth: {
    activeSubscribers: number;
    churned30d: number;
    churnRate: number;
    trialConversionRate: number;
    upgradeCount30d: number;
    downgradeCount30d: number;
  };
  paymentHistory: {
    recentPayments: RecentPayment[];
    failedPayments30d: number;
    refundTotalCents: number;
    paymentSuccessRate: number;
  };
  planBreakdown: {
    subscribersByPlan: BreakdownItem[];
    freeVsPaidRatio: { free: number; paid: number; paidPercentage: number };
    mostPopularPlan: string;
    revenueByPlan: BreakdownItem[];
  };
};
