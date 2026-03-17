import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminReader from '@/lib/services/admin/admin.reader';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const data = await adminReader.getAdminDashboardStats();
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
