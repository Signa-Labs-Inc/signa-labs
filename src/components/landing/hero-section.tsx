import Link from 'next/link';
import { SignUpButton } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 pt-16"
      style={{
        background:
          'radial-gradient(ellipse at 50% -20%, oklch(0.45 0.18 280 / 0.3), transparent 70%), radial-gradient(ellipse at 80% 50%, oklch(0.35 0.15 260 / 0.15), transparent 50%), #000',
      }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="animate-fade-in text-5xl leading-tight font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
          Master Coding
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Through Practice
          </span>
        </h1>

        <p
          className="animate-fade-in mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl"
          style={{ animationDelay: '0.1s' }}
        >
          AI-powered exercises that adapt to your skill level. Get personalized
          lessons, real-time feedback, and structured learning paths.
        </p>

        <div
          className="animate-fade-in mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: '0.2s' }}
        >
          <SignUpButton>
            <Button size="lg" className="h-12 px-8 text-base">
              Get Started Free
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </SignUpButton>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 border-zinc-700 bg-transparent px-8 text-base text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            <Link href="/exercises">Browse Exercises</Link>
          </Button>
        </div>

        {/* Code block mockup */}
        <div
          className="animate-fade-in mx-auto mt-16 max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-zinc-950 text-left shadow-2xl shadow-violet-500/10"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <div className="size-3 rounded-full bg-red-500/80" />
            <div className="size-3 rounded-full bg-yellow-500/80" />
            <div className="size-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-zinc-500">exercise.py</span>
          </div>
          <div className="p-6 font-mono text-sm leading-7">
            <div>
              <span className="text-violet-400">def</span>{' '}
              <span className="text-blue-300">two_sum</span>
              <span className="text-zinc-300">(nums, target):</span>
            </div>
            <div className="text-zinc-500">
              {'    '}# Find two numbers that add up to target
            </div>
            <div>
              <span className="text-zinc-300">{'    '}seen = {'{}'}</span>
            </div>
            <div>
              <span className="text-violet-400">{'    '}for</span>{' '}
              <span className="text-zinc-300">i, num</span>{' '}
              <span className="text-violet-400">in</span>{' '}
              <span className="text-blue-300">enumerate</span>
              <span className="text-zinc-300">(nums):</span>
            </div>
            <div>
              <span className="text-zinc-300">{'        '}diff = target - num</span>
            </div>
            <div>
              <span className="text-violet-400">{'        '}if</span>{' '}
              <span className="text-zinc-300">diff</span>{' '}
              <span className="text-violet-400">in</span>{' '}
              <span className="text-zinc-300">seen:</span>
            </div>
            <div>
              <span className="text-violet-400">{'            '}return</span>{' '}
              <span className="text-zinc-300">[seen[diff], i]</span>
            </div>
            <div>
              <span className="text-zinc-300">{'        '}seen[num] = i</span>
            </div>
            <div className="mt-4 border-t border-white/5 pt-4 text-green-400">
              {'> '}All tests passed (4/4)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
