'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { SandboxResult, SandboxTestResult } from '@/lib/sandboxes/types';

// ============================================================
// Types
// ============================================================

type ResultsPanelProps = {
  result: SandboxResult | null;
  isSubmitting: boolean;
  error: string | null;
  className?: string;
};

// ============================================================
// Component
// ============================================================

export function ResultsPanel({ result, isSubmitting, error, className }: ResultsPanelProps) {
  if (isSubmitting) {
    return (
      <div className={cn('border-t p-4', className)}>
        <div className="text-muted-foreground flex items-center gap-3">
          <div className="border-muted-foreground/30 border-t-muted-foreground h-4 w-4 animate-spin rounded-full border-2" />
          <span className="text-sm">Running tests...</span>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className={cn('border-t border-red-900/50 bg-red-950/20 p-4', className)}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Execution Error</span>
        </div>
        <p className="mt-2 font-mono text-sm text-red-300/80">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  const isError = result.status === 'error';
  const allPassed = !isError && result.tests_failed === 0 && result.tests_total > 0;

  return (
    <div className={cn('border-t', className)}>
      {/* Summary banner */}
      <ResultsBanner result={result} allPassed={allPassed} isError={isError} />

      {/* Error message for execution errors */}
      {isError && result.error_message && (
        <div className="border-b border-red-900/30 bg-red-950/20 px-4 py-3">
          <p className="font-mono text-sm whitespace-pre-wrap text-red-300/80">
            {asString(result.error_message)}
          </p>
        </div>
      )}

      {/* Per-test results */}
      {result.results.length > 0 && (
        <div className="divide-border/50 max-h-[300px] divide-y overflow-y-auto">
          {result.results.map((test, index) => (
            <TestResultRow key={index} test={test} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function ResultsBanner({
  result,
  allPassed,
  isError,
}: {
  result: SandboxResult;
  allPassed: boolean;
  isError: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3',
        allPassed ? 'bg-emerald-950/30' : isError ? 'bg-red-950/20' : 'bg-muted/30'
      )}
    >
      <div className="flex items-center gap-2">
        {allPassed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : isError ? (
          <AlertTriangle className="h-5 w-5 text-red-400" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400" />
        )}
        <span
          className={cn(
            'text-sm font-medium',
            allPassed ? 'text-emerald-300' : isError ? 'text-red-300' : 'text-foreground'
          )}
        >
          {allPassed
            ? 'All tests passed!'
            : isError
              ? 'Execution error'
              : `${result.tests_passed}/${result.tests_total} tests passed`}
        </span>
      </div>

      <div className="text-muted-foreground flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        <span className="text-xs">{result.execution_time_ms}ms</span>
      </div>
    </div>
  );
}

/** Safely convert a value to a renderable string. */
function asString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return JSON.stringify(value, null, 2);
}

function TestResultRow({ test }: { test: SandboxTestResult }) {
  const [expanded, setExpanded] = useState<boolean>(!test.passed);
  const hasDetails = !test.passed && (test.error || test.expected || test.actual);

  return (
    <div>
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-2.5 transition-colors',
          hasDetails ? 'hover:bg-muted/30 cursor-pointer' : 'cursor-default'
        )}
      >
        <div className="flex items-center gap-2">
          {test.passed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-foreground font-mono text-sm">{test.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs">{test.time_ms}ms</span>
          {hasDetails && (
            <ChevronDown
              className={cn(
                'text-muted-foreground h-4 w-4 transition-transform',
                expanded && 'rotate-180'
              )}
            />
          )}
        </div>
      </button>

      {expanded && hasDetails && (
        <div className="space-y-2 px-4 pb-3">
          {test.expected && (
            <div className="flex gap-2 font-mono text-xs">
              <span className="text-muted-foreground shrink-0">Expected:</span>
              <span className="text-emerald-400/80">{asString(test.expected)}</span>
            </div>
          )}
          {test.actual && (
            <div className="flex gap-2 font-mono text-xs">
              <span className="text-muted-foreground shrink-0">Received:</span>
              <span className="text-red-400/80">{asString(test.actual)}</span>
            </div>
          )}
          {test.error && (
            <pre className="mt-1 rounded bg-red-950/10 p-2 font-mono text-xs whitespace-pre-wrap text-red-300/70">
              {asString(test.error)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
