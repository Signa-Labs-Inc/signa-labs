import { NextRequest } from 'next/server';

vi.mock('@/lib/services/auth/auth.service', () => ({
  requireCurrentUser: vi.fn(),
}));

vi.mock('@/lib/services/notifications/notifications.service', () => ({
  getUserNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
}));

import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from '@/lib/services/notifications/notifications.service';
import { GET } from '../route';
import { mockUser } from '@/test/helpers/mock-auth';

const mockAuth = vi.mocked(requireCurrentUser);
const mockGetNotifications = vi.mocked(getUserNotifications);
const mockGetUnread = vi.mocked(getUnreadNotificationCount);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(mockUser as never);
});

describe('GET /api/notifications', () => {
  it('returns notifications and unread count', async () => {
    mockGetNotifications.mockResolvedValue([]);
    mockGetUnread.mockResolvedValue(3);

    const req = new NextRequest('http://localhost/api/notifications');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.notifications).toEqual([]);
    expect(body.unreadCount).toBe(3);
  });

  it('respects limit and offset params', async () => {
    mockGetNotifications.mockResolvedValue([]);
    mockGetUnread.mockResolvedValue(0);

    const req = new NextRequest('http://localhost/api/notifications?limit=5&offset=10');
    await GET(req);
    expect(mockGetNotifications).toHaveBeenCalledWith(mockUser.id, 5, 10);
  });

  it('clamps limit to 1-50 range', async () => {
    mockGetNotifications.mockResolvedValue([]);
    mockGetUnread.mockResolvedValue(0);

    const req = new NextRequest('http://localhost/api/notifications?limit=100');
    await GET(req);
    expect(mockGetNotifications).toHaveBeenCalledWith(mockUser.id, 50, 0);
  });

  it('returns 401 when not authenticated', async () => {
    const { UnauthorizedError } = await import('@/lib/utils/errors');
    mockAuth.mockRejectedValue(new UnauthorizedError());

    const req = new NextRequest('http://localhost/api/notifications');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
