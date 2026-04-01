/**
 * Inactivity Check Task
 *
 * Scheduled Trigger.dev task that runs daily and sends nudge emails
 * to users who haven't been active in 3 days.
 */

import { schedules } from '@trigger.dev/sdk/v3';
import { db } from '@/index';
import { userLearningStats } from '@/db/schema/tables/user_learning_stats';
import { users } from '@/db/schema/tables/users';
import { eq, and, lte, isNull, sql } from 'drizzle-orm';
import { sendInactivityNudge } from '@/lib/services/email/email.service';

export const checkInactivityTask = schedules.task({
  id: 'check-inactivity',
  cron: '0 14 * * *', // Daily at 2pm UTC

  run: async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

    // Find users whose last activity was between 3 and 4 days ago
    // so we only nudge once (not repeatedly every day)
    const inactiveUsers = await db
      .select({ userId: userLearningStats.userId })
      .from(userLearningStats)
      .innerJoin(users, eq(users.id, userLearningStats.userId))
      .where(
        and(
          lte(userLearningStats.lastActivityAt, threeDaysAgo),
          sql`${userLearningStats.lastActivityAt} >= ${fourDaysAgo}`,
          isNull(users.deletedAt)
        )
      );

    let nudged = 0;
    for (const { userId } of inactiveUsers) {
      try {
        await sendInactivityNudge(userId);
        nudged++;
      } catch (err) {
        console.error(`Inactivity nudge failed for ${userId}:`, err);
      }
    }

    return { checked: inactiveUsers.length, nudged };
  },
});
