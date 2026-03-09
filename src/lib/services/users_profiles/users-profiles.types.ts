/**
 * Profile Types
 */

export interface UserProfile {
  userId: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  timezone: string;
  preferredLanguage: string;
  preferences: UserPreferences;
  updatedAt: Date;
}

export interface UserPreferences {
  editor_theme: string;
  editor_font_size: number;
  preferred_coding_language: string;
  daily_goal_minutes: number;
  email_notifications: boolean;
  streak_reminders: boolean;
}

export interface UpdateProfileInput {
  displayName?: string | null;
  username?: string | null;
  bio?: string | null;
  preferredLanguage?: string;
  preferences?: Partial<UserPreferences>;
}
