import type { LanguageStat } from '@/lib/services/dashboard/dashboard.types';
import { LanguageIcon } from '@/components/ui/language-icon';

type LanguageBreakdownProps = {
  data: LanguageStat[];
};

const LANGUAGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  python: { label: 'Python', color: 'bg-blue-500', bg: 'bg-blue-100 dark:bg-blue-950' },
  typescript: { label: 'TypeScript', color: 'bg-sky-500', bg: 'bg-sky-100 dark:bg-sky-950' },
  javascript: {
    label: 'JavaScript',
    color: 'bg-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-950',
  },
  go: { label: 'Go', color: 'bg-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-950' },
  sql: { label: 'SQL', color: 'bg-orange-500', bg: 'bg-orange-100 dark:bg-orange-950' },
  ruby: { label: 'Ruby', color: 'bg-red-500', bg: 'bg-red-100 dark:bg-red-950' },
};

export function LanguageBreakdown({ data }: LanguageBreakdownProps) {
  const totalCompleted = data.reduce((sum, lang) => sum + lang.completed, 0);
  const maxCompleted = Math.max(...data.map((l) => l.completed), 1);

  return (
    <div className="bg-card rounded-xl border p-5">
      <h3 className="mb-4 text-sm font-semibold">Languages</h3>

      {data.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          Complete an exercise to see your language breakdown
        </p>
      ) : (
        <div className="space-y-4">
          {data.map((lang) => {
            const config = LANGUAGE_CONFIG[lang.language] ?? {
              label: lang.language,
              color: 'bg-gray-500',
              bg: 'bg-gray-100 dark:bg-gray-900',
            };
            const percentage =
              totalCompleted > 0 ? Math.round((lang.completed / totalCompleted) * 100) : 0;
            const barWidth = Math.max((lang.completed / maxCompleted) * 100, 2);

            return (
              <div key={lang.language}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <LanguageIcon language={lang.language} className="h-4 w-4" />
                    {config.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {lang.completed} completed
                    </span>
                    <span className="text-muted-foreground/60 text-xs">{percentage}%</span>
                  </div>
                </div>
                <div className={`h-2.5 rounded-full ${config.bg} overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${config.color} transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                {lang.attempted > lang.completed && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {lang.attempted - lang.completed} in progress
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
