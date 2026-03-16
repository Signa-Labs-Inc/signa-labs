import Link from 'next/link';
import { SignUpButton } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, oklch(0.55 0.22 280), oklch(0.45 0.20 260))',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 30% 50%, oklch(0.7 0.2 280 / 0.4), transparent 60%), radial-gradient(ellipse at 70% 50%, oklch(0.5 0.25 260 / 0.3), transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to Start Coding?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
          Try any exercise right now — no account needed. Sign up to save your
          progress, craft custom exercises, and build learning paths.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-12 bg-white px-8 text-base font-semibold text-violet-700 hover:bg-zinc-100"
          >
            <Link href="/exercises">
              Try an Exercise
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <SignUpButton forceRedirectUrl="/discover">
            <Button
              variant="outline"
              size="lg"
              className="h-12 border-white/30 bg-transparent px-8 text-base text-white hover:bg-white/10"
            >
              Create Free Account
            </Button>
          </SignUpButton>
        </div>
      </div>
    </section>
  );
}
