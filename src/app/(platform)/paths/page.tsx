import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Learning Paths' };

import {
  FlaskConical,
  Target,
  Brain,
  ArrowRight,
  Route,
} from 'lucide-react';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { PathService } from '@/lib/services/paths/paths.service';
import { Button } from '@/components/ui/button';
import { PathCard } from '@/components/paths/path-card';
import { LanguageIcon } from '@/components/ui/language-icon';
import { PageHint } from '@/components/onboarding/page-hint';

// ============================================================
// Quick-start path templates
// ============================================================

const QUICK_STARTS = [
  {
    title: 'Master TypeScript',
    description: 'Generics, utility types, and advanced patterns',
    language: 'typescript',
    level: 'intermediate',
    prompt: 'I want to master TypeScript generics, utility types, and advanced type patterns',
  },
  {
    title: 'Python Fundamentals',
    description: 'From basics to data structures and algorithms',
    language: 'python',
    level: 'beginner',
    prompt: 'Teach me Python from the basics through data structures and algorithms',
  },
  {
    title: 'Go Concurrency',
    description: 'Goroutines, channels, and concurrent patterns',
    language: 'go',
    level: 'some_experience',
    prompt: 'Teach me Go concurrency patterns including goroutines, channels, and sync primitives',
  },
  {
    title: 'SQL Deep Dive',
    description: 'Queries, joins, window functions, and optimization',
    language: 'sql',
    level: 'some_experience',
    prompt: 'I want to learn SQL from basic queries to complex joins, window functions, and query optimization',
  },
];

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
  const user = await requireCurrentUser();

  const pathService = new PathService();

  let paths;
  try {
    paths = await pathService.getUserPaths(user.id);
  } catch {
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

  return (
    <div className="animate-fade-in">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 py-12 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="text-primary mb-3 flex items-center gap-2 text-sm font-medium">
                <Route className="h-4 w-4" />
                Learning Paths
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Your personalized
                <span className="bg-linear-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                  {' '}coding journey
                </span>
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                AI-generated curricula that adapt to your skill level, track your progress through
                milestones, and help you master any topic.
              </p>
            </div>
            <Link href="/paths/new" className="shrink-0" data-onboarding="paths-create">
              <Button size="lg" className="gap-2 text-base">
                <FlaskConical className="h-5 w-5" />
                Create New Path
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <PageHint hintId="paths-create" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        {paths.length === 0 ? (
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

            {/* Quick starts */}
            <div>
              <h2 className="mb-2 text-center text-lg font-semibold">
                Get started in seconds
              </h2>
              <p className="text-muted-foreground mb-6 text-center text-sm">
                Pick a popular path or create your own from scratch
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {QUICK_STARTS.map((qs) => (
                  <Link
                    key={qs.title}
                    href={`/paths/new?prompt=${encodeURIComponent(qs.prompt)}&language=${qs.language}&level=${qs.level}`}
                    className="bg-card group flex items-center gap-4 rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="bg-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                      <LanguageIcon language={qs.language} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{qs.title}</h3>
                      <p className="text-muted-foreground text-sm">{qs.description}</p>
                    </div>
                    <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* ── Active Path Spotlight ── */}
            {activePaths.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-500">
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
                <h2 className="text-muted-foreground mb-4 text-sm font-semibold uppercase tracking-wider">
                  {activePaths.length > 0 ? 'Past Paths' : 'Your Paths'}
                </h2>
                <div className="grid gap-4">
                  {otherPaths.map((path) => (
                    <PathCard key={path.id} path={path} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Quick Start Suggestions ── */}
            <div className="border-t border-border pt-10">
              <h2 className="mb-2 text-lg font-semibold">Start something new</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Pick a popular path or create your own
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {QUICK_STARTS.map((qs) => (
                  <Link
                    key={qs.title}
                    href={`/paths/new?prompt=${encodeURIComponent(qs.prompt)}&language=${qs.language}&level=${qs.level}`}
                    className="bg-card group flex items-center gap-3 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <LanguageIcon language={qs.language} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{qs.title}</p>
                      <p className="text-muted-foreground truncate text-xs">{qs.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
