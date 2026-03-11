import { Sparkles, Route, Play, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Generated Exercises',
    description:
      'Every exercise is uniquely crafted by AI, tailored to your skill level and learning goals.',
  },
  {
    icon: Route,
    title: 'Structured Learning Paths',
    description:
      'Follow guided curriculums that adapt based on your performance and demonstrated skills.',
  },
  {
    icon: Play,
    title: 'Real-Time Code Execution',
    description:
      'Write code and run tests instantly in secure sandboxes. Get immediate feedback on your solutions.',
  },
  {
    icon: BarChart3,
    title: 'Track Your Progress',
    description:
      'Monitor your streaks, time spent, and skills mastered with detailed analytics.',
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-black px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="animate-fade-in text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Everything You Need to Level Up
        </h2>
        <p className="animate-fade-in mx-auto mt-4 max-w-2xl text-center text-lg text-zinc-400">
          A complete platform designed to accelerate your coding skills with
          intelligent tools and personalized learning.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-in group rounded-xl border border-white/10 bg-zinc-950 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                <feature.icon className="size-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
