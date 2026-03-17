import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    await requireAdmin();
    const { templateId } = await params;
    const data = await adminService.toggleTemplateActive(templateId);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
