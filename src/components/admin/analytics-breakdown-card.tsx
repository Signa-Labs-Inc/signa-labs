import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BreakdownItem {
  label: string;
  value: number;
  percentage: number;
}

interface AnalyticsBreakdownCardProps {
  title: string;
  items: BreakdownItem[];
  icon?: LucideIcon;
}

export function AnalyticsBreakdownCard({ title, items, icon: Icon }: AnalyticsBreakdownCardProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground">{item.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {item.value} <span className="text-xs">({item.percentage}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
