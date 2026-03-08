'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type AutoSaveConfig = {
  exerciseId: string;
  attemptId: string;
  fileContents: Record<string, string>;
  debounceMs?: number;
  enabled?: boolean;
};

type AutoSaveReturn = {
  saveStatus: SaveStatus;
  /** Cancel pending saves and mark current state as saved. Call before resetting editor content. */
  cancelPendingSaves: () => void;
};

export function useAutoSave({
  exerciseId,
  attemptId,
  fileContents,
  debounceMs = 1500,
  enabled = true,
}: AutoSaveConfig): AutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const lastSavedRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isSavingRef = useRef<boolean>(false);

  const currentSnapshot = JSON.stringify(fileContents);
  const snapshotRef = useRef(currentSnapshot);
  const contentsRef = useRef(fileContents);
  snapshotRef.current = currentSnapshot;
  contentsRef.current = fileContents;

  const cancelledRef = useRef(false);

  const cancelPendingSaves = useCallback(() => {
    // Clear any pending debounce timer
    if (timerRef.current) clearTimeout(timerRef.current);
    // Mark cancelled so in-flight save's follow-up is suppressed
    cancelledRef.current = true;
    // Treat current snapshot as already saved so no stale save retriggers
    lastSavedRef.current = snapshotRef.current;
  }, []);

  const saveDraft = useCallback(async () => {
    if (snapshotRef.current === lastSavedRef.current) return;
    if (isSavingRef.current) return;

    cancelledRef.current = false;
    isSavingRef.current = true;
    setSaveStatus('saving');
    const savingSnapshot = snapshotRef.current;

    try {
      const response = await fetch(`/api/exercises/${exerciseId}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, files: contentsRef.current }),
      });

      if (response.ok) {
        lastSavedRef.current = savingSnapshot;
        setSaveStatus('saved');

        // Reset to idle after 2 seconds
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
      // If edits happened while saving, trigger a follow-up save (unless cancelled by reset)
      if (!cancelledRef.current && snapshotRef.current !== lastSavedRef.current) {
        saveDraft();
      }
    }
  }, [exerciseId, attemptId]);

  // Debounced save on content change
  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      saveDraft();
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSnapshot, debounceMs, enabled, saveDraft]);

  // Save on tab blur
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveDraft();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, saveDraft]);

  // Save on page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (snapshotRef.current === lastSavedRef.current) return;

      fetch(`/api/exercises/${exerciseId}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, files: contentsRef.current }),
        keepalive: true,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, exerciseId, attemptId]);

  return { saveStatus, cancelPendingSaves };
}
