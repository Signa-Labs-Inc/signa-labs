'use client';

import { useMemo, useState } from 'react';
import type { HeatmapDay } from '@/lib/services/dashboard/dashboard.types';

type ActivityHeatmapProps = {
  data: HeatmapDay[];
};

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const INTENSITY_COLORS = [
  'bg-muted', // 0
  'bg-emerald-200 dark:bg-emerald-900', // 1-2
  'bg-emerald-400 dark:bg-emerald-700', // 3-5
  'bg-emerald-500 dark:bg-emerald-500', // 6-9
  'bg-emerald-700 dark:bg-emerald-400', // 10+
];

function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const { weeks, monthLabels } = useMemo(() => {
    // Build a map of date -> count
    const countMap = new Map<string, number>();
    for (const day of data) {
      countMap.set(day.date, day.count);
    }

    // Generate 52 weeks of dates ending today
    const today = new Date();
    const cells: { date: string; count: number; dayOfWeek: number }[] = [];

    // Start from 52 weeks ago, aligned to Sunday
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    // Align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const current = new Date(start);
    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      cells.push({
        date: dateStr,
        count: countMap.get(dateStr) ?? 0,
        dayOfWeek: current.getDay(),
      });
      current.setDate(current.getDate() + 1);
    }

    // Group into weeks (columns)
    const weekGroups: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weekGroups.push(cells.slice(i, i + 7));
    }

    // Calculate month label positions
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < weekGroups.length; w++) {
      const firstDay = weekGroups[w][0];
      if (firstDay) {
        const month = new Date(firstDay.date + 'T00:00:00').getMonth();
        if (month !== lastMonth) {
          labels.push({ label: MONTH_LABELS[month], weekIndex: w });
          lastMonth = month;
        }
      }
    }

    return { weeks: weekGroups, monthLabels: labels };
  }, [data]);

  return (
    <div className="bg-card rounded-xl border p-5">
      <h3 className="mb-4 text-sm font-semibold">Activity</h3>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1" style={{ minWidth: 'max-content' }}>
          {/* Month labels */}
          <div className="ml-8 flex">
            {monthLabels.map(({ label, weekIndex }, i) => (
              <span
                key={`${label}-${i}`}
                className="text-muted-foreground text-xs"
                style={{
                  position: 'relative',
                  left: `${weekIndex * 14}px`,
                  marginRight:
                    i < monthLabels.length - 1
                      ? `${((monthLabels[i + 1]?.weekIndex ?? weekIndex) - weekIndex) * 14 - 28}px`
                      : 0,
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="mr-1.5 flex flex-col gap-0.5">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="flex h-[12px] items-center">
                  <span className="text-muted-foreground w-6 text-right text-[10px]">{label}</span>
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const cell = week.find((c) => c.dayOfWeek === dayIndex);
                  if (!cell) {
                    return <div key={dayIndex} className="h-[12px] w-[12px]" />;
                  }

                  const intensity = getIntensity(cell.count);
                  return (
                    <div
                      key={dayIndex}
                      className={`h-[12px] w-[12px] rounded-[2px] ${INTENSITY_COLORS[intensity]} hover:ring-foreground/20 cursor-pointer transition-colors hover:ring-1`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          text: `${cell.count} submission${cell.count !== 1 ? 's' : ''} on ${formatDate(cell.date)}`,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-2 ml-8 flex items-center gap-1">
            <span className="text-muted-foreground mr-1 text-[10px]">Less</span>
            {INTENSITY_COLORS.map((color, i) => (
              <div key={i} className={`h-[12px] w-[12px] rounded-[2px] ${color}`} />
            ))}
            <span className="text-muted-foreground ml-1 text-[10px]">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="bg-foreground text-background pointer-events-none fixed z-50 rounded px-2 py-1 text-xs font-medium shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
