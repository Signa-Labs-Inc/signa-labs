import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminReader from '@/lib/services/admin/admin.reader';
import type { AdminExerciseFilters } from '@/lib/services/admin/admin.types';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') ?? undefined;
    const filters: AdminExerciseFilters = {
      origin: origin === 'platform' || origin === 'user' ? origin : undefined,
      language: searchParams.get('language') ?? undefined,
      difficulty: searchParams.get('difficulty') ?? undefined,
      isValidated: searchParams.has('isValidated')
        ? searchParams.get('isValidated') === 'true'
        : undefined,
      isPublic: searchParams.has('isPublic')
        ? searchParams.get('isPublic') === 'true'
        : undefined,
      includeDeleted: searchParams.has('includeDeleted')
        ? searchParams.get('includeDeleted') === 'true'
        : undefined,
      search: searchParams.get('search') ?? undefined,
    };
    const limit = searchParams.has('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : undefined;
    const offset = searchParams.has('offset')
      ? parseInt(searchParams.get('offset')!, 10)
      : undefined;

    const data = await adminReader.listAllExercises(filters, limit, offset);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
