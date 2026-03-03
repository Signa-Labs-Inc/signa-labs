// src/components/workspace/exercise-workspace.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InstructionsPanel } from './instructions-panel';
import { CodeEditor } from './code-editor';
import { HintPanel } from './hint-panel';
import type { ExerciseDetail } from '@/lib/services/exercises/exercises.types';

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

type ExerciseWorkspaceProps = {
  exercise: ExerciseDetail;
};

export function ExerciseWorkspace({ exercise }: ExerciseWorkspaceProps) {
  const allFiles = [...exercise.starterFiles, ...exercise.supportFiles];

  const [activeFileId, setActiveFileId] = useState<string>(allFiles[0]?.id ?? '');

  // Track user's code edits per file (keyed by file ID)
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const file of allFiles) {
      initial[file.id] = file.content;
    }
    return initial;
  });

  const activeFile = allFiles.find((f) => f.id === activeFileId) ?? allFiles[0];

  function handleCodeChange(value: string) {
    if (!activeFile?.isEditable) return;
    setFileContents((prev) => ({ ...prev, [activeFile.id]: value }));
  }

  return (
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
      </div>

      {/* Main workspace area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Instructions + Hints */}
        <div className="flex w-[400px] flex-shrink-0 flex-col border-r">
          <InstructionsPanel description={exercise.description} tags={exercise.tags} />
          <HintPanel exerciseId={exercise.id} hintCount={exercise.hintCount} />
        </div>

        {/* Right panel: File tabs + Editor */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* File tabs */}
          <div className="bg-muted/30 flex items-center gap-0 border-b px-2">
            {allFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`px-3 py-2 text-sm transition-colors ${
                  file.id === activeFileId
                    ? 'border-foreground text-foreground border-b-2 font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                } ${!file.isEditable ? 'italic opacity-70' : ''}`}
              >
                {file.fileName}
                {!file.isEditable && <span className="ml-1 text-xs">(read-only)</span>}
              </button>
            ))}
          </div>

          {/* Code editor */}
          <div className="flex-1 overflow-hidden">
            {activeFile && (
              <CodeEditor
                value={fileContents[activeFile.id] ?? activeFile.content}
                language={exercise.language}
                readOnly={!activeFile.isEditable}
                onChange={handleCodeChange}
                filePath={activeFile.filePath}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
