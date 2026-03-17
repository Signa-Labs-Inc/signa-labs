import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ environmentId: string }> }
) {
  try {
    await requireAdmin();
    const { environmentId } = await params;
    const body = await req.json();
    const data = await adminService.updateEnvironment(environmentId, body);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
