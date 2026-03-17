import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await requireSuperAdmin();
    const { userId } = await params;
    const body = await req.json();
    const data = await adminService.updateUserRole(currentUser.id, userId, body.role);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
