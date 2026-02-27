import { users } from '@/db/schema/tables';
import { db } from '@/index';
import { eq, isNull, and } from 'drizzle-orm';
import { User } from './users.types';

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      clerkId: users.clerkId,
      orgId: users.orgId,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, id));
  return user ?? null;
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      clerkId: users.clerkId,
      orgId: users.orgId,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.clerkId, clerkId), isNull(users.deletedAt)));
  return user ?? null;
}
