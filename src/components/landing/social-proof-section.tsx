const testimonials = [
  {
    quote:
      'Signa Labs helped me land my first developer job. The AI feedback is like having a senior engineer review every line.',
    name: 'Alex Chen',
    role: 'Junior Developer at Stripe',
    initials: 'AC',
  },
  {
    quote:
      'I tried every coding platform out there. This is the only one where the exercises actually adapt to what I need to learn.',
    name: 'Maria Santos',
    role: 'Full-Stack Engineer',
    initials: 'MS',
  },
  {
    quote:
      'We onboard all new hires through Signa Labs now. The team dashboard makes it easy to track who needs support.',
    name: 'James Wright',
    role: 'Engineering Manager at Datadog',
    initials: 'JW',
  },
];

const stats = [
  { value: '2,500+', label: 'Developers' },
  { value: '50,000+', label: 'Exercises completed' },
  { value: '12', label: 'Languages supported' },
  { value: '4.9/5', label: 'Average rating' },
];

export function SocialProofSection() {
  return (
    <section className="bg-black px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Stats bar */}
        <div className="mb-20 grid grid-cols-2 gap-8 border-y border-white/10 py-10 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Loved by developers
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-lg text-zinc-400">
          See what our community has to say about their learning experience.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-white/10 bg-zinc-950 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30"
            >
              <p className="leading-relaxed text-zinc-300">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-400 text-sm font-bold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
