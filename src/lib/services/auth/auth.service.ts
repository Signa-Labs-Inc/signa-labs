import { getOrCreateFromClerk } from '../users/users.service';
import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';

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

export async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    throw new ForbiddenError('Admin access required');
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== 'super_admin') {
    throw new ForbiddenError('Super admin access required');
  }
  return user;
}
