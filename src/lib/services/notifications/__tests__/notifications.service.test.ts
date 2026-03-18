vi.mock('../notifications.reader', () => ({
  getRecentNotificationsByUserId: vi.fn(),
  getUnreadCount: vi.fn(),
  hasRecentUsageAlert: vi.fn(),
}));

vi.mock('../notifications.writer', () => ({
  insertNotification: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

import * as reader from '../notifications.reader';
import * as writer from '../notifications.writer';
import {
  getUserNotifications,
  createUsageAlertIfNeeded,
} from '../notifications.service';
import { buildNotification } from '@/test/helpers/factories';

const mockReader = vi.mocked(reader);
const mockWriter = vi.mocked(writer);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── getUserNotifications ────────────────────────────────────────────────

describe('getUserNotifications', () => {
  it('maps rows to UserNotification shape with ISO dates', async () => {
    const row = buildNotification({
      sentAt: new Date('2026-03-01T00:00:00Z'),
      readAt: null,
      createdAt: new Date('2026-03-01T00:00:00Z'),
    });
    mockReader.getRecentNotificationsByUserId.mockResolvedValue([row] as never);

    const result = await getUserNotifications('user1');
    expect(result[0].sentAt).toBe('2026-03-01T00:00:00.000Z');
    expect(result[0].readAt).toBeNull();
    expect(result[0].createdAt).toBe('2026-03-01T00:00:00.000Z');
  });

  it('handles null metadata as empty object', async () => {
    const row = buildNotification({ metadata: null as unknown as Record<string, unknown> });
    mockReader.getRecentNotificationsByUserId.mockResolvedValue([row] as never);

    const result = await getUserNotifications('user1');
    expect(result[0].metadata).toEqual({});
  });
});

// ─── createUsageAlertIfNeeded ────────────────────────────────────────────

describe('createUsageAlertIfNeeded', () => {
  const baseParams = {
    userId: 'user1',
    feature: 'exercises',
    label: 'Exercises Created',
    current: 0,
    limit: 10,
    windowStart: new Date('2026-03-18T00:00:00Z'),
  };

  it('returns false for unlimited (limit = -1)', async () => {
    const result = await createUsageAlertIfNeeded({ ...baseParams, limit: -1 });
    expect(result).toBe(false);
    expect(mockWriter.insertNotification).not.toHaveBeenCalled();
  });

  it('returns false when under 80%', async () => {
    const result = await createUsageAlertIfNeeded({ ...baseParams, current: 7 }); // 70%
    expect(result).toBe(false);
  });

  it('returns false when alert already sent this window', async () => {
    mockReader.hasRecentUsageAlert.mockResolvedValue(true);

    const result = await createUsageAlertIfNeeded({ ...baseParams, current: 9 });
    expect(result).toBe(false);
    expect(mockWriter.insertNotification).not.toHaveBeenCalled();
  });

  it('creates "at limit" notification when current >= limit', async () => {
    mockReader.hasRecentUsageAlert.mockResolvedValue(false);
    mockWriter.insertNotification.mockResolvedValue(buildNotification() as never);

    const result = await createUsageAlertIfNeeded({ ...baseParams, current: 10 });
    expect(result).toBe(true);
    expect(mockWriter.insertNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Exercises Created limit reached',
        type: 'usage_alert',
        channel: 'in_app',
      })
    );
  });

  it('creates percentage notification when at 80-99%', async () => {
    mockReader.hasRecentUsageAlert.mockResolvedValue(false);
    mockWriter.insertNotification.mockResolvedValue(buildNotification() as never);

    const result = await createUsageAlertIfNeeded({ ...baseParams, current: 8 }); // 80%
    expect(result).toBe(true);
    expect(mockWriter.insertNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Exercises Created usage at 80%',
      })
    );
  });
});
