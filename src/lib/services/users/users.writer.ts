import { db } from '@/index';
import { CreateUserParams, UpdateUserParams, User } from './users.types';
import { userLearningStats, users, usersProfiles } from '@/db/schema/tables';
import { and, eq, isNull } from 'drizzle-orm';

export async function insertUser(params: CreateUserParams): Promise<User | null> {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        clerkId: params.clerkId,
        email: params.email,
        orgId: params.orgId,
        role: params.role,
        emailVerifiedAt: params.emailVerifiedAt,
      })
      .onConflictDoNothing()
      .returning({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        orgId: users.orgId,
        role: users.role,
      });

    if (!user) return null;

    await tx.insert(usersProfiles).values({
      userId: user.id,
      displayName: [params.firstName, params.lastName].filter(Boolean).join(' ') || null,
    });

    await tx.insert(userLearningStats).values({
      userId: user.id,
    });

    return user;
  });
}

export async function updateUser(clerkId: string, params: UpdateUserParams): Promise<User | null> {
  const set: Record<string, unknown> = {};

  if (params.email !== undefined) set.email = params.email;
  if (params.orgId !== undefined) set.orgId = params.orgId;
  if (params.role !== undefined) set.role = params.role;
  if (params.emailVerifiedAt !== undefined) set.emailVerifiedAt = params.emailVerifiedAt;
  if (params.stripeCustomerId !== undefined) set.stripeCustomerId = params.stripeCustomerId;

  if (Object.keys(set).length === 0) return null;

  const [user] = await db.update(users).set(set).where(eq(users.clerkId, clerkId)).returning({
    id: users.id,
    clerkId: users.clerkId,
    email: users.email,
    orgId: users.orgId,
    role: users.role,
  });
  return user ?? null;
}

export async function deleteUser(clerkId: string): Promise<void> {
  await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(and(eq(users.clerkId, clerkId), isNull(users.deletedAt)));
}
