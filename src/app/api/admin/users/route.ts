import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';
import type { AdminUserFilters } from '@/lib/services/admin/admin.types';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role') ?? undefined;
    const filters: AdminUserFilters = {
      search: searchParams.get('search') ?? undefined,
      role:
        roleParam &&
        adminService.ALLOWED_ROLES.includes(
          roleParam as (typeof adminService.ALLOWED_ROLES)[number]
        )
          ? (roleParam as AdminUserFilters['role'])
          : undefined,
    };
    const { limit, offset } = adminService.parsePagination({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    const data = await adminService.listUsers(filters, limit, offset);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
