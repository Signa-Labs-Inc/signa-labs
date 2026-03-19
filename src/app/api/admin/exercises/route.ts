import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';
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
      isPublic: searchParams.has('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
      includeDeleted: searchParams.has('includeDeleted')
        ? searchParams.get('includeDeleted') === 'true'
        : undefined,
      search: searchParams.get('search') ?? undefined,
    };
    const { limit, offset } = adminService.parsePagination({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    const data = await adminService.listExercises(filters, limit, offset);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
