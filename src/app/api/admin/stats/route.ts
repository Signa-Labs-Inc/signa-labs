import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function GET() {
  try {
    await requireAdmin();
    const data = await adminService.getDashboardStats();
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
