import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="animate-fade-in relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6">
      <div className="from-primary/5 via-background absolute inset-0 bg-linear-to-br to-violet-500/5" />
      <div className="from-primary/5 absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] via-transparent to-transparent" />
      <div className="relative">
        <p className="from-primary bg-linear-to-r to-violet-400 bg-clip-text text-8xl font-bold text-transparent">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground mt-2 text-center">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 inline-flex h-10 items-center justify-center rounded-md bg-linear-to-r px-6 text-sm font-medium text-white transition-all"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="text-muted-foreground text-sm font-medium underline-offset-4 hover:underline"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
