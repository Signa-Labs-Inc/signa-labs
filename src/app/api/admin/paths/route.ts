import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminReader from '@/lib/services/admin/admin.reader';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') ?? undefined,
      language: searchParams.get('language') ?? undefined,
    };
    const limit = searchParams.has('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : undefined;
    const offset = searchParams.has('offset')
      ? parseInt(searchParams.get('offset')!, 10)
      : undefined;

    const data = await adminReader.listAllLearningPaths(filters, limit, offset);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
