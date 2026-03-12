import Link from 'next/link';
import { ArrowRight, Pause, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LanguageIcon } from '@/components/ui/language-icon';
import type { PathSummary } from '@/lib/services/paths/paths.types';

// ============================================================
// Status config
// ============================================================

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

// ============================================================
// Helpers
// ============================================================

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

// ============================================================
// Component
// ============================================================

type PathCardProps = {
  path: PathSummary;
  spotlight?: boolean;
};

export function PathCard({ path, spotlight = false }: PathCardProps) {
  const status = STATUS_CONFIG[path.status] ?? STATUS_CONFIG.active;
  const isCompleted = path.status === 'completed';
  const isActive = path.status === 'active';

  return (
    <Link
      href={`/paths/${path.id}`}
      className={`group block rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        spotlight
          ? 'bg-linear-to-br from-card via-card to-primary/5 border-primary/20 hover:border-primary/40'
          : 'bg-card hover:border-foreground/20'
      }`}
    >
      <div className="p-5 md:p-6">
        <div className="flex items-start gap-4">
          {/* Language icon */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              spotlight ? 'bg-primary/15' : 'bg-muted'
            }`}
          >
            <LanguageIcon language={path.language} className="h-7 w-7" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold">{path.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${status.className}`}>
                    {status.label}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    Started {timeAgo(path.createdAt)}
                  </span>
                  {path.updatedAt && path.updatedAt !== path.createdAt && (
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      Active {timeAgo(path.updatedAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA / Status icon */}
              <div className="shrink-0">
                {spotlight && isActive ? (
                  <Button size="sm" className="gap-1.5">
                    Continue
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : path.status === 'paused' ? (
                  <Pause className="h-5 w-5 text-amber-500" />
                ) : (
                  <ArrowRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors" />
                )}
              </div>
            </div>

            {/* Current milestone */}
            <p className="text-muted-foreground mt-3 text-sm">
              {isCompleted
                ? `Completed — ${path.totalExercisesCompleted} exercises finished`
                : `${path.currentMilestoneTitle}`}
            </p>

            {/* Progress section */}
            <div className="mt-4 flex items-center gap-4">
              {/* Progress bar */}
              <div className="flex flex-1 items-center gap-3">
                <div className="bg-muted h-2.5 flex-1 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-linear-to-r from-primary to-violet-400'
                    }`}
                    style={{ width: `${path.percentComplete}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {path.percentComplete}%
                </span>
              </div>

              {/* Exercise count */}
              <span className="text-muted-foreground shrink-0 text-xs">
                {path.totalExercisesCompleted}/{path.estimatedTotalExercises} exercises
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
