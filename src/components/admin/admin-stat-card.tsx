import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
}

export function AdminStatCard({ title, value, description, icon: Icon }: AdminStatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-6">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">{title}</span>
          <span className="text-foreground text-3xl font-bold tracking-tight">{value}</span>
          {description && <span className="text-muted-foreground/70 text-xs">{description}</span>}
        </div>
        {Icon && (
          <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="text-primary/50 h-4 w-4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminStatCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col gap-2">
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted h-8 w-16 animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
