/**
 * usePathExercise Hook
 *
 * Uses Trigger.dev's useRealtimeRun to subscribe to path exercise generation progress.
 */

'use client';

import { useReducer, useCallback, useMemo } from 'react';
import { useRealtimeRun } from '@trigger.dev/react-hooks';
import type { generatePathExerciseTask } from '@/trigger/generate-path-exercise';

// ============================================================
// Types
// ============================================================

type PathExerciseStatus =
  | 'idle'
  | 'submitting'
  | 'queued'
  | 'analyzing'
  | 'generating'
  | 'completed'
  | 'failed';

interface PathExerciseResult {
  exerciseId: string;
  attemptId: string;
  pathExerciseId: string;
  milestoneTitle: string;
  milestoneIndex: number;
  exerciseIndex: number;
  reasoning: string;
}

interface UsePathExerciseReturn {
  status: PathExerciseStatus;
  progress: string | null;
  error: string | null;
  result: PathExerciseResult | null;
  generateNext: (pathId: string) => Promise<void>;
  reset: () => void;
}

// ============================================================
// Reducer
// ============================================================

interface State {
  status: PathExerciseStatus;
  progress: string | null;
  error: string | null;
  result: PathExerciseResult | null;
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
      return { ...initialState, status: 'submitting', progress: 'Submitting...' };
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

export function usePathExercise(): UsePathExerciseReturn {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { run, error: realtimeError } = useRealtimeRun<typeof generatePathExerciseTask>(
    state.runId ?? '',
    {
      accessToken: state.accessToken ?? '',
      enabled: Boolean(state.runId && state.accessToken),
    }
  );

  const derived = useMemo(() => {
    if (!run) {
      if (
        realtimeError &&
        state.status !== 'idle' &&
        state.status !== 'completed' &&
        state.status !== 'failed'
      ) {
        return {
          status: 'failed' as PathExerciseStatus,
          progress: state.progress,
          error: 'Connection lost — check your path for the result',
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
          status: 'queued' as PathExerciseStatus,
          progress: progressMsg ?? 'Queued — waiting to start...',
          error: null,
          result: null,
        };

      case 'EXECUTING':
      case 'DEQUEUED':
      case 'WAITING':
        return {
          status: (step === 'analyzing' ? 'analyzing' : 'generating') as PathExerciseStatus,
          progress: progressMsg ?? 'Generating your next exercise...',
          error: null,
          result: null,
        };

      case 'COMPLETED':
        return {
          status: 'completed' as PathExerciseStatus,
          progress: 'Exercise ready!',
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
          status: 'failed' as PathExerciseStatus,
          progress: null,
          error: run.error?.message ?? 'Exercise generation failed — please try again',
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

  const generateNext = useCallback(async (pathId: string) => {
    dispatch({ type: 'SUBMIT' });

    try {
      const response = await fetch(`/api/paths/${pathId}/next`, { method: 'POST' });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
        const errMsg = body?.error;
        dispatch({
          type: 'FAIL',
          error: typeof errMsg === 'string' ? errMsg : `Request failed (${response.status})`,
        });
        return;
      }

      const data = (await response.json()) as { runId: string; publicAccessToken: string };
      dispatch({ type: 'QUEUED', runId: data.runId, accessToken: data.publicAccessToken });
    } catch {
      dispatch({ type: 'FAIL', error: 'Network error — please try again' });
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    status: derived.status,
    progress: derived.progress,
    error: derived.error,
    result: derived.result,
    generateNext,
    reset,
  };
}
