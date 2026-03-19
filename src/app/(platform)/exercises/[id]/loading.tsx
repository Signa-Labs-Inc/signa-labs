import { Skeleton } from '@/components/ui/skeleton';

export default function ExerciseLoading() {
  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Top bar */}
      <div className="bg-card flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Instructions */}
        <div className="bg-card flex w-[400px] shrink-0 flex-col border-r">
          {/* Tab bar */}
          <div className="bg-muted/30 flex items-center gap-1 border-b px-2">
            <Skeleton className="my-2 h-5 w-20" />
            <Skeleton className="my-2 h-5 w-14" />
          </div>
          {/* Instructions content */}
          <div className="flex-1 space-y-4 p-5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
            <div className="pt-2" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Right panel: Code editor */}
        <div className="flex flex-1 flex-col">
          {/* File tabs */}
          <div className="bg-muted/30 flex items-center gap-1 border-b px-2">
            <Skeleton className="my-1.5 h-7 w-28 rounded" />
            <Skeleton className="my-1.5 h-7 w-24 rounded" />
          </div>
          {/* Editor lines */}
          <div className="flex-1 space-y-2 p-4">
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-5" />
                <Skeleton
                  className="h-3"
                  style={{
                    width: `${Math.max(15, Math.min(85, 30 + Math.sin(i * 1.7) * 40))}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
