import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 pb-2">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="bg-primary/10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <Icon className="text-primary h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
