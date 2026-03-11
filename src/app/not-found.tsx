import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 animate-fade-in">
      <p className="text-8xl font-bold text-violet-500">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-center text-muted-foreground">
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-md bg-violet-600 px-6 text-sm font-medium text-white transition-colors hover:bg-violet-700"
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
  );
}
