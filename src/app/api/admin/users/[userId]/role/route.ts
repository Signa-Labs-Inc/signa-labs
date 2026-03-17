import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminWriter from '@/lib/services/admin/admin.writer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireSuperAdmin();
    const { userId } = await params;
    const body = await req.json();
    const data = await adminWriter.updateUserRole(userId, body.role);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
