import { CreateUserParams, UpdateUserParams, User } from './users.types';
import * as writer from './users.writer';
import * as reader from './users.reader';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '@/lib/utils/errors';
import { clerkClient } from '@clerk/nextjs/server';
import { USER_DEFAULT_ROLE } from './users.constants';

export async function createUser(params: CreateUserParams): Promise<User> {
  const user = await writer.insertUser(params);
  if (!user) {
    throw new ConflictError('User already exists');
  }
  return user;
}

export async function getOrCreateFromClerk(clerkId: string): Promise<User> {
  const user = await reader.getUserByClerkId(clerkId);
  if (user) {
    return user;
  }
  const clerkUser = await (await clerkClient()).users.getUser(clerkId);
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new ValidationError('User has no email address');
  }
  const createdUser = await writer.insertUser({
    clerkId,
    email,
    orgId: undefined,
    role: USER_DEFAULT_ROLE,
  });
  if (createdUser) return createdUser;
  // Race condition: another request created the user between our read and write
  const raceResult = await reader.getUserByClerkId(clerkId);
  if (!raceResult) throw new InternalServerError('Failed to create user');
  return raceResult;
}

export async function getUserByClerkId(clerkId: string): Promise<User> {
  const user = await reader.getUserByClerkId(clerkId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}

export async function updateUser(clerkId: string, params: UpdateUserParams): Promise<User> {
  const user = await writer.updateUser(clerkId, params);
  if (!user) {
    throw new NotFoundError('Failed to update user');
  }
  return user;
}

export async function deleteUser(clerkId: string): Promise<void> {
  await writer.deleteUser(clerkId);
}
