import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminReader from '@/lib/services/admin/admin.reader';
import type { AdminUserFilters } from '@/lib/services/admin/admin.types';

const VALID_ROLES = ['learner', 'admin', 'super_admin'] as const;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role') ?? undefined;
    const filters: AdminUserFilters = {
      search: searchParams.get('search') ?? undefined,
      role: roleParam && VALID_ROLES.includes(roleParam as typeof VALID_ROLES[number])
        ? (roleParam as AdminUserFilters['role'])
        : undefined,
    };
    const limit = searchParams.has('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : undefined;
    const offset = searchParams.has('offset')
      ? parseInt(searchParams.get('offset')!, 10)
      : undefined;

    const data = await adminReader.listAllUsers(filters, limit, offset);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
