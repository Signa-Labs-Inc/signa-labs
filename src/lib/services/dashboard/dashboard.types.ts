/**
 * Dashboard Types
 *
 * Types for the user progress dashboard.
 */

// ============================================================
// Stats overview
// ============================================================

export interface DashboardStats {
  totalExercisesCompleted: number;
  totalExercisesAttempted: number;
  totalTimeSpentSeconds: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityAt: Date | null;
}

// ============================================================
// Activity heatmap
// ============================================================

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
}

// ============================================================
// Language breakdown
// ============================================================

export interface LanguageStat {
  language: string;
  completed: number;
  attempted: number;
}

// ============================================================
// Difficulty distribution
// ============================================================

export interface DifficultyBucket {
  difficulty: string;
  count: number;
}

// ============================================================
// Recent activity feed
// ============================================================

export interface ActivityItem {
  id: string;
  eventType: string;
  exerciseTitle: string;
  exerciseLanguage: string;
  exerciseId: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
}
