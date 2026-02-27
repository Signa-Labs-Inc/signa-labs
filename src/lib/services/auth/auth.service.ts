import { getOrCreateFromClerk } from '../users/users.service';
import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { UnauthorizedError } from '@/lib/utils/errors';

export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const user = await getOrCreateFromClerk(userId);
  return user;
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError('User is not authenticated');
  }
  return user;
}
