'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InstructionsPanel } from './instructions-panel';
import { CodeEditor } from './code-editor';
import { HintPanel } from './hint-panel';
import { ResultsPanel } from './results-panel';
import { LivePreview } from './live-preview';
import { useAutoSave } from '@/hooks/use-auto-save';
import type { ExerciseDetail } from '@/lib/services/exercises/exercises.types';
import type { SandboxResult } from '@/lib/sandboxes/types';

// ============================================================
// Constants
// ============================================================

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  easy: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
  medium:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  hard: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  expert:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  go: 'Go',
  ruby: 'Ruby',
  sql: 'SQL',
};

// ============================================================
// Types
// ============================================================

type ExerciseWorkspaceProps = {
  exercise: ExerciseDetail;
  attemptId: string;
  draftCode?: Record<string, string> | null;
};

type SubmitResponse = {
  submissionId: string;
  isPassing: boolean;
  testsPassed: number;
  testsFailed: number;
  testsTotal: number;
  testOutput: string | null;
  executionTimeMs: number;
  results: SandboxResult['results'];
  error: string | null;
};

// ============================================================
// Component
// ============================================================

export function ExerciseWorkspace({ exercise, attemptId, draftCode }: ExerciseWorkspaceProps) {
  const allFiles = [...exercise.starterFiles, ...exercise.supportFiles];

  const [activeFileId, setActiveFileId] = useState<string>(allFiles[0]?.id ?? '');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Track user's code edits per file (keyed by file ID)
  // Prefer saved draft code over original starter content
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const file of allFiles) {
      if (draftCode && file.filePath in draftCode) {
        initial[file.id] = draftCode[file.filePath];
      } else {
        initial[file.id] = file.content;
      }
    }
    return initial;
  });

  // Build a filePath -> content map for auto-save (only editable files)
  const draftFiles: Record<string, string> = {};
  for (const file of allFiles) {
    if (file.isEditable) {
      draftFiles[file.filePath] = fileContents[file.id] ?? file.content;
    }
  }

  // Auto-save drafts on debounce + tab blur + page close
  const { saveStatus, cancelPendingSaves } = useAutoSave({
    exerciseId: exercise.id,
    attemptId,
    fileContents: draftFiles,
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeFile = allFiles.find((f) => f.id === activeFileId) ?? allFiles[0];

  function handleCodeChange(value: string): void {
    if (!activeFile?.isEditable) return;
    setFileContents((prev) => ({ ...prev, [activeFile.id]: value }));
  }

  const handleReset = useCallback(async () => {
    // Cancel any pending/in-flight auto-saves so they don't overwrite the reset
    cancelPendingSaves();

    // Reset file contents to original starter code
    const initial: Record<string, string> = {};
    for (const file of allFiles) {
      initial[file.id] = file.content;
    }
    setFileContents(initial);

    // Clear the saved draft on the server
    try {
      await fetch(`/api/exercises/${exercise.id}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, files: {} }),
      });
    } catch {
      // Best effort
    }
  }, [allFiles, exercise.id, attemptId, cancelPendingSaves]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    setResult(null);
    setSubmitError(null);

    try {
      // Collect editable files with their current content
      const editableFiles = allFiles
        .filter((f) => f.isEditable)
        .map((f) => ({
          filePath: f.filePath,
          content: fileContents[f.id] ?? f.content,
        }));

      const response = await fetch(`/api/exercises/${exercise.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          files: editableFiles,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        setSubmitError(errorBody?.error ?? `Submission failed (${response.status})`);
        return;
      }

      const data = (await response.json()) as SubmitResponse;

      const sandboxResult: SandboxResult = {
        status: data.error ? 'error' : 'completed',
        error_message: data.error ?? undefined,
        tests_passed: data.testsPassed,
        tests_failed: data.testsFailed,
        tests_total: data.testsTotal,
        execution_time_ms: data.executionTimeMs,
        results: data.results,
      };

      setResult(sandboxResult);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  }, [allFiles, fileContents, exercise.id, attemptId]);

  return (
    <>
      <div className="flex h-[calc(100vh-64px)] flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-3">
            <Link href="/exercises">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">{exercise.title}</h1>
            <Badge variant="outline" className={DIFFICULTY_COLORS[exercise.difficulty] ?? ''}>
              {exercise.difficulty}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {LANGUAGE_LABELS[exercise.language] ?? exercise.language}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Save status indicator */}
            {saveStatus === 'saving' && (
              <span className="text-muted-foreground animate-pulse text-xs">Saving...</span>
            )}
            {saveStatus === 'saved' && <span className="text-muted-foreground text-xs">Saved</span>}
            {saveStatus === 'error' && <span className="text-xs text-red-500">Save failed</span>}

            {/* Reset button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1.5"
              onClick={() => {
                if (
                  window.confirm(
                    'Reset code? This will replace your code with the original starter code. Your current changes will be lost.'
                  )
                ) {
                  handleReset();
                }
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>

            {/* Submit button */}
            <Button onClick={handleSubmit} disabled={isSubmitting} size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              {isSubmitting ? 'Running...' : 'Run Tests'}
            </Button>
          </div>
        </div>

        {/* Main workspace area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: Instructions + Hints */}
          <div className="flex w-[400px] flex-shrink-0 flex-col border-r">
            <InstructionsPanel description={exercise.description} tags={exercise.tags} />
            <HintPanel exerciseId={exercise.id} hintCount={exercise.hintCount} />
          </div>

          {/* Right panel: File tabs + Editor/Preview + Results */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* File tabs */}
            <div className="bg-muted/30 flex items-center border-b px-2">
              <div className="flex flex-1 items-center gap-0 overflow-x-auto">
                {allFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      setActiveFileId(file.id);
                      setShowPreview(false);
                    }}
                    className={`px-3 py-2 text-sm transition-colors ${
                      file.id === activeFileId && !showPreview
                        ? 'border-foreground text-foreground border-b-2 font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    } ${!file.isEditable ? 'italic opacity-70' : ''}`}
                  >
                    {file.fileName}
                    {!file.isEditable && <span className="ml-1 text-xs">(read-only)</span>}
                  </button>
                ))}

                {/* Preview tab */}
                <button
                  onClick={() => setShowPreview(true)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                    showPreview
                      ? 'border-foreground text-foreground border-b-2 font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
              </div>
            </div>

            {/* Code editor OR Preview */}
            <div className="flex-1 overflow-hidden">
              {showPreview ? (
                <LivePreview
                  files={allFiles.map((f) => ({
                    filePath: f.filePath,
                    content: fileContents[f.id] ?? f.content,
                    isEditable: f.isEditable,
                  }))}
                  language={exercise.language}
                />
              ) : (
                activeFile && (
                  <CodeEditor
                    value={fileContents[activeFile.id] ?? activeFile.content}
                    language={exercise.language}
                    readOnly={!activeFile.isEditable}
                    onChange={handleCodeChange}
                    filePath={activeFile.filePath}
                  />
                )
              )}
            </div>

            {/* Results panel */}
            <ResultsPanel result={result} isSubmitting={isSubmitting} error={submitError} />
          </div>
        </div>
      </div>
    </>
  );
}
