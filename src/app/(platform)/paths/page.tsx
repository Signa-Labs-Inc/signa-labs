import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, BookOpen } from 'lucide-react';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { PathService } from '@/lib/services/paths/paths.service';
import { Button } from '@/components/ui/button';
import { PathCard } from '@/components/paths/path-card';

export default async function PathsPage() {
  const user = await requireCurrentUser();

  const pathService = new PathService();

  let paths;
  try {
    paths = await pathService.getUserPaths(user.id);
  } catch {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Learning Paths</h1>
        <p className="text-destructive mt-4">
          Something went wrong loading your paths. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Paths</h1>
          <p className="text-muted-foreground mt-1">
            Personalized curricula that adapt to your progress
          </p>
        </div>
        <Link href="/paths/new">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            New Path
          </Button>
        </Link>
      </div>

      {paths.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold">No learning paths yet</h2>
          <p className="text-muted-foreground mt-1 mb-4 max-w-sm">
            Start a learning path to get a personalized curriculum that adapts to your skill level
            as you progress.
          </p>
          <Link href="/paths/new">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Start Your First Path
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {paths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      )}
    </div>
  );
}
