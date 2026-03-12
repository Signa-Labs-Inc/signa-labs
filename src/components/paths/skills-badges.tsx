'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const SKILLS_VISIBLE_DEFAULT = 6;

type SkillsBadgesProps = {
  skills: { skill: string; confidence: number }[];
};

export function SkillsBadges({ skills }: SkillsBadgesProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = skills.length > SKILLS_VISIBLE_DEFAULT;
  const visible = expanded ? skills : skills.slice(0, SKILLS_VISIBLE_DEFAULT);
  const hiddenCount = skills.length - SKILLS_VISIBLE_DEFAULT;

  return (
    <div className="mt-6">
      <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
        Skills Acquired
      </p>
      <div className="flex flex-wrap gap-2">
        {visible.map(({ skill, confidence }) => (
          <div
            key={skill}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm backdrop-blur-sm ${
              confidence >= 0.7
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : confidence >= 0.4
                  ? 'border-amber-500/30 bg-amber-500/10'
                  : 'border-border bg-card/60'
            }`}
          >
            <CheckCircle2
              className={`h-3.5 w-3.5 ${
                confidence >= 0.7
                  ? 'text-emerald-500'
                  : confidence >= 0.4
                    ? 'text-amber-500'
                    : 'text-muted-foreground'
              }`}
            />
            <span className="capitalize">{skill.replace(/_/g, ' ')}</span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        ))}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                {hiddenCount} more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
