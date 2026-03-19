import { NextRequest } from 'next/server';

vi.mock('@/lib/services/auth/auth.service', () => ({
  requireCurrentUser: vi.fn(),
}));

vi.mock('@/lib/services/notifications/notifications.service', () => ({
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import {
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/services/notifications/notifications.service';
import { POST } from '../../notifications/read/route';
import { mockUser } from '@/test/helpers/mock-auth';

const mockAuth = vi.mocked(requireCurrentUser);
const mockMarkOne = vi.mocked(markNotificationRead);
const mockMarkAll = vi.mocked(markAllNotificationsRead);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(mockUser as never);
});

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/notifications/read', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/notifications/read', () => {
  it('marks single notification as read', async () => {
    mockMarkOne.mockResolvedValue({ id: '123' } as never);

    const res = await POST(makeRequest({ notificationId: '12345678-1234-1234-1234-123456789abc' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('marks all notifications as read', async () => {
    mockMarkAll.mockResolvedValue(5);

    const res = await POST(makeRequest({ all: true }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.marked).toBe(5);
  });

  it('returns 400 when neither notificationId nor all provided', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid notification ID format', async () => {
    const res = await POST(makeRequest({ notificationId: 'invalid-id' }));
    expect(res.status).toBe(400);
  });
});
