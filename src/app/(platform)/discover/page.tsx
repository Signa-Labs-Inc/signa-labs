import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Compass,
  FlaskConical,
  ArrowRight,
  Target,
  Brain,
  Code2,
  Route,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageIcon } from '@/components/ui/language-icon';
import { getCategorizedExercises } from '@/lib/services/exercises/exercises.service';
import { getPlatformExerciseCount } from '@/lib/services/exercises/exercises.reader';
import { getTotalPathCount } from '@/lib/services/paths/paths.reader';
import { CategorySection } from '@/components/exercises/category-section';

export const metadata: Metadata = { title: 'Discover' };

const SUPPORTED_LANGUAGE_COUNT = 6;

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
    prompt:
      'I want to learn SQL from basic queries to complex joins, window functions, and query optimization',
  },
];

const FEATURES = [
  {
    icon: Target,
    title: 'Adaptive Learning Paths',
    description:
      'AI-generated curricula that adjust to your skill level in real-time based on your performance.',
  },
  {
    icon: FlaskConical,
    title: 'Custom Exercises',
    description:
      'Craft your own exercises on any topic — just describe what you want to practice.',
  },
  {
    icon: Brain,
    title: 'Skill Assessment',
    description:
      'AI evaluates your code to identify strengths and target areas for growth.',
  },
];

export default async function DiscoverPage() {
  const [sections, exerciseCount, pathCount] = await Promise.all([
    getCategorizedExercises(3),
    getPlatformExerciseCount(),
    getTotalPathCount(),
  ]);

  return (
    <div className="animate-fade-in">
      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5"
        data-onboarding="discover-hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="text-primary mb-3 flex items-center gap-2 text-sm font-medium">
                <Compass className="h-4 w-4" />
                Discover
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Discover what you can
                <span className="bg-linear-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                  {' '}build
                </span>
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                Explore exercises, learning paths, and tools to level up your coding skills.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/exercises/generate">
                <Button size="lg" className="gap-2 text-base">
                  <FlaskConical className="h-5 w-5" />
                  Craft Exercise
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-border">
          <div className="px-6 py-5 text-center">
            <p className="text-2xl font-bold tabular-nums">{exerciseCount}</p>
            <p className="text-muted-foreground text-sm">Exercises</p>
          </div>
          <div className="px-6 py-5 text-center">
            <p className="text-2xl font-bold tabular-nums">{SUPPORTED_LANGUAGE_COUNT}</p>
            <p className="text-muted-foreground text-sm">Languages</p>
          </div>
          <div className="px-6 py-5 text-center">
            <p className="text-2xl font-bold tabular-nums">{pathCount}+</p>
            <p className="text-muted-foreground text-sm">Paths Created</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* ── Featured Learning Paths ── */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Route className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Learning Paths</h2>
                <p className="text-muted-foreground text-sm">
                  AI-generated curricula that adapt as you improve
                </p>
              </div>
            </div>
            <Link
              href="/paths"
              className="text-muted-foreground hover:text-primary group inline-flex shrink-0 items-center gap-1 text-sm transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_STARTS.map((qs, i) => (
              <Link
                key={qs.title}
                href={`/paths/new?prompt=${encodeURIComponent(qs.prompt)}&language=${qs.language}&level=${qs.level}`}
                className="animate-fade-in bg-card group flex items-center gap-4 rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                style={{ animationDelay: `${i * 60}ms` }}
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
        </section>

        {/* ── Exercise Categories ── */}
        {sections.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Code2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Practice Exercises</h2>
                  <p className="text-muted-foreground text-sm">
                    Hands-on exercises across multiple topics
                  </p>
                </div>
              </div>
              <Link
                href="/exercises/catalog"
                className="text-muted-foreground hover:text-primary group inline-flex shrink-0 items-center gap-1 text-sm transition-colors"
              >
                Browse all
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="space-y-12">
              {sections.map((section, index) => (
                <CategorySection
                  key={section.category.slug}
                  category={section.category}
                  exercises={section.exercises}
                  totalCount={section.totalCount}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Craft CTA ── */}
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-card to-violet-500/5 p-8 md:p-10">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5 blur-3xl" />
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-lg">
                <div className="mb-2 flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-semibold">AI-Powered</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Craft your own exercise
                </h2>
                <p className="text-muted-foreground mt-2">
                  Describe any topic you want to practice and our AI will generate a custom
                  exercise with tests, hints, and a solution — in seconds.
                </p>
              </div>
              <Link href="/exercises/generate" className="shrink-0">
                <Button size="lg" className="gap-2 text-base">
                  <FlaskConical className="h-5 w-5" />
                  Start Crafting
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Feature Highlights ── */}
        <section>
          <h2 className="mb-6 text-center text-lg font-semibold">
            Why developers love Signa Labs
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="animate-fade-in bg-card rounded-xl border p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${i * 100}ms` }}
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
        </section>
      </div>
    </div>
  );
}
