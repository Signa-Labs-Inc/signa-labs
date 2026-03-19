'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Calendar, Filter } from 'lucide-react';
import type { AnalyticsTimeRange } from '@/lib/services/admin/admin.types';

const TIME_RANGES: { value: AnalyticsTimeRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '6mo', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' },
];

const PLAN_OPTIONS = [
  { value: 'all', label: 'All Plans' },
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'churned', label: 'Churned' },
  { value: 'trial', label: 'Trial' },
];

export function AnalyticsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRange = (searchParams.get('range') as AnalyticsTimeRange) || '30d';
  const currentPlan = searchParams.get('plan') || 'all';
  const currentStatus = searchParams.get('status') || 'all';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' && key !== 'range') {
        params.delete(key);
      } else if (key === 'range' && value === '30d') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.push(`/admin/analytics${qs ? `?${qs}` : ''}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3">
      {/* Time range */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div className="flex rounded-md border border-border">
          {TIME_RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateParam('range', value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md ${
                currentRange === value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Plan filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <select
          value={currentPlan}
          onChange={(e) => updateParam('plan', e.target.value)}
          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground"
        >
          {PLAN_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Status filter */}
      <select
        value={currentStatus}
        onChange={(e) => updateParam('status', e.target.value)}
        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground"
      >
        {STATUS_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
