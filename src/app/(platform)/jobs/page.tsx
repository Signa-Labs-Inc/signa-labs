import type { Metadata } from 'next';
import { Briefcase } from 'lucide-react';

export const metadata: Metadata = { title: 'Jobs' };

export default function JobsPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 py-10">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Briefcase className="h-4 w-4" />
            Careers
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Join the Team</h1>
          <p className="text-muted-foreground mt-1">
            Help us build the future of coding education.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">No Open Positions</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            We don&apos;t have any open positions right now, but we&apos;re always looking for
            talented people. Send your resume to{' '}
            <a href="mailto:careers@signalabs.com" className="text-primary hover:underline">
              careers@signalabs.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
