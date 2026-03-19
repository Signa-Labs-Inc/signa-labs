'use client';

import { Loader2 } from 'lucide-react';
import { useJobStore } from '@/stores/job-store';

export function ActiveJobIndicator() {
  const jobCount = useJobStore((s) => Object.keys(s.jobs).length);

  if (jobCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      <Loader2 className="h-3 w-3 animate-spin" />
      {jobCount} {jobCount === 1 ? 'task' : 'tasks'}
    </div>
  );
}
