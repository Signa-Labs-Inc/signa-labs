import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Partners' };

export default function PartnersPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
      <p className="text-muted-foreground mt-3 text-lg">
        Organizations we work with to make engineering education better.
      </p>
      <div className="border-border mt-10 rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">
          This page is under construction. Check back soon.
        </p>
      </div>
    </div>
  );
}
