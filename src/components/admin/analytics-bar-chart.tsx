'use client';

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function AnalyticsBarChart({ data, height = 160 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = item.value === 0 ? 0 : Math.max((item.value / maxValue) * 100, 2);
        return (
          <div key={i} className="group relative flex flex-1 flex-col items-center justify-end" tabIndex={0} role="img" aria-label={`${item.label}: ${item.value}`}>
            <div className="absolute -top-7 hidden rounded bg-foreground px-1.5 py-0.5 text-xs text-background group-hover:block group-focus:block">
              {item.value}
            </div>
            <div
              className="w-full rounded-t bg-primary/70 transition-colors group-hover:bg-primary"
              style={{ height: `${barHeight}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsBarChartLabels({ data, maxLabels = 6 }: { data: { label: string }[]; maxLabels?: number }) {
  if (data.length === 0) return null;

  const step = Math.max(1, Math.floor(data.length / maxLabels));
  return (
    <div className="mt-1.5 flex justify-between">
      {data.map((item, i) => {
        if (i % step !== 0 && i !== data.length - 1) return null;
        return (
          <span key={i} className="text-[10px] text-muted-foreground">
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
