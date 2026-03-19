import { Skeleton } from '@/components/ui/skeleton';

export default function ExerciseLoading() {
  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Toolbar skeleton */}
      <div className="flex h-12 items-center gap-3 border-b px-4">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-5 w-48" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      {/* Workspace skeleton */}
      <div className="flex flex-1">
        <Skeleton className="h-full w-[400px] shrink-0" />
        <Skeleton className="h-full flex-1" />
      </div>
    </div>
  );
}
