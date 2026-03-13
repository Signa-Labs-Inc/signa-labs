'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Eye, RotateCcw, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageIcon } from '@/components/ui/language-icon';
import { InstructionsPanel } from './instructions-panel';
import { CodeEditor } from './code-editor';
import { HintPanel } from './hint-panel';
import { ResultsPanel } from './results-panel';
import { LivePreview } from './live-preview';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useTimeTracking } from '@/hooks/use-time-tracking';
import type { ExerciseDetail } from '@/lib/services/exercises/exercises.types';
import type { SandboxResult } from '@/lib/sandboxes/types';
import { LessonPanel } from './lesson-panel';
import { ExplanationPanel } from './explanation-panel';
import { SynthesisPanel } from './synthesis-panel';
import { AnonymousSignupCTA } from './anonymous-signup-cta';
import type { FailureExplanation } from '@/lib/services/teaching/teaching.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fireConfetti, fireBurst } from '@/lib/utils/confetti';
import { ShareButton } from './share-button';
import {
  saveAnonymousExerciseDraft,
  loadAnonymousExerciseDraft,
  clearAnonymousExerciseDraft,
} from '@/lib/utils/anonymous-state';

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


// ============================================================
// Types
// ============================================================

type ExerciseWorkspaceProps = {
  exercise: ExerciseDetail;
  attemptId: string | null;
  draftCode?: Record<string, string> | null;
  pathId?: string | null;
  pathExerciseId?: string | null;
  previouslyCompleted?: boolean;
  isAnonymous?: boolean;
  isCreator?: boolean;
};

type SubmitResponse = {
  submissionId?: string;
  isPassing: boolean;
  testsPassed: number;
  testsFailed: number;
  testsTotal: number;
  testOutput?: string | null;
  executionTimeMs: number;
  results: SandboxResult['results'];
  error: string | null;
};

type PathCompletionResult = {
  milestoneAdvanced: boolean;
  pathCompleted: boolean;
  nextAction: 'continue' | 'milestone_complete' | 'path_complete';
  message: string;
};

// ============================================================
// Component
// ============================================================

export function ExerciseWorkspace({
  exercise,
  attemptId,
  draftCode,
  pathId,
  pathExerciseId,
  previouslyCompleted = false,
  isAnonymous = false,
  isCreator = false,
}: ExerciseWorkspaceProps) {
  const router = useRouter();
  const allFiles = [...exercise.starterFiles, ...exercise.supportFiles];
  const isPathExercise = Boolean(pathId && pathExerciseId);

  const [activeFileId, setActiveFileId] = useState<string>(allFiles[0]?.id ?? '');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const [explanation, setExplanation] = useState<FailureExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const [showSynthesis, setShowSynthesis] = useState(false);
  const [showCompletionBanner, setShowCompletionBanner] = useState(previouslyCompleted);

  // Anonymous CTA state
  const [showAnonymousCTA, setShowAnonymousCTA] = useState<'pass' | 'fail' | null>(null);

  // Track user's code edits per file (keyed by file ID)
  // Initialised from server draft or starter code.
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

  // Restore draft from localStorage on mount.
  // Two scenarios:
  //   1. Anonymous user refreshes the page — restore their edits, keep localStorage.
  //   2. User just signed up after anonymous session — restore their edits, clear localStorage.
  // Skipped when a server-side draft exists (it takes priority).
  const [anonDraftRestored, setAnonDraftRestored] = useState(false);
  useEffect(() => {
    if (draftCode || anonDraftRestored) return;

    const anonDraft = loadAnonymousExerciseDraft(exercise.id);
    if (anonDraft) {
      setFileContents((prev) => {
        const next = { ...prev };
        for (const file of allFiles) {
          if (file.filePath in anonDraft) {
            next[file.id] = anonDraft[file.filePath];
          }
        }
        return next;
      });
    }
    // For authenticated users, clear so it doesn't resurface on future visits.
    // For anonymous users, keep it — the save effect will overwrite it anyway.
    if (!isAnonymous) {
      clearAnonymousExerciseDraft();
    }
    setAnonDraftRestored(true);
  }, [isAnonymous, draftCode, anonDraftRestored, exercise.id, allFiles]);

  // For anonymous users, persist code to localStorage on every change
  // so it survives the sign-up redirect.
  useEffect(() => {
    if (!isAnonymous) return;

    const editableSnapshot: Record<string, string> = {};
    let hasEdits = false;
    for (const file of allFiles) {
      if (file.isEditable) {
        const current = fileContents[file.id] ?? file.content;
        editableSnapshot[file.filePath] = current;
        if (current !== file.content) {
          hasEdits = true;
        }
      }
    }
    if (hasEdits) {
      saveAnonymousExerciseDraft(exercise.id, editableSnapshot);
    }
  }, [isAnonymous, fileContents, allFiles, exercise.id]);

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
    attemptId: attemptId ?? '',
    fileContents: draftFiles,
    enabled: !isAnonymous && !!attemptId,
  });

  useTimeTracking({
    exerciseId: exercise.id,
    attemptId: attemptId ?? '',
    enabled: !isAnonymous && !!attemptId,
  });

  const [synthesisContent, setSynthesisContent] = useState(exercise.synthesisContent);

  type LeftTab = 'lesson' | 'instructions' | 'hints';
  const lessonContent = exercise.lessonContent;
  const hasLesson = Boolean(lessonContent && lessonContent.title && lessonContent.body);
  const [leftTab, setLeftTab] = useState<LeftTab>(hasLesson ? 'lesson' : 'instructions');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Path completion state
  const [pathResult, setPathResult] = useState<PathCompletionResult | null>(null);

  const activeFile = allFiles.find((f) => f.id === activeFileId) ?? allFiles[0];

  function handleCodeChange(value: string): void {
    if (!activeFile?.isEditable) return;
    setFileContents((prev) => ({ ...prev, [activeFile.id]: value }));
  }

  const handleReset = useCallback(async () => {
    cancelPendingSaves();

    const initial: Record<string, string> = {};
    for (const file of allFiles) {
      initial[file.id] = file.content;
    }
    setFileContents(initial);

    if (isAnonymous) {
      // Clear localStorage so the old draft doesn't restore on refresh.
      clearAnonymousExerciseDraft();
    } else if (attemptId) {
      try {
        await fetch(`/api/exercises/${exercise.id}/draft`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId, files: {} }),
        });
      } catch {
        // Best effort
      }
    }
  }, [allFiles, exercise.id, attemptId, cancelPendingSaves, isAnonymous]);

  /**
   * Record path exercise completion after all tests pass.
   */
  const recordPathCompletion = useCallback(
    async (data: SubmitResponse): Promise<PathCompletionResult | null> => {
      if (!pathId || !pathExerciseId) return null;
      if (!data.isPassing) return null;

      try {
        // Collect the user's solution code for skill assessment
        const solutionCode = allFiles
          .filter((f) => f.isEditable)
          .map((f) => `// ${f.filePath}\n${fileContents[f.id] ?? f.content}`)
          .join('\n\n');

        const response = await fetch(`/api/paths/${pathId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pathExerciseId,
            exerciseId: exercise.id,
            attemptId,
            testsPassed: data.testsPassed,
            testsTotal: data.testsTotal,
            timeSpentSeconds: 0, // Time tracking handles this separately
            hintsUsed: 0, // Could be enhanced to track this
            userSolutionCode: solutionCode,
          }),
        });

        if (response.ok) {
          const result = (await response.json()) as PathCompletionResult;
          setPathResult(result);

          // Update synthesis with path-aware nextPreview so the panel
          // reflects what comes next without waiting for a page refresh.
          setSynthesisContent((prev) => (prev ? { ...prev, nextPreview: result.message } : prev));
          return result;
        }
      } catch {
        // Non-blocking — the exercise submission already succeeded
      }
      return null;
    },
    [pathId, pathExerciseId, exercise.id, attemptId, allFiles, fileContents]
  );

  const fetchExplanation = useCallback(
    async (submissionData: SubmitResponse) => {
      if (submissionData.isPassing) return;

      // Anonymous users don't get AI explanations
      if (isAnonymous) return;

      setIsExplaining(true);
      setExplanation(null);

      try {
        const solutionCode = allFiles
          .filter((f) => f.isEditable)
          .map((f) => `// ${f.filePath}\n${fileContents[f.id] ?? f.content}`)
          .join('\n\n');

        const response = await fetch(`/api/exercises/${exercise.id}/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: submissionData.submissionId,
            exerciseTitle: exercise.title,
            exerciseDescription: exercise.description,
            exerciseDifficulty: exercise.difficulty,
            userCode: solutionCode,
            testsPassed: submissionData.testsPassed,
            testsTotal: submissionData.testsTotal,
            testResults: submissionData.results.map((r) => ({
              name: r.name,
              passed: r.passed,
              error: r.error,
            })),
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { explanation: FailureExplanation };
          setExplanation(data.explanation);
        }
      } catch {
        // Non-blocking — test results are still visible
      } finally {
        setIsExplaining(false);
      }
    },
    [allFiles, fileContents, exercise, isAnonymous]
  );

  const handleSubmit = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    setResult(null);
    setSubmitError(null);
    setPathResult(null);
    setExplanation(null);
    setIsExplaining(false);
    setShowSynthesis(false);
    setShowAnonymousCTA(null);

    try {
      const editableFiles = allFiles
        .filter((f) => f.isEditable)
        .map((f) => ({
          filePath: f.filePath,
          content: fileContents[f.id] ?? f.content,
        }));

      // Anonymous users use the /try endpoint (no DB writes)
      const url = isAnonymous
        ? `/api/exercises/${exercise.id}/try`
        : `/api/exercises/${exercise.id}/submit`;

      const payload = isAnonymous
        ? { files: editableFiles }
        : { attemptId, files: editableFiles };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const errMsg = errorBody?.error;
        setSubmitError(
          typeof errMsg === 'string' ? errMsg : `Submission failed (${response.status})`
        );
        return;
      }

      const data = (await response.json()) as SubmitResponse;
      const errorMessage =
        typeof data.error === 'string'
          ? data.error
          : data.error
            ? JSON.stringify(data.error)
            : undefined;

      const sandboxResult: SandboxResult = {
        status: data.error ? 'error' : 'completed',
        error_message: errorMessage,
        tests_passed: data.testsPassed,
        tests_failed: data.testsFailed,
        tests_total: data.testsTotal,
        execution_time_ms: data.executionTimeMs,
        results: data.results,
      };

      setResult(sandboxResult);
      if (data.isPassing && synthesisContent) {
        setShowSynthesis(true);
      }
      if (!data.isPassing) {
        fetchExplanation(data);
        toast.error(`${data.testsFailed} of ${data.testsTotal} tests failed`, {
          description: 'Check the results panel for details.',
        });
        if (isAnonymous) {
          setShowAnonymousCTA('fail');
        }
      } else {
        setExplanation(null);
        toast.success('All tests passed!', {
          description: `${data.testsPassed} of ${data.testsTotal} tests passed in ${data.executionTimeMs}ms`,
        });
        fireConfetti();
        if (isAnonymous) {
          setShowAnonymousCTA('pass');
        }
      }

      // If this is a path exercise and all tests passed, record completion
      if (!isAnonymous && isPathExercise && data.isPassing) {
        const pathRes = await recordPathCompletion(data);
        if (pathRes?.pathCompleted) {
          fireBurst();
          toast.success('Path completed!', {
            description: pathRes.message,
          });
        } else if (pathRes?.milestoneAdvanced) {
          fireBurst();
          toast.success('Milestone complete!', {
            description: pathRes.message,
          });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setSubmitError(msg);
      toast.error('Submission failed', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    allFiles,
    fileContents,
    exercise.id,
    attemptId,
    isPathExercise,
    isAnonymous,
    recordPathCompletion,
    fetchExplanation,
    synthesisContent,
  ]);

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b bg-card px-4 py-2">
          <div className="flex items-center gap-3">
            <Link href={isPathExercise ? `/paths/${pathId}` : '/exercises'}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">{exercise.title}</h1>
            <Badge variant="outline" className={DIFFICULTY_COLORS[exercise.difficulty] ?? ''}>
              {exercise.difficulty}
            </Badge>
            <LanguageIcon language={exercise.language} showLabel className="h-4 w-4" />
          </div>

          <div className="flex items-center gap-3">
            {/* Share button (only for exercise creator) */}
            {isCreator && (
              <ShareButton
                exerciseId={exercise.id}
                initialIsPublic={exercise.isPublic}
                initialSlug={exercise.slug}
              />
            )}

            {/* Save status indicator (hidden for anonymous) */}
            {!isAnonymous && (
              <>
                {saveStatus === 'saving' && (
                  <span className="text-muted-foreground animate-pulse text-xs">Saving...</span>
                )}
                {saveStatus === 'saved' && <span className="text-muted-foreground text-xs">Saved</span>}
                {saveStatus === 'error' && <span className="text-xs text-red-500">Save failed</span>}
              </>
            )}

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

        {/* Path milestone/completion banner */}
        {pathResult && (
          <div
            className={`px-4 py-3 text-center text-sm font-medium ${
              pathResult.pathCompleted
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                : pathResult.milestoneAdvanced
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {pathResult.message}
            {pathResult.nextAction !== 'continue' && pathId && (
              <Link href={`/paths/${pathId}`} className="ml-2 underline hover:no-underline">
                {pathResult.pathCompleted
                  ? 'View completed path →'
                  : 'Continue to next milestone →'}
              </Link>
            )}
          </div>
        )}

        {/* Previously completed banner */}
        {showCompletionBanner && (
          <div className="flex items-center justify-between bg-sky-50 px-4 py-2.5 text-sm text-sky-800 dark:bg-sky-950 dark:text-sky-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>
                You&apos;ve already completed this exercise. This is a fresh attempt &mdash; your
                previous solution won&apos;t be loaded.
              </span>
            </div>
            <button
              onClick={() => setShowCompletionBanner(false)}
              className="ml-4 flex-shrink-0 rounded p-0.5 hover:bg-sky-100 dark:hover:bg-sky-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main workspace area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: Instructions + Hints */}
          <div className="flex w-[400px] flex-shrink-0 flex-col border-r bg-card">
            {/* Left panel tabs */}
            <div className="bg-muted/30 flex items-center border-b px-2">
              {hasLesson && (
                <button
                  onClick={() => setLeftTab('lesson')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    leftTab === 'lesson'
                      ? 'border-foreground text-foreground border-b-2 font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Lesson
                </button>
              )}
              <button
                onClick={() => setLeftTab('instructions')}
                className={`px-3 py-2 text-sm transition-colors ${
                  leftTab === 'instructions'
                    ? 'border-foreground text-foreground border-b-2 font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Instructions
              </button>
              <button
                onClick={() => setLeftTab('hints')}
                className={`px-3 py-2 text-sm transition-colors ${
                  leftTab === 'hints'
                    ? 'border-foreground text-foreground border-b-2 font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Hints
              </button>
            </div>

            {/* Left panel content */}
            {leftTab === 'lesson' && lessonContent && (
              <LessonPanel
                lesson={lessonContent}
                language={exercise.language}
                onStartExercise={() => setLeftTab('instructions')}
              />
            )}
            {leftTab === 'instructions' && (
              <InstructionsPanel description={exercise.description} tags={exercise.tags} />
            )}
            {leftTab === 'hints' && (
              <HintPanel
                exerciseId={exercise.id}
                hintCount={exercise.hintCount}
                isAnonymous={isAnonymous}
              />
            )}
          </div>

          {/* Right panel: File tabs + Editor/Preview + Results */}
          <div className="flex flex-1 flex-col overflow-hidden bg-card">
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

            {/* Results + Explanation + Synthesis + Anonymous CTA */}
            <div>
              <ResultsPanel result={result} isSubmitting={isSubmitting} error={submitError} />
              {isAnonymous && showAnonymousCTA && (
                <AnonymousSignupCTA variant={showAnonymousCTA} />
              )}
              {!isAnonymous && (explanation || isExplaining) && !showSynthesis && (
                <ExplanationPanel
                  explanation={explanation}
                  isLoading={isExplaining}
                  onViewLesson={lessonContent ? () => setLeftTab('lesson') : undefined}
                />
              )}
              {!isAnonymous && showSynthesis && synthesisContent && (
                <SynthesisPanel
                  synthesis={synthesisContent}
                  pathId={pathId}
                  onNextExercise={
                    pathId && pathResult?.nextAction === 'continue'
                      ? () => router.push(`/paths/${pathId}`)
                      : undefined
                  }
                  onViewPaths={!pathId ? () => router.push('/paths/new') : undefined}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
