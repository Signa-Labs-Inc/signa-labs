import Link from 'next/link';
import { ArrowRight, Pause, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PathSummary } from '@/lib/services/paths/paths.types';

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  go: 'Go',
  sql: 'SQL',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  paused: {
    label: 'Paused',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  completed: {
    label: 'Completed',
    className: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  },
  abandoned: { label: 'Abandoned', className: 'bg-muted text-muted-foreground' },
};

type PathCardProps = {
  path: PathSummary;
};

export function PathCard({ path }: PathCardProps) {
  const status = STATUS_CONFIG[path.status] ?? STATUS_CONFIG.active;

  return (
    <Link
      href={`/paths/${path.id}`}
      className="group bg-card hover:border-foreground/20 hover:-translate-y-0.5 hover:shadow-md block rounded-xl border p-5 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-foreground truncate font-semibold">{path.title}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {LANGUAGE_LABELS[path.language] ?? path.language}
            </Badge>
            <Badge variant="outline" className={`shrink-0 text-xs ${status.className}`}>
              {status.label}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm">
            {path.status === 'completed'
              ? `Completed — ${path.totalExercisesCompleted} exercises`
              : `${path.currentMilestoneTitle} — ${path.totalExercisesCompleted}/${path.estimatedTotalExercises} exercises`}
          </p>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  path.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'
                }`}
                style={{ width: `${path.percentComplete}%` }}
              />
            </div>
            <span className="text-muted-foreground shrink-0 text-sm font-medium">
              {path.percentComplete}%
            </span>
          </div>
        </div>

        <div className="mt-1 shrink-0">
          {path.status === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : path.status === 'paused' ? (
            <Pause className="h-5 w-5 text-amber-500" />
          ) : (
            <ArrowRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors" />
          )}
        </div>
      </div>
    </Link>
  );
}
