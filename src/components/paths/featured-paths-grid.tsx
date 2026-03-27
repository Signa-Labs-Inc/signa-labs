'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeaturedPathCard } from './featured-path-card';
import type { FeaturedPath } from './featured-path-card';

const AUTO_DISMISS_MS = 10_000;

export function FeaturedPathsGrid({
  paths,
  className,
}: {
  paths: FeaturedPath[];
  className?: string;
}) {
  const [limitError, setLimitError] = useState<string | null>(null);

  const onUsageLimit = useCallback((message: string) => {
    setLimitError(message);
  }, []);

  // Auto-dismiss after timeout
  useEffect(() => {
    if (!limitError) return;
    const timer = setTimeout(() => setLimitError(null), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [limitError]);

  return (
    <div>
      {limitError && (
        <div className="via-card animate-in fade-in slide-in-from-top-2 mb-5 overflow-hidden rounded-xl border border-amber-500/20 bg-linear-to-r from-amber-500/5 to-amber-500/5 duration-300">
          <div className="flex items-start gap-3 p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-amber-300">Usage limit reached</p>
              <p className="mt-1 text-sm text-amber-300/80">{limitError}</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/pricing">Upgrade Plan</Link>
              </Button>
            </div>
            <button
              onClick={() => setLimitError(null)}
              className="text-muted-foreground hover:text-foreground shrink-0 rounded-md p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className={className}>
        {paths.map((fp, i) => (
          <FeaturedPathCard key={fp.id} path={fp} index={i} onUsageLimit={onUsageLimit} />
        ))}
      </div>
    </div>
  );
}
