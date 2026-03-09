'use client';

import { useEffect, useRef, useCallback } from 'react';

type TimeTrackingConfig = {
  exerciseId: string;
  attemptId: string;
  /** How often to sync accumulated time to the server (default: 30s) */
  syncIntervalMs?: number;
  /** Seconds of inactivity before pausing the timer (default: 120s) */
  idleTimeoutMs?: number;
  enabled?: boolean;
};

/**
 * useTimeTracking
 *
 * Tracks active time the user spends in the workspace:
 * - Counts seconds while the tab is visible and the user is active
 * - Pauses when the tab is hidden or the user is idle
 * - Syncs accumulated time to the backend every 30 seconds
 * - Sends final sync on page unload
 */
export function useTimeTracking({
  exerciseId,
  attemptId,
  syncIntervalMs = 30_000,
  idleTimeoutMs = 120_000,
  enabled = true,
}: TimeTrackingConfig) {
  const accumulatedSecondsRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());
  const isActiveRef = useRef<boolean>(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const isSyncingRef = useRef<boolean>(false);

  // Sync accumulated time to the server
  const syncTime = useCallback(async () => {
    const seconds = accumulatedSecondsRef.current;
    if (seconds === 0 || isSyncingRef.current) return;

    isSyncingRef.current = true;
    // Cap to match server-side max (300s) so we don't over-subtract
    const secondsToSync = Math.min(seconds, 300);

    try {
      const response = await fetch(`/api/exercises/${exerciseId}/attempts/${attemptId}/time`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seconds: secondsToSync }),
      });

      if (response.ok) {
        // Only subtract what we synced (more time may have accumulated during the request)
        accumulatedSecondsRef.current -= secondsToSync;
        if (accumulatedSecondsRef.current < 0) accumulatedSecondsRef.current = 0;
      }
    } catch {
      // Silent fail — will retry on next sync
    } finally {
      isSyncingRef.current = false;
    }
  }, [exerciseId, attemptId]);

  // Reset idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    isActiveRef.current = true;
    lastTickRef.current = Date.now();

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = setTimeout(() => {
      isActiveRef.current = false;
    }, idleTimeoutMs);
  }, [idleTimeoutMs]);

  // Main tick — accumulates time every second when active
  useEffect(() => {
    if (!enabled) return;

    // Start the 1-second tick
    tickIntervalRef.current = setInterval(() => {
      if (isActiveRef.current && document.visibilityState === 'visible') {
        accumulatedSecondsRef.current += 1;
      }
    }, 1000);

    // Start the sync interval
    syncIntervalRef.current = setInterval(() => {
      syncTime();
    }, syncIntervalMs);

    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      // Flush remaining seconds on unmount (e.g. SPA navigation)
      syncTime();
    };
  }, [enabled, syncIntervalMs, syncTime]);

  // Track user activity (keyboard, mouse, scroll)
  useEffect(() => {
    if (!enabled) return;

    resetIdleTimer();

    const events = ['keydown', 'mousemove', 'mousedown', 'scroll', 'touchstart'];
    const handler = () => resetIdleTimer();

    for (const event of events) {
      document.addEventListener(event, handler, { passive: true });
    }

    return () => {
      for (const event of events) {
        document.removeEventListener(event, handler);
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [enabled, resetIdleTimer]);

  // Pause on tab blur, resume on focus
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncTime();
      } else {
        resetIdleTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, syncTime, resetIdleTimer]);

  // Final sync on page unload / tab discard
  useEffect(() => {
    if (!enabled) return;

    const flushBeacon = () => {
      const seconds = accumulatedSecondsRef.current;
      if (seconds === 0) return;

      fetch(`/api/exercises/${exerciseId}/attempts/${attemptId}/time`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seconds: Math.min(seconds, 300) }),
        keepalive: true,
      });
    };

    window.addEventListener('beforeunload', flushBeacon);
    window.addEventListener('pagehide', flushBeacon);
    return () => {
      window.removeEventListener('beforeunload', flushBeacon);
      window.removeEventListener('pagehide', flushBeacon);
    };
  }, [enabled, exerciseId, attemptId]);
}
