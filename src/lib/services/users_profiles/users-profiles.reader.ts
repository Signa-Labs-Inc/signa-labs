/**
 * Profile Reader
 */

import { eq } from 'drizzle-orm';
import { db } from '@/index';
import { usersProfiles } from '@/db/schema/tables/users_profiles';
import type { UserProfile } from './users-profiles.types';

/**
 * Get a user's profile. Returns null if no profile exists yet.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [profile] = await db
    .select()
    .from(usersProfiles)
    .where(eq(usersProfiles.userId, userId))
    .limit(1);

  if (!profile) return null;

  return profile as UserProfile;
}

/**
 * Check if a username is already taken by another user.
 */
export async function isUsernameTaken(username: string, excludeUserId: string): Promise<boolean> {
  const [existing] = await db
    .select({ userId: usersProfiles.userId })
    .from(usersProfiles)
    .where(eq(usersProfiles.username, username))
    .limit(1);

  return existing !== undefined && existing.userId !== excludeUserId;
}
