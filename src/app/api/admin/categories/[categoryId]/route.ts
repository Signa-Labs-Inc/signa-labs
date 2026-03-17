import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminWriter from '@/lib/services/admin/admin.writer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await requireAdmin();
    const { categoryId } = await params;
    const body = await req.json();
    const data = await adminWriter.updateCategory(categoryId, body);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await requireAdmin();
    const { categoryId } = await params;
    const data = await adminWriter.deleteCategory(categoryId);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
