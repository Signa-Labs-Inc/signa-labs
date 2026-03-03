// src/components/workspace/hint-panel.tsx
'use client';

import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HintPanelProps = {
  exerciseId: string;
  hintCount: number;
};

export function HintPanel({ exerciseId, hintCount }: HintPanelProps) {
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const hasMoreHints = revealedHints.length < hintCount;

  async function revealNextHint() {
    if (!hasMoreHints || isLoading) return;
    setIsLoading(true);
    try {
      const nextIndex = revealedHints.length;
      const res = await fetch(`/api/exercises/${exerciseId}/hint?index=${nextIndex}`);
      if (!res.ok) throw new Error('Failed to fetch hint');
      const data = await res.json();
      setRevealedHints((prev) => [...prev, data.text]);
    } catch (error) {
      console.error('Failed to reveal hint:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (hintCount === 0) return null;

  return (
    <div className="border-t">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between px-5 py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          <span>
            Hints ({revealedHints.length}/{hintCount})
          </span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="px-5 pb-4">
          {revealedHints.length > 0 && (
            <div className="mb-3 space-y-2">
              {revealedHints.map((hint, i) => (
                <div key={i} className="bg-muted/50 rounded-md px-3 py-2 text-sm">
                  <span className="text-muted-foreground font-medium">{i + 1}. </span>
                  {hint}
                </div>
              ))}
            </div>
          )}

          {hasMoreHints && (
            <Button variant="outline" size="sm" onClick={revealNextHint} disabled={isLoading}>
              {isLoading
                ? 'Loading...'
                : revealedHints.length === 0
                  ? 'Show first hint'
                  : 'Show next hint'}
            </Button>
          )}

          {!hasMoreHints && revealedHints.length > 0 && (
            <p className="text-muted-foreground text-xs">All hints revealed.</p>
          )}
        </div>
      )}
    </div>
  );
}
