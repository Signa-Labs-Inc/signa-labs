import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-violet-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="relative">
        <p className="bg-linear-to-r from-primary to-violet-400 bg-clip-text text-8xl font-bold text-transparent">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-md bg-linear-to-r from-primary to-primary/80 px-6 text-sm font-medium text-white transition-all hover:from-primary/90 hover:to-primary/70"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
