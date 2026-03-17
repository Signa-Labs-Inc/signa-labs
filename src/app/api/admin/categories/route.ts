import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminService from '@/lib/services/admin/admin.service';

export async function GET() {
  try {
    await requireAdmin();
    const data = await adminService.listCategories();
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await adminService.createCategory(body);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
