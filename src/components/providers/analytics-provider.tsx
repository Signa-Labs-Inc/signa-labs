'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';

export function AnalyticsProvider({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const prevUserIdRef = useRef<string | null>(null);

  // Identify user in PostHog + Sentry when auth state changes
  useEffect(() => {
    if (!isLoaded) return;

    const userId = user?.id ?? null;

    // Skip if user hasn't changed
    if (userId === prevUserIdRef.current) return;
    prevUserIdRef.current = userId;

    if (user) {
      const email = user.primaryEmailAddress?.emailAddress;
      const name = user.fullName ?? user.firstName ?? undefined;

      posthog.identify(user.id, {
        email,
        name,
      });

      Sentry.setUser({
        id: user.id,
        email: email ?? undefined,
        username: name,
      });
    } else {
      posthog.reset();
      Sentry.setUser(null);
    }
  }, [user, isLoaded]);

  // Track page views on route change
  useEffect(() => {
    posthog.capture('$pageview', { $current_url: window.location.href });
  }, [pathname]);

  return children ? <>{children}</> : null;
}
