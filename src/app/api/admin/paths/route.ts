import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') ?? undefined,
      language: searchParams.get('language') ?? undefined,
    };
    const { limit, offset } = adminService.parsePagination({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    const data = await adminService.listPaths(filters, limit, offset);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
