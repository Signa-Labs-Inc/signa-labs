/**
 * Email Service
 *
 * Public API for sending transactional emails.
 * All emails are queued via Trigger.dev for async delivery with retries.
 * Respects a per-user weekly throttle (max 3 emails/week).
 */

import { tasks } from '@trigger.dev/sdk/v3';
import { db } from '@/index';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema/tables/users';
import { userLearningStats } from '@/db/schema/tables/user_learning_stats';
import { learningPaths } from '@/db/schema/tables/learning_paths';
import * as notificationWriter from '../notifications/notifications.writer';
import * as notificationReader from '../notifications/notifications.reader';
import type { sendEmailTask } from '@/trigger/send-email';
import type { EmailData } from './email.types';

const MAX_EMAILS_PER_WEEK = 3;

async function isThrottled(userId: string): Promise<boolean> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const count = await notificationReader.getEmailCountSince(userId, oneWeekAgo);
  return count >= MAX_EMAILS_PER_WEEK;
}

async function queueEmail(userId: string, to: string, subject: string, data: EmailData) {
  if (await isThrottled(userId)) return;

  const notification = await notificationWriter.insertNotification({
    userId,
    type: data.type,
    channel: 'email',
    subject,
    status: 'pending',
  });

  if (!notification) return;

  await tasks.trigger<typeof sendEmailTask>('send-email', {
    notificationId: notification.id,
    to,
    type: data.type,
    data,
  });
}

// ============================================================
// Public API
// ============================================================

export async function sendWelcomeEmail(
  userId: string,
  email: string,
  userName?: string
): Promise<void> {
  await queueEmail(userId, email, 'Welcome to Signa!', {
    type: 'welcome',
    userName,
  });
}

export async function sendFirstCompletionEmail(
  userId: string,
  exerciseTitle: string
): Promise<void> {
  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
  if (!user?.email) return;

  await queueEmail(userId, user.email, `Nice work on "${exerciseTitle}"!`, {
    type: 'first_completion',
    exerciseTitle,
  });
}

export async function sendInactivityNudge(userId: string): Promise<void> {
  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
  if (!user?.email) return;

  const [stats] = await db
    .select({ lastActivityAt: userLearningStats.lastActivityAt })
    .from(userLearningStats)
    .where(eq(userLearningStats.userId, userId));

  const daysSinceActive = stats?.lastActivityAt
    ? Math.floor((Date.now() - stats.lastActivityAt.getTime()) / (24 * 60 * 60 * 1000))
    : 3;

  // Try to find their most recent active path for context
  const [recentPath] = await db
    .select({ title: learningPaths.title })
    .from(learningPaths)
    .where(eq(learningPaths.userId, userId))
    .orderBy(learningPaths.updatedAt)
    .limit(1);

  await queueEmail(userId, user.email, 'Your progress is waiting', {
    type: 'inactivity_nudge',
    daysSinceActive,
    lastPathTitle: recentPath?.title,
  });
}
