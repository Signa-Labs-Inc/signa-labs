import Link from 'next/link';
import { CheckCircle2, XCircle, Lightbulb, Play, Trophy } from 'lucide-react';
import type { ActivityItem } from '@/lib/services/dashboard/dashboard.types';
import { LanguageIcon } from '@/components/ui/language-icon';

type ActivityFeedProps = {
  items: ActivityItem[];
};

const EVENT_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; color: string; label: (item: ActivityItem) => string }
> = {
  attempt_started: {
    icon: Play,
    color: 'text-blue-500',
    label: (item) => `Started "${item.exerciseTitle}"`,
  },
  attempt_completed: {
    icon: Trophy,
    color: 'text-emerald-500',
    label: (item) => `Completed "${item.exerciseTitle}"`,
  },
  tests_passed: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    label: (item) => {
      const payload = item.payload as { testsPassed?: number; testsTotal?: number };
      return `All tests passed on "${item.exerciseTitle}" (${payload.testsPassed ?? '?'}/${payload.testsTotal ?? '?'})`;
    },
  },
  tests_failed: {
    icon: XCircle,
    color: 'text-red-400',
    label: (item) => {
      const payload = item.payload as { testsPassed?: number; testsTotal?: number };
      return `${payload.testsPassed ?? 0}/${payload.testsTotal ?? '?'} tests passed on "${item.exerciseTitle}"`;
    },
  },
  hint_revealed: {
    icon: Lightbulb,
    color: 'text-amber-500',
    label: (item) => `Used a hint on "${item.exerciseTitle}"`,
  },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const LANGUAGE_COLORS: Record<string, string> = {
  python: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  typescript: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  javascript: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  go: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  sql: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <h3 className="mb-4 text-sm font-semibold">Recent Activity</h3>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No activity yet. Start an exercise to see your history here.
        </p>
      ) : (
        <div className="max-h-[400px] space-y-1 overflow-y-auto">
          {items.map((item) => {
            const config = EVENT_CONFIG[item.eventType];
            if (!config) return null;

            const Icon = config.icon;

            return (
              <Link
                key={item.id}
                href={`/exercises/${item.exerciseId}`}
                className="hover:bg-muted/50 group flex items-start gap-3 rounded-lg p-2.5 transition-colors"
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm leading-snug">{config.label(item)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        LANGUAGE_COLORS[item.exerciseLanguage] ?? 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <LanguageIcon language={item.exerciseLanguage} className="h-3 w-3" />
                      {item.exerciseLanguage}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatRelativeTime(item.occurredAt)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
