'use client';

import { Lightbulb, BookOpen, AlertCircle, Bug, Puzzle, GitBranch } from 'lucide-react';
import type { FailureExplanation } from '@/lib/services/teaching/teaching.types';

// ============================================================
// Types
// ============================================================

type ExplanationPanelProps = {
  explanation: FailureExplanation | null;
  isLoading?: boolean;
  onViewLesson?: () => void;
};

// ============================================================
// Severity config
// ============================================================

const SEVERITY_CONFIG: Record<string, { icon: typeof Bug; label: string; color: string }> = {
  syntax: {
    icon: AlertCircle,
    label: 'Syntax Issue',
    color: 'text-red-400',
  },
  logic: {
    icon: Bug,
    label: 'Logic Issue',
    color: 'text-amber-400',
  },
  conceptual: {
    icon: Puzzle,
    label: 'Conceptual Gap',
    color: 'text-blue-400',
  },
  edge_case: {
    icon: GitBranch,
    label: 'Edge Case',
    color: 'text-purple-400',
  },
};

// ============================================================
// Component
// ============================================================

export function ExplanationPanel({ explanation, isLoading, onViewLesson }: ExplanationPanelProps) {
  if (isLoading) {
    return (
      <div className="border-border bg-muted/30 border-t px-4 py-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4 animate-pulse" />
          Analyzing your code...
        </div>
      </div>
    );
  }

  if (!explanation) return null;

  const severity = SEVERITY_CONFIG[explanation.severity] ?? SEVERITY_CONFIG.logic;
  const SeverityIcon = severity.icon;

  return (
    <div className="border-border bg-muted/20 space-y-3 border-t px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold">What went wrong</span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${severity.color}`}>
          <SeverityIcon className="h-3 w-3" />
          {severity.label}
        </div>
      </div>

      {/* What went wrong */}
      <p className="text-foreground text-sm">{explanation.whatWentWrong}</p>

      {/* Why it failed */}
      {explanation.whyItFailed && (
        <p className="text-muted-foreground text-sm">{explanation.whyItFailed}</p>
      )}

      {/* Nudge */}
      {explanation.nudge && (
        <div className="bg-primary/5 border-primary/10 rounded-md border px-3 py-2">
          <p className="text-foreground text-sm">
            <span className="font-medium">💡 </span>
            {explanation.nudge}
          </p>
        </div>
      )}

      {/* Link back to lesson */}
      {explanation.relatedLessonSection && onViewLesson && (
        <button
          onClick={onViewLesson}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          Review: {explanation.relatedLessonSection}
        </button>
      )}
    </div>
  );
}
