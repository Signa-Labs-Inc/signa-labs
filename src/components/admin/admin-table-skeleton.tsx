'use client';

interface AdminTableSkeletonProps {
  columns: number;
  rows?: number;
}

export function AdminTableSkeleton({ columns, rows = 5 }: AdminTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-border">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-4 py-4">
              <div
                className="h-4 animate-pulse rounded bg-muted"
                style={{ width: `${50 + Math.random() * 40}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function AdminEmptyState({ message, icon: Icon }: { message: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function AdminFilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
      {children}
    </div>
  );
}
