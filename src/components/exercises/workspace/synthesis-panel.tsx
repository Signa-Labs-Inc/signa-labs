'use client';

import { CheckCircle2, FlaskConical, ArrowRight, Globe, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SynthesisContent } from '@/lib/services/teaching/teaching.types';

// ============================================================
// Types
// ============================================================

type SynthesisPanelProps = {
  synthesis: SynthesisContent;
  pathId?: string | null;
  onNextExercise?: () => void;
  onViewPaths?: () => void;
};

// ============================================================
// Component
// ============================================================

export function SynthesisPanel({
  synthesis,
  pathId,
  onNextExercise,
  onViewPaths,
}: SynthesisPanelProps) {
  return (
    <div className="space-y-4 border-t border-emerald-200 bg-emerald-50/50 px-4 py-5 dark:border-emerald-800 dark:bg-emerald-950/30">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          What You Learned
        </span>
      </div>

      {/* Summary */}
      <p className="text-foreground text-sm font-medium">{synthesis.summary}</p>

      {/* Connections */}
      {synthesis.connections && (
        <div className="flex items-start gap-2">
          <Link2 className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="text-muted-foreground text-sm">{synthesis.connections}</p>
        </div>
      )}

      {/* Real world */}
      {synthesis.realWorld && (
        <div className="flex items-start gap-2">
          <Globe className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="text-muted-foreground text-sm">{synthesis.realWorld}</p>
        </div>
      )}

      {/* Next preview (from path) */}
      {synthesis.nextPreview && (
        <div className="bg-primary/5 border-primary/10 rounded-md border px-3 py-2">
          <p className="text-foreground text-sm">
            <span className="font-medium">Up next: </span>
            {synthesis.nextPreview}
          </p>
        </div>
      )}

      {/* CTAs */}
      <div className="flex items-center gap-3 pt-1">
        {onNextExercise && pathId && (
          <Button onClick={onNextExercise} size="sm" className="gap-2">
            Continue to Next Exercise
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
        {!pathId && onViewPaths && (
          <Button onClick={onViewPaths} variant="outline" size="sm" className="gap-2">
            <FlaskConical className="h-3.5 w-3.5" />
            Start a Learning Path
          </Button>
        )}
      </div>
    </div>
  );
}
