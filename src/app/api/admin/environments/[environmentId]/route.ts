import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminWriter from '@/lib/services/admin/admin.writer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ environmentId: string }> }
) {
  try {
    await requireAdmin();
    const { environmentId } = await params;
    const body = await req.json();
    const data = await adminWriter.updateEnvironment(environmentId, body);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
