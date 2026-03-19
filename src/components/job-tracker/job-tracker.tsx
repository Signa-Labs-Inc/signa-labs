'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRealtimeRun } from '@trigger.dev/react-hooks';
import { toast } from 'sonner';
import { useJobStore, type TrackedJob } from '@/stores/job-store';
import { useNotificationStore } from '@/stores/notification-store';
import type { generateExerciseTask } from '@/trigger/generate-exercise';
import type { createPathTask } from '@/trigger/create-path';
import type { generatePathExerciseTask } from '@/trigger/generate-path-exercise';

type AnyTaskType = typeof generateExerciseTask | typeof createPathTask | typeof generatePathExerciseTask;

const TERMINAL_STATUSES = new Set([
  'COMPLETED',
  'FAILED',
  'CRASHED',
  'SYSTEM_FAILURE',
  'CANCELED',
  'EXPIRED',
  'TIMED_OUT',
]);

function JobSubscriber({ job }: { job: TrackedJob }) {
  const router = useRouter();
  const hasHandled = useRef(false);

  const { run } = useRealtimeRun<AnyTaskType>(job.runId, {
    accessToken: job.accessToken,
    enabled: true,
  });

  useEffect(() => {
    if (!run || hasHandled.current) return;
    if (!TERMINAL_STATUSES.has(run.status)) return;

    // Check if the originating hook already removed this job
    if (!useJobStore.getState().jobs[job.runId]) return;

    hasHandled.current = true;
    useJobStore.getState().removeJob(job.runId);
    useNotificationStore.getState().triggerRefresh();

    if (run.status === 'COMPLETED') {
      const output = run.output as Record<string, string> | undefined;
      const navigateUrl = getSuccessUrl(job, output);

      toast.success(getSuccessMessage(job), {
        description: getSuccessDescription(job, output),
        action: navigateUrl
          ? {
              label: getActionLabel(job),
              onClick: () => router.push(navigateUrl),
            }
          : undefined,
        duration: 10000,
      });
    } else {
      toast.error(`${job.label} failed`, {
        description: run.error?.message ?? 'Something went wrong. Please try again.',
        duration: 8000,
      });
    }
  }, [run, job, router]);

  return null;
}

function getSuccessMessage(job: TrackedJob): string {
  switch (job.jobType) {
    case 'create-path':
      return 'Learning path created!';
    case 'generate-exercise':
    case 'generate-path-exercise':
      return 'Exercise ready!';
  }
}

function getSuccessDescription(
  job: TrackedJob,
  output?: Record<string, string>
): string {
  if (!output) return '';
  switch (job.jobType) {
    case 'generate-exercise':
    case 'generate-path-exercise':
      return output.title ? `"${output.title}" has been generated` : '';
    case 'create-path':
      return output.title ? `"${output.title}" is ready` : '';
  }
}

function getSuccessUrl(
  job: TrackedJob,
  output?: Record<string, string>
): string | null {
  if (!output) return null;
  switch (job.jobType) {
    case 'generate-exercise':
    case 'generate-path-exercise':
      return output.exerciseId ? `/exercises/${output.exerciseId}` : null;
    case 'create-path':
      return output.pathId ? `/paths/${output.pathId}` : null;
  }
}

function getActionLabel(job: TrackedJob): string {
  switch (job.jobType) {
    case 'generate-exercise':
    case 'generate-path-exercise':
      return 'Start Exercise';
    case 'create-path':
      return 'View Path';
  }
}

export function JobTracker() {
  const jobs = useJobStore((s) => s.jobs);

  useEffect(() => {
    useJobStore.getState().clearStaleJobs();

    function handleFocus() {
      useJobStore.getState().clearStaleJobs();
    }
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const activeJobs = Object.values(jobs);

  return (
    <>
      {activeJobs.map((job) => (
        <JobSubscriber key={job.runId} job={job} />
      ))}
    </>
  );
}
