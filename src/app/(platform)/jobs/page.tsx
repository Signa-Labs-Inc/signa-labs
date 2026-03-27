import type { Metadata } from 'next';
import { Briefcase } from 'lucide-react';

export const metadata: Metadata = { title: 'Jobs' };

export default function JobsPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div className="border-border from-primary/10 via-background relative overflow-hidden border-b bg-linear-to-br to-violet-500/5">
        <div className="from-primary/5 absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 py-10">
          <div className="text-primary mb-2 flex items-center gap-2 text-sm font-medium">
            <Briefcase className="h-4 w-4" />
            Careers
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Join the Team</h1>
          <p className="text-muted-foreground mt-1">
            Help us build the future of engineering education.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="border-border bg-card rounded-xl border p-8 text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
            <Briefcase className="text-primary h-6 w-6" />
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
