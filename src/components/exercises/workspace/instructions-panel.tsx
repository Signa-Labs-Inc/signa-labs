// src/components/workspace/instructions-panel.tsx
'use client';

import { Badge } from '@/components/ui/badge';

type InstructionsPanelProps = {
  description: string;
  tags: string[];
};

export function InstructionsPanel({ description, tags }: InstructionsPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
        Instructions
      </h2>

      {/* Render description as preformatted text with basic formatting */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">{description}</pre>
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
