/**
 * useGenerationJob Hook
 *
 * Uses Trigger.dev's useRealtimeRun to subscribe to generation progress.
 * No custom SSE, no polling, no background_jobs table needed.
 *
 * File: hooks/use-generation-job.ts
 */

'use client';

import { useReducer, useCallback, useMemo } from 'react';
import { useRealtimeRun } from '@trigger.dev/react-hooks';
import type { generateExerciseTask } from '@/trigger/generate-exercise';

// ============================================================
// Types
// ============================================================

type GenerationStatus =
  | 'idle'
  | 'submitting'
  | 'queued'
  | 'generating'
  | 'validating'
  | 'completed'
  | 'failed';

interface GenerationResult {
  exerciseId: string;
  attemptId: string;
  title: string;
}

interface UseGenerationJobReturn {
  status: GenerationStatus;
  progress: string | null;
  error: string | null;
  result: GenerationResult | null;
  startGeneration: (input: {
    prompt: string;
    language: string;
    difficulty?: string;
    exerciseType?: string;
  }) => Promise<void>;
  reset: () => void;
}

// ============================================================
// Reducer
// ============================================================

interface State {
  status: GenerationStatus;
  progress: string | null;
  error: string | null;
  result: GenerationResult | null;
  runId: string | null;
  accessToken: string | null;
}

type Action =
  | { type: 'SUBMIT' }
  | { type: 'QUEUED'; runId: string; accessToken: string }
  | { type: 'FAIL'; error: string }
  | { type: 'RESET' };

const initialState: State = {
  status: 'idle',
  progress: null,
  error: null,
  result: null,
  runId: null,
  accessToken: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SUBMIT':
      return {
        ...initialState,
        status: 'submitting',
        progress: 'Submitting...',
      };
    case 'QUEUED':
      return {
        ...state,
        status: 'queued',
        progress: 'Queued — waiting to start...',
        runId: action.runId,
        accessToken: action.accessToken,
      };
    case 'FAIL':
      return { ...state, status: 'failed', error: action.error };
    case 'RESET':
      return initialState;
  }
}

// ============================================================
// Hook
// ============================================================

export function useGenerationJob(): UseGenerationJobReturn {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Subscribe to real-time updates from Trigger.dev
  const { run, error: realtimeError } = useRealtimeRun<typeof generateExerciseTask>(
    state.runId ?? '',
    {
      accessToken: state.accessToken ?? '',
      enabled: Boolean(state.runId && state.accessToken),
    }
  );

  // Derive status, progress, error, and result from the run object
  // instead of syncing into state via useEffect
  const derived = useMemo(() => {
    if (!run) {
      // Check for realtime connection errors while waiting
      if (
        realtimeError &&
        state.status !== 'idle' &&
        state.status !== 'completed' &&
        state.status !== 'failed'
      ) {
        return {
          status: 'failed' as GenerationStatus,
          progress: state.progress,
          error: 'Connection lost — check your exercises list for the result',
          result: null,
        };
      }
      return {
        status: state.status,
        progress: state.progress,
        error: state.error,
        result: state.result,
      };
    }

    const runMetadata = run.metadata as Record<string, string> | undefined;
    const step = runMetadata?.step;
    const progressMsg = runMetadata?.progress;

    switch (run.status) {
      case 'QUEUED':
      case 'PENDING_VERSION':
      case 'DELAYED':
        return {
          status: 'queued' as GenerationStatus,
          progress: progressMsg ?? 'Queued — waiting to start...',
          error: null,
          result: null,
        };

      case 'EXECUTING':
      case 'DEQUEUED':
      case 'WAITING':
        return {
          status: (step === 'validating' ? 'validating' : 'generating') as GenerationStatus,
          progress: progressMsg ?? (step === 'validating' ? 'Validating...' : 'Generating...'),
          error: null,
          result: null,
        };

      case 'COMPLETED':
        return {
          status: 'completed' as GenerationStatus,
          progress: 'Exercise created!',
          error: null,
          result: run.output ?? null,
        };

      case 'FAILED':
      case 'CRASHED':
      case 'SYSTEM_FAILURE':
      case 'CANCELED':
      case 'EXPIRED':
      case 'TIMED_OUT':
        return {
          status: 'failed' as GenerationStatus,
          progress: null,
          error: run.error?.message ?? 'Generation failed — please try again',
          result: null,
        };

      default:
        return {
          status: state.status,
          progress: progressMsg ?? state.progress,
          error: null,
          result: null,
        };
    }
  }, [run, realtimeError, state.status, state.progress, state.error, state.result]);

  const startGeneration = useCallback(
    async (input: {
      prompt: string;
      language: string;
      difficulty?: string;
      exerciseType?: string;
    }) => {
      dispatch({ type: 'SUBMIT' });

      try {
        const response = await fetch('/api/exercises/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
          const errMsg = body?.error;
          dispatch({
            type: 'FAIL',
            error: typeof errMsg === 'string' ? errMsg : `Request failed (${response.status})`,
          });
          return;
        }

        const data = (await response.json()) as {
          runId: string;
          publicAccessToken: string;
        };

        dispatch({
          type: 'QUEUED',
          runId: data.runId,
          accessToken: data.publicAccessToken,
        });
      } catch {
        dispatch({ type: 'FAIL', error: 'Network error — please try again' });
      }
    },
    []
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    status: derived.status,
    progress: derived.progress,
    error: derived.error,
    result: derived.result,
    startGeneration,
    reset,
  };
}
