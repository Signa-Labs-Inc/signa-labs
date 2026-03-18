import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';

interface UpgradeBannerProps {
  message: string;
  className?: string;
}

export function UpgradeBanner({ message, className }: UpgradeBannerProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-amber-500/20 bg-linear-to-r from-amber-500/5 via-card to-amber-500/5',
        className
      )}
    >
      <div className="flex items-start gap-3 p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
          <Zap className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <p className="font-medium text-amber-300">Usage limit reached</p>
          <p className="mt-1 text-sm text-amber-300/80">{message}</p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href="/pricing">Upgrade Plan</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
