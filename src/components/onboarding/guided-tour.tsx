'use client';

import { usePathname } from 'next/navigation';
import { useOnboarding } from './onboarding-provider';
import { OnboardingPopover } from './onboarding-popover';
import { TOUR_STEPS } from './tour-steps';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';

export function GuidedTour() {
  const pathname = usePathname();
  const { tourCompleted, tourStep, totalTourSteps, advanceTour, skipTour, loaded } =
    useOnboarding();

  // Only show tour on /discover
  if (!loaded || tourCompleted || pathname !== '/discover') return null;

  const step = TOUR_STEPS[tourStep];
  if (!step) return null;

  const isLastStep = tourStep === totalTourSteps - 1;

  return (
    <OnboardingPopover
      targetSelector={step.targetSelector}
      side={step.side}
      open
      onClose={skipTour}
    >
      <div className="pr-5">
        <p className="text-sm font-semibold">{step.title}</p>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Step dots + actions */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                i === tourStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={skipTour} className="h-7 px-2 text-xs">
            Skip
          </Button>
          <Button size="sm" onClick={advanceTour} className="h-7 px-3 text-xs">
            {isLastStep ? 'Got it' : 'Next'}
          </Button>
        </div>
      </div>
    </OnboardingPopover>
  );
}
