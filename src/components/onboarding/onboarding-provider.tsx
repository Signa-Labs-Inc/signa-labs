'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TOUR_STEPS } from './tour-steps';

type OnboardingState = {
  tourCompleted: boolean;
  tourStep: number;
  dismissedHints: string[];
  loaded: boolean;
};

type OnboardingContextValue = {
  tourCompleted: boolean;
  tourStep: number;
  totalTourSteps: number;
  advanceTour: () => void;
  skipTour: () => void;
  shouldShowHint: (hintId: string) => boolean;
  dismissHint: (hintId: string) => void;
  loaded: boolean;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

function persistPreferences(prefs: Record<string, unknown>) {
  fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences: prefs }),
  }).catch(() => {
    // Fire-and-forget — non-critical
  });
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<OnboardingState>({
    tourCompleted: true, // Default to true until we load preferences
    tourStep: 0,
    dismissedHints: [],
    loaded: false,
  });

  // Fetch onboarding state from user profile on mount
  useEffect(() => {
    let cancelled = false;
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.profile) return;
        const prefs = data.profile.preferences ?? {};
        setState({
          tourCompleted: prefs.onboarding_tour_completed ?? false,
          tourStep: 0,
          dismissedHints: prefs.onboarding_dismissed_hints ?? [],
          loaded: true,
        });
      })
      .catch(() => {
        // If fetch fails, keep defaults (tour completed = true = don't show)
        if (!cancelled) setState((s) => ({ ...s, loaded: true }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Redirect new users from /dashboard to /discover
  useEffect(() => {
    if (state.loaded && !state.tourCompleted && pathname === '/dashboard') {
      router.replace('/discover');
    }
  }, [state.loaded, state.tourCompleted, pathname, router]);

  const advanceTour = useCallback(() => {
    setState((prev) => {
      const nextStep = prev.tourStep + 1;
      if (nextStep >= TOUR_STEPS.length) {
        persistPreferences({ onboarding_tour_completed: true });
        return { ...prev, tourCompleted: true, tourStep: 0 };
      }
      return { ...prev, tourStep: nextStep };
    });
  }, []);

  const skipTour = useCallback(() => {
    setState((prev) => ({ ...prev, tourCompleted: true, tourStep: 0 }));
    persistPreferences({ onboarding_tour_completed: true });
  }, []);

  const shouldShowHint = useCallback(
    (hintId: string) => {
      return state.loaded && state.tourCompleted && !state.dismissedHints.includes(hintId);
    },
    [state.loaded, state.tourCompleted, state.dismissedHints]
  );

  const dismissHint = useCallback((hintId: string) => {
    setState((prev) => {
      const updated = [...prev.dismissedHints, hintId];
      persistPreferences({ onboarding_dismissed_hints: updated });
      return { ...prev, dismissedHints: updated };
    });
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      tourCompleted: state.tourCompleted,
      tourStep: state.tourStep,
      totalTourSteps: TOUR_STEPS.length,
      advanceTour,
      skipTour,
      shouldShowHint,
      dismissHint,
      loaded: state.loaded,
    }),
    [state.tourCompleted, state.tourStep, state.loaded, advanceTour, skipTour, shouldShowHint, dismissHint]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
