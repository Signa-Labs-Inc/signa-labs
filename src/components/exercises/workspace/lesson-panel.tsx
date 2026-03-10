'use client';

import { useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BookOpen, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LessonContent } from '@/lib/services/teaching/teaching.types';

// ============================================================
// Types
// ============================================================

type LessonPanelProps = {
  lesson: LessonContent;
  language: string;
  onStartExercise?: () => void;
};

// ============================================================
// Markdown code block renderer (shared with InstructionsPanel)
// ============================================================

function CodeBlock({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) {
  const match = /language-(\w+)/.exec(className ?? '');
  const code = String(children).replace(/\n$/, '');

  if (!match) {
    return (
      <code
        className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.85em]"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">
      {code}
    </SyntaxHighlighter>
  );
}

// ============================================================
// Component
// ============================================================

export function LessonPanel({ lesson, language, onStartExercise }: LessonPanelProps) {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const codeExample = lesson.codeExample;
  const annotations = codeExample?.annotations ?? [];
  const hasAnnotations = annotations.length > 0;
  const hasCodeExample = (codeExample?.code?.length ?? 0) > 0;

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <h2 className="text-muted-foreground mb-1 flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase">
        <BookOpen className="h-3.5 w-3.5" />
        Lesson
      </h2>

      {/* Title */}
      <h3 className="mt-3 mb-4 text-lg font-bold tracking-tight">{lesson.title}</h3>

      {/* Body — markdown */}
      <div className="prose prose-sm dark:prose-invert max-w-none font-sans">
        <Markdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
          {lesson.body}
        </Markdown>
      </div>

      {/* Code example */}
      {hasCodeExample && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Example
            </span>
            {hasAnnotations && (
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
              >
                {showAnnotations ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Hide notes
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show notes
                  </>
                )}
              </button>
            )}
          </div>

          <div className="relative overflow-hidden rounded-lg">
            <SyntaxHighlighter
              style={oneDark}
              language={codeExample?.language || language}
              PreTag="div"
              showLineNumbers
              wrapLines
              lineProps={(lineNumber) => {
                const annotation = annotations.find((a) => a.line === lineNumber);
                return {
                  style: {
                    backgroundColor:
                      annotation && showAnnotations ? 'rgba(59, 130, 246, 0.08)' : undefined,
                    display: 'block',
                  },
                };
              }}
            >
              {codeExample!.code}
            </SyntaxHighlighter>

            {/* Annotations overlay */}
            {showAnnotations && hasAnnotations && (
              <div className="border-border bg-muted/50 space-y-2 border-t px-4 py-3">
                {annotations.map((annotation, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="shrink-0 rounded bg-blue-500/20 px-1.5 py-0.5 font-mono text-blue-400">
                      L{annotation.line}
                    </span>
                    <span className="text-muted-foreground">{annotation.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key takeaways */}
      {(lesson.keyTakeaways?.length ?? 0) > 0 && (
        <div className="bg-muted/30 mt-5 rounded-lg border p-4">
          <h4 className="mb-2 text-sm font-semibold">Key Takeaways</h4>
          <ul className="space-y-1.5">
            {lesson.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="text-muted-foreground flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                {takeaway}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Start exercise CTA */}
      {onStartExercise && (
        <div className="mt-6">
          <Button onClick={onStartExercise} className="w-full gap-2" size="sm">
            Ready to Practice
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
