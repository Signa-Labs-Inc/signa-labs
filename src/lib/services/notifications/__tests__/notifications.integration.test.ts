import { db } from '@/index';
import { users } from '@/db/schema/tables';
import { insertNotification, markNotificationRead, markAllNotificationsRead } from '../notifications.writer';
import { getUnreadCount, hasRecentUsageAlert } from '../notifications.reader';

async function seedUser(id = crypto.randomUUID()) {
  const [u] = await db.insert(users).values({
    id,
    clerkId: `clerk_${id}`,
    email: `${id}@test.com`,
    name: 'Test User',
    role: 'learner',
  }).onConflictDoNothing().returning();
  return u;
}

describe('notifications integration', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await seedUser();
    userId = user!.id;
  });

  describe('insertNotification', () => {
    it('creates with sentAt and status sent', async () => {
      const n = await insertNotification({
        userId,
        type: 'usage_alert',
        channel: 'in_app',
        subject: 'Test alert',
        body: 'Test body',
        metadata: { feature: 'exercises' },
      });

      expect(n).not.toBeNull();
      expect(n!.status).toBe('sent');
      expect(n!.sentAt).not.toBeNull();
    });
  });

  describe('markNotificationRead', () => {
    it('sets readAt, scoped to userId', async () => {
      const n = await insertNotification({
        userId,
        type: 'usage_alert',
        channel: 'in_app',
        subject: 'Read test',
      });

      const updated = await markNotificationRead(n!.id, userId);
      expect(updated).not.toBeNull();
      expect(updated!.readAt).not.toBeNull();

      // Other user can't mark it read (different userId)
      const secondUpdate = await markNotificationRead(n!.id, crypto.randomUUID());
      expect(secondUpdate).toBeNull();
    });
  });

  describe('markAllNotificationsRead', () => {
    it('updates all unread and returns count', async () => {
      await insertNotification({ userId, type: 'test', channel: 'in_app', subject: 'A' });
      await insertNotification({ userId, type: 'test', channel: 'in_app', subject: 'B' });
      await insertNotification({ userId, type: 'test', channel: 'in_app', subject: 'C' });

      const count = await markAllNotificationsRead(userId);
      expect(count).toBe(3);

      // Second call should update 0
      const count2 = await markAllNotificationsRead(userId);
      expect(count2).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('counts only unread', async () => {
      await insertNotification({ userId, type: 'test', channel: 'in_app', subject: 'Unread 1' });
      await insertNotification({ userId, type: 'test', channel: 'in_app', subject: 'Unread 2' });

      const n = await insertNotification({ userId, type: 'test', channel: 'in_app', subject: 'Will be read' });
      await markNotificationRead(n!.id, userId);

      const count = await getUnreadCount(userId);
      expect(count).toBe(2);
    });
  });

  describe('hasRecentUsageAlert', () => {
    it('returns true when matching alert exists after windowStart', async () => {
      await insertNotification({
        userId,
        type: 'usage_alert',
        channel: 'in_app',
        subject: 'Limit reached',
        metadata: { feature: 'exercises' },
      });

      const result = await hasRecentUsageAlert(userId, 'exercises', new Date(Date.now() - 3600000));
      expect(result).toBe(true);
    });

    it('returns false for different feature', async () => {
      await insertNotification({
        userId,
        type: 'usage_alert',
        channel: 'in_app',
        subject: 'Limit reached',
        metadata: { feature: 'exercises' },
      });

      const result = await hasRecentUsageAlert(userId, 'paths', new Date(Date.now() - 3600000));
      expect(result).toBe(false);
    });
  });
});
