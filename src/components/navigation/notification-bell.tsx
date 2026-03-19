'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';

type Notification = {
  id: string;
  type: string;
  subject: string | null;
  body: string | null;
  readAt: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const refreshKey = useNotificationStore((s) => s.refreshKey);

  const PAGE_SIZE = 10;

  const fetchNotifications = useCallback(async (offset = 0, append = false) => {
    try {
      const res = await fetch(`/api/notifications?limit=${PAGE_SIZE}&offset=${offset}`);
      if (!res.ok) return;
      const data = await res.json();
      const fetched = data.notifications ?? [];
      setNotifications((prev) => append ? [...prev, ...fetched] : fetched);
      setUnreadCount(data.unreadCount ?? 0);
      setHasMore(fetched.length === PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(), 120_000);
    return () => clearInterval(interval);
  }, [fetchNotifications, refreshKey]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    await fetchNotifications(notifications.length, true);
    setLoadingMore(false);
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-md border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="max-h-80 divide-y divide-border overflow-y-auto">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.readAt) handleMarkRead(n.id);
                    if (n.metadata.url) {
                      router.push(n.metadata.url as string);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-accent/30 ${
                    n.readAt ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.readAt && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                    <div className={n.readAt ? 'pl-4' : ''}>
                      <p className="text-sm font-medium">{n.subject}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground/60">
                        {new Date(n.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {hasMore && (
                <div className="px-4 py-2 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="text-xs text-primary hover:underline disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                    ) : (
                      'Load more'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
