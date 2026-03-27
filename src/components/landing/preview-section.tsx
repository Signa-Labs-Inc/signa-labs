import { CheckCircle2, Play, BookOpen, Lightbulb, FileCode2 } from 'lucide-react';

export function PreviewSection() {
  return (
    <section className="bg-black px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="animate-fade-in text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          See It in Action
        </h2>
        <p className="animate-fade-in mx-auto mt-4 max-w-2xl text-center text-lg text-zinc-400">
          A real workspace — instructions, editor, and instant feedback side by side.
        </p>

        {/* Workspace mockup */}
        <div
          className="animate-fade-in mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-violet-500/10"
          style={{ animationDelay: '0.2s' }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-white/10 bg-zinc-950 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-red-500/80" />
                <div className="size-3 rounded-full bg-yellow-500/80" />
                <div className="size-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-sm font-medium text-white">Two Sum</span>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                Medium
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400">
                <Play className="size-3 fill-current" />
                Run Tests
              </div>
            </div>
          </div>

          {/* Split panes */}
          <div className="flex min-h-[420px]">
            {/* Left: Instructions */}
            <div className="hidden w-[320px] shrink-0 border-r border-white/10 bg-zinc-950/80 md:block">
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button className="flex items-center gap-1.5 border-b-2 border-violet-400 px-4 py-2.5 text-xs font-medium text-white">
                  <BookOpen className="size-3.5" />
                  Instructions
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-zinc-500">
                  <Lightbulb className="size-3.5" />
                  Hints
                </button>
              </div>

              {/* Instructions content */}
              <div className="p-5">
                <p className="text-sm leading-relaxed text-zinc-300">
                  Given an array of integers{' '}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-violet-300">
                    nums
                  </code>{' '}
                  and an integer{' '}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-violet-300">
                    target
                  </code>
                  , return indices of the two numbers such that they add up to target.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  You may assume that each input would have exactly one solution, and you may not
                  use the same element twice.
                </p>

                <div className="mt-6">
                  <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                    Example
                  </p>
                  <div className="mt-2 rounded-lg bg-white/5 p-3 font-mono text-xs leading-6 text-zinc-400">
                    <div>
                      <span className="text-zinc-500">Input:</span> nums = [2,7,11,15], target = 9
                    </div>
                    <div>
                      <span className="text-zinc-500">Output:</span>{' '}
                      <span className="text-emerald-400">[0, 1]</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-500">
                    arrays
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-500">
                    hash-table
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-500">
                    two-pointer
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Editor + Results */}
            <div className="flex flex-1 flex-col bg-[#1e1e2e]">
              {/* File tab */}
              <div className="flex border-b border-white/10 bg-zinc-950/50">
                <div className="flex items-center gap-1.5 border-b-2 border-violet-400 px-4 py-2 text-xs font-medium text-white">
                  <FileCode2 className="size-3.5" />
                  solution.py
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 text-xs text-zinc-500">
                  <FileCode2 className="size-3.5" />
                  <span className="italic">test_solution.py</span>
                  <span className="text-[10px] text-zinc-600">(read-only)</span>
                </div>
              </div>

              {/* Code editor mockup */}
              <div className="flex-1 p-5 font-mono text-[13px] leading-7">
                <div className="flex">
                  <span className="mr-6 text-zinc-600 select-none">1</span>
                  <span>
                    <span className="text-violet-400">def</span>{' '}
                    <span className="text-blue-300">two_sum</span>
                    <span className="text-zinc-300">(nums, target):</span>
                  </span>
                </div>
                <div className="flex">
                  <span className="mr-6 text-zinc-600 select-none">2</span>
                  <span className="text-zinc-500">{'    '}# Hash map for O(n) lookup</span>
                </div>
                <div className="flex">
                  <span className="mr-6 text-zinc-600 select-none">3</span>
                  <span className="text-zinc-300">
                    {'    '}seen = {'{}'}
                  </span>
                </div>
                <div className="flex">
                  <span className="mr-6 text-zinc-600 select-none">4</span>
                  <span>
                    <span className="text-violet-400">{'    '}for</span>{' '}
                    <span className="text-zinc-300">i, num</span>{' '}
                    <span className="text-violet-400">in</span>{' '}
                    <span className="text-blue-300">enumerate</span>
                    <span className="text-zinc-300">(nums):</span>
                  </span>
                </div>
                <div className="flex">
                  <span className="mr-6 text-zinc-600 select-none">5</span>
                  <span className="text-zinc-300">{'        '}diff = target - num</span>
                </div>
                <div className="flex">
                  <span className="mr-6 text-zinc-600 select-none">6</span>
                  <span>
                    <span className="text-violet-400">{'        '}if</span>{' '}
                    <span className="text-zinc-300">diff</span>{' '}
                    <span className="text-violet-400">in</span>{' '}
                    <span className="text-zinc-300">seen:</span>
                  </span>
                </div>
                <div className="flex">
                  <span className="mr-6 text-zinc-600 select-none">7</span>
                  <span>
                    <span className="text-violet-400">{'            '}return</span>{' '}
                    <span className="text-zinc-300">[seen[diff], i]</span>
                  </span>
                </div>
                <div className="flex">
                  <span className="mr-6 text-zinc-600 select-none">8</span>
                  <span className="text-zinc-300">{'        '}seen[num] = i</span>
                </div>
              </div>

              {/* Test results bar */}
              <div className="border-t border-white/10 bg-zinc-950/80 px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">All tests passed</span>
                    <span className="text-xs text-zinc-500">4/4</span>
                  </div>
                  <span className="text-xs text-zinc-500">42ms</span>
                </div>

                {/* Individual test results */}
                <div className="mt-2 space-y-1">
                  {[
                    'test_basic_case',
                    'test_negative_numbers',
                    'test_large_array',
                    'test_first_last_elements',
                  ].map((test) => (
                    <div key={test} className="flex items-center gap-2">
                      <CheckCircle2 className="size-3 text-emerald-400/70" />
                      <span className="font-mono text-xs text-zinc-500">{test}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
