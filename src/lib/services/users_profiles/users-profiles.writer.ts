/**
 * Profile Writer
 */

import { eq, sql } from 'drizzle-orm';
import { db } from '@/index';
import { usersProfiles } from '@/db/schema/tables/users_profiles';
import type { UpdateProfileInput, UserProfile } from './users-profiles.types';

/**
 * Create or update a user's profile.
 * Uses upsert — creates the profile if it doesn't exist.
 */
export async function upsertProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UserProfile> {
  const setFields: Record<string, unknown> = {};

  if (input.displayName !== undefined) setFields.displayName = input.displayName;
  if (input.username !== undefined) setFields.username = input.username;
  if (input.bio !== undefined) setFields.bio = input.bio;
  if (input.preferredLanguage !== undefined) setFields.preferredLanguage = input.preferredLanguage;

  if (input.preferences) {
    // Merge with existing preferences using jsonb concatenation
    setFields.preferences = sql`COALESCE(${usersProfiles.preferences}, '{}'::jsonb) || ${JSON.stringify(input.preferences)}::jsonb`;
  }

  const [profile] = await db
    .insert(usersProfiles)
    .values({
      userId,
      ...setFields,
      preferences: input.preferences ? (input.preferences as Record<string, unknown>) : undefined,
    })
    .onConflictDoUpdate({
      target: usersProfiles.userId,
      set: setFields,
    })
    .returning();

  return profile as UserProfile;
}
