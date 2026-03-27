import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Learning Paths' };

import { FlaskConical, Target, Brain, Route } from 'lucide-react';
import { getCurrentUser } from '@/lib/services/auth/auth.service';
import { PathService } from '@/lib/services/paths/paths.service';
import { getFeaturedPaths } from '@/lib/services/paths/paths.reader';
import { Button } from '@/components/ui/button';
import { PathCard } from '@/components/paths/path-card';
import { FeaturedPathsGrid } from '@/components/paths/featured-paths-grid';
import { PageHint } from '@/components/onboarding/page-hint';

// ============================================================
// Feature highlights for empty state
// ============================================================

const FEATURES = [
  {
    icon: Target,
    title: 'Adaptive Difficulty',
    description: 'Exercises adjust to your skill level in real-time based on your performance',
  },
  {
    icon: Route,
    title: 'Milestone Roadmap',
    description: 'Structured milestones break your goal into achievable steps with clear progress',
  },
  {
    icon: Brain,
    title: 'Skill Assessment',
    description: 'AI evaluates your code to identify strengths and target areas for growth',
  },
];

// ============================================================
// Component
// ============================================================

export default async function PathsPage() {
  const user = await getCurrentUser();

  // Anonymous users see the empty-state/marketing UI
  const isAnonymous = !user;

  let paths: Awaited<ReturnType<PathService['getUserPaths']>> = [];
  let pathsError = false;

  const [userPaths, featuredPaths] = await Promise.all([
    user
      ? new PathService().getUserPaths(user.id).catch(() => {
          pathsError = true;
          return [] as Awaited<ReturnType<PathService['getUserPaths']>>;
        })
      : ([] as Awaited<ReturnType<PathService['getUserPaths']>>),
    getFeaturedPaths().catch(() => [] as Awaited<ReturnType<typeof getFeaturedPaths>>),
  ]);
  paths = userPaths;

  if (pathsError) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Learning Paths</h1>
        <p className="text-destructive mt-4">
          Something went wrong loading your paths. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const activePaths = paths.filter((p) => p.status === 'active');
  const otherPaths = paths.filter((p) => p.status !== 'active');
  const showEmptyState = isAnonymous || paths.length === 0;

  // For anonymous users, the "Create New Path" button links to sign-in
  const createPathHref = isAnonymous ? '/sign-in?redirect_url=/paths/new' : '/paths/new';

  return (
    <div className="animate-fade-in">
      {/* ── Hero Banner ── */}
      <div className="border-border from-primary/10 via-background relative overflow-hidden border-b bg-linear-to-br to-violet-500/5">
        <div className="from-primary/5 absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 py-12 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="text-primary mb-3 flex items-center gap-2 text-sm font-medium">
                <Route className="h-4 w-4" />
                Learning Paths
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Your personalized
                <span className="from-primary bg-linear-to-r to-violet-400 bg-clip-text text-transparent">
                  {' '}
                  coding journey
                </span>
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                AI-generated curricula that adapt to your skill level, track your progress through
                milestones, and help you master any topic.
              </p>
            </div>
            <Link href={createPathHref} className="shrink-0" data-onboarding="paths-create">
              <Button size="lg" className="gap-2 text-base">
                <FlaskConical className="h-5 w-5" />
                Create New Path
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {!isAnonymous && <PageHint hintId="paths-create" />}

      <div className="mx-auto max-w-5xl px-6 py-10">
        {showEmptyState ? (
          /* ── Empty State ── */
          <div className="space-y-12">
            {/* Feature pitch */}
            <div>
              <h2 className="mb-6 text-center text-lg font-semibold">
                What makes Learning Paths powerful
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-card rounded-xl border p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured paths */}
            {featuredPaths.length > 0 && (
              <div>
                <h2 className="mb-2 text-center text-lg font-semibold">Get started in seconds</h2>
                <p className="text-muted-foreground mb-6 text-center text-sm">
                  Pick a featured path or create your own from scratch
                </p>
                <FeaturedPathsGrid
                  paths={featuredPaths.map((fp) => ({
                    ...fp,
                    plan: fp.plan as { overview?: string },
                  }))}
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {/* ── Active Path Spotlight ── */}
            {activePaths.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-semibold tracking-wider text-emerald-500 uppercase">
                    Continue Learning
                  </h2>
                </div>
                <div className="grid gap-4">
                  {activePaths.map((path) => (
                    <PathCard key={path.id} path={path} spotlight />
                  ))}
                </div>
              </div>
            )}

            {/* ── Other Paths ── */}
            {otherPaths.length > 0 && (
              <div>
                <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                  {activePaths.length > 0 ? 'Past Paths' : 'Your Paths'}
                </h2>
                <div className="grid gap-4">
                  {otherPaths.map((path) => (
                    <PathCard key={path.id} path={path} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Featured Path Suggestions ── */}
            {featuredPaths.length > 0 && (
              <div className="border-border border-t pt-10">
                <h2 className="mb-2 text-lg font-semibold">Start something new</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  Pick a featured path or{' '}
                  <Link href="/paths/new" className="text-primary hover:underline">
                    create your own
                  </Link>
                </p>
                <FeaturedPathsGrid
                  paths={featuredPaths.map((fp) => ({
                    ...fp,
                    plan: fp.plan as { overview?: string },
                  }))}
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
