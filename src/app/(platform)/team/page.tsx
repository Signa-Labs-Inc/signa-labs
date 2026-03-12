import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Our Team' };

export default function TeamPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Our Team</h1>
      <p className="text-muted-foreground mt-3 text-lg">
        Meet the people behind Signa Labs.
      </p>
      <div className="mt-10 rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground text-sm">
          This page is under construction. Check back soon.
        </p>
      </div>
    </div>
  );
}
