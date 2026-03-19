import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from './notification-bell';

function makeNotification(overrides?: Partial<{
  id: string;
  type: string;
  subject: string | null;
  body: string | null;
  readAt: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}>) {
  return {
    id: 'n1',
    type: 'billing',
    subject: 'Payment received',
    body: 'Your payment of $19.99 was processed.',
    readAt: null,
    createdAt: new Date().toISOString(),
    metadata: {},
    ...overrides,
  };
}

function mockNotificationsResponse(
  notifications: ReturnType<typeof makeNotification>[],
  unreadCount: number
) {
  return new Response(
    JSON.stringify({ notifications, unreadCount }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders bell icon', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockNotificationsResponse([], 0)
    );
    await act(async () => {
      render(<NotificationBell />);
    });
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('fetches notifications on mount', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockNotificationsResponse([], 0)
    );
    await act(async () => {
      render(<NotificationBell />);
    });
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/api/notifications'));
  });

  it('shows unread count badge', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockNotificationsResponse([makeNotification()], 3)
    );
    await act(async () => {
      render(<NotificationBell />);
    });
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('caps badge at "9+"', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockNotificationsResponse([makeNotification()], 15)
    );
    await act(async () => {
      render(<NotificationBell />);
    });
    await waitFor(() => {
      expect(screen.getByText('9+')).toBeInTheDocument();
    });
  });

  it('clicking bell opens dropdown', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockNotificationsResponse([], 0)
    );
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await act(async () => {
      render(<NotificationBell />);
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows "No notifications" when empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockNotificationsResponse([], 0)
    );
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await act(async () => {
      render(<NotificationBell />);
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('renders notification items', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockNotificationsResponse([makeNotification({ subject: 'Plan upgraded' })], 1)
    );
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await act(async () => {
      render(<NotificationBell />);
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Plan upgraded')).toBeInTheDocument();
    });
  });

  it('mark single read', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockNotificationsResponse([makeNotification({ id: 'n1', subject: 'Test' })], 1)
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await act(async () => {
      render(<NotificationBell />);
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));
    await waitFor(() => expect(screen.getByText('Test')).toBeInTheDocument());

    await user.click(screen.getByText('Test'));

    await waitFor(() => {
      const readCall = fetchSpy.mock.calls.find(
        (c) => typeof c[0] === 'string' && c[0].includes('/api/notifications/read')
      );
      expect(readCall).toBeTruthy();
      const body = JSON.parse((readCall![1] as RequestInit).body as string);
      expect(body.notificationId).toBe('n1');
    });
  });

  it('mark all read', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockNotificationsResponse([makeNotification()], 2)
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await act(async () => {
      render(<NotificationBell />);
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));
    await waitFor(() => expect(screen.getByText('Mark all read')).toBeInTheDocument());

    await user.click(screen.getByText('Mark all read'));

    await waitFor(() => {
      const readCall = fetchSpy.mock.calls.find(
        (c) => typeof c[0] === 'string' && c[0].includes('/api/notifications/read')
      );
      expect(readCall).toBeTruthy();
      const body = JSON.parse((readCall![1] as RequestInit).body as string);
      expect(body.all).toBe(true);
    });
  });

  it('load more fetches next page', async () => {
    // Return exactly 10 items so hasMore = true
    const tenItems = Array.from({ length: 10 }, (_, i) =>
      makeNotification({ id: `n${i}`, subject: `Notification ${i}` })
    );

    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockNotificationsResponse(tenItems, 2))
      .mockResolvedValueOnce(mockNotificationsResponse([makeNotification({ id: 'n10', subject: 'Page 2' })], 2));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await act(async () => {
      render(<NotificationBell />);
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));
    await waitFor(() => expect(screen.getByText('Load more')).toBeInTheDocument());

    await user.click(screen.getByText('Load more'));

    await waitFor(() => {
      const secondFetch = fetchSpy.mock.calls.find(
        (c) => typeof c[0] === 'string' && c[0].includes('offset=10')
      );
      expect(secondFetch).toBeTruthy();
    });
  });

  it('polls every 120 seconds', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockNotificationsResponse([], 0)
    );

    await act(async () => {
      render(<NotificationBell />);
    });

    // Initial fetch
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Advance 120 seconds
    await act(async () => {
      vi.advanceTimersByTime(120_000);
    });

    expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
