import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2025-11-30',
});

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Adds request headers and IP for users
  sendDefaultPii: true,
  // Capture 100% in dev, 10% in production
  // Adjust based on your traffic volume
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  // Enable logs to be sent to Sentry
  enableLogs: true,
});
// This export will instrument router navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
