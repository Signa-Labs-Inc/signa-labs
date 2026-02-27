export type User = {
  id: string;
  clerkId: string;
  orgId?: string | null;
  role: 'learner' | 'admin' | 'super_admin';
  email: string;
  emailVerifiedAt?: Date;
};

export type UserProfile = {
  id: string;
  userId: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  timeZone?: string;
  preferredLanguage?: string;
  preferences: {
    editor_theme: 'light' | 'dark';
    editor_font_size: number;
    preferred_coding_language: string;
    daily_goal_minutes: number;
    email_notifications: boolean;
    streak_reminders: boolean;
  };
  updatedAt: Date;
};

export type CreateUserParams = {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  orgId?: string | null;
  role: 'learner' | 'admin' | 'super_admin';
  emailVerifiedAt?: Date;
};

export type UpdateUserParams = {
  email?: string;
  orgId?: string | null;
  role?: 'learner' | 'admin' | 'super_admin';
  emailVerifiedAt?: Date;
  stripeCustomerId?: string;
};
