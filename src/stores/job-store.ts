'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type JobType = 'generate-exercise' | 'create-path' | 'generate-path-exercise';

export interface TrackedJob {
  runId: string;
  accessToken: string;
  jobType: JobType;
  label: string;
  pathId?: string;
  createdAt: number;
}

interface JobStore {
  jobs: Record<string, TrackedJob>;
  registerJob: (job: TrackedJob) => void;
  removeJob: (runId: string) => void;
  clearStaleJobs: () => void;
}

// Eviction window: 2× the longest task maxDuration (5 min).
// Keeps jobs long enough for normal completion while limiting how long
// stale entries (and their potentially-expired access tokens) linger.
const STALE_JOB_MS = 10 * 60 * 1000;

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      jobs: {},

      registerJob: (job) =>
        set((state) => ({
          jobs: { ...state.jobs, [job.runId]: job },
        })),

      removeJob: (runId) =>
        set((state) => {
          const { [runId]: _, ...rest } = state.jobs;
          return { jobs: rest };
        }),

      clearStaleJobs: () => {
        const now = Date.now();
        const jobs = get().jobs;
        const fresh = Object.fromEntries(
          Object.entries(jobs).filter(([, job]) => now - job.createdAt < STALE_JOB_MS)
        );
        if (Object.keys(fresh).length !== Object.keys(jobs).length) {
          set({ jobs: fresh });
        }
      },
    }),
    {
      name: 'signa-job-store',
    }
  )
);
