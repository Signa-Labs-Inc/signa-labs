import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Investors' };

export default function InvestorsPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Investors</h1>
      <p className="text-muted-foreground mt-3 text-lg">
        Backing the future of coding education.
      </p>
      <div className="mt-10 rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground text-sm">
          This page is under construction. Check back soon.
        </p>
      </div>
    </div>
  );
}
