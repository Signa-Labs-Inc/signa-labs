import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await requireAdmin();
    const { categoryId } = await params;
    const body = await req.json();
    const data = await adminService.updateCategory(categoryId, body);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await requireAdmin();
    const { categoryId } = await params;
    const data = await adminService.deleteCategory(categoryId);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
