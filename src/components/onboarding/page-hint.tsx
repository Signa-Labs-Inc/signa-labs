'use client';

import { useOnboarding } from './onboarding-provider';
import { OnboardingPopover } from './onboarding-popover';
import { PAGE_HINTS } from './tour-steps';
import { Button } from '@/components/ui/button';

type PageHintProps = {
  hintId: string;
};

export function PageHint({ hintId }: PageHintProps) {
  const { shouldShowHint, dismissHint } = useOnboarding();

  const hint = PAGE_HINTS[hintId];
  if (!hint || !shouldShowHint(hintId)) return null;

  return (
    <OnboardingPopover
      targetSelector={hint.targetSelector}
      side={hint.side}
      open
      onClose={() => dismissHint(hintId)}
    >
      <div className="pr-5">
        <p className="text-sm font-semibold">{hint.title}</p>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {hint.description}
        </p>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={() => dismissHint(hintId)} className="h-7 px-3 text-xs">
          Got it
        </Button>
      </div>
    </OnboardingPopover>
  );
}
