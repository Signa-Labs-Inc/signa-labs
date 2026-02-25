import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../users';
export const usersProfiles = pgTable(
  'users_profiles',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    displayName: text('display_name'),
    username: text('username').unique(),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    timezone: text('time_zone').notNull().default('America/New_York'),
    preferredLanguage: text('preferred_language').notNull().default('en'),
    preferences: jsonb().notNull().default({
      editor_theme: 'dark',
      editor_font_size: 14,
      preferred_coding_language: 'python',
      daily_goal_minutes: 30,
      email_notifications: true,
      streak_reminders: true,
    }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index('idx_users_profiles_username').on(table.username)]
);
