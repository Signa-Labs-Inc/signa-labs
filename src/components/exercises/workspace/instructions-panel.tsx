'use client';

import type { ComponentPropsWithoutRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Badge } from '@/components/ui/badge';

type InstructionsPanelProps = {
  description: string;
  tags: string[];
};

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

export function InstructionsPanel({ description, tags }: InstructionsPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
        Instructions
      </h2>

      <div className="prose prose-sm dark:prose-invert max-w-none font-sans">
        <Markdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
          {description}
        </Markdown>
      </div>

      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
