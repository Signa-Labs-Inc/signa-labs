import { Skeleton } from '@/components/ui/skeleton';

export default function PathLoading() {
  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <div className="border-border border-b">
        <div className="mx-auto max-w-4xl px-6 py-8 md:py-12">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />
          {/* Progress bar */}
          <Skeleton className="mt-6 h-3 w-full rounded-full" />
          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Milestones section */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
