import { notFound, redirect } from 'next/navigation';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { PathService } from '@/lib/services/paths/paths.service';
import { PathError } from '@/lib/services/paths/paths.types';
import { UnauthorizedError } from '@/lib/utils/errors';
import { PathDashboard } from '@/components/paths/path-dashboard';

type Params = Promise<{ pathId: string }>;

export default async function PathDetailPage({ params }: { params: Params }) {
  const { pathId } = await params;
  const user = await requireCurrentUser();

  const pathService = new PathService();

  let progress;
  try {
    progress = await pathService.getPathProgress(pathId, user.id);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect('/sign-in');
    }
    if (error instanceof PathError && error.code === 'PATH_NOT_FOUND') {
      notFound();
    }
    throw error;
  }

  return <PathDashboard progress={progress} />;
}
