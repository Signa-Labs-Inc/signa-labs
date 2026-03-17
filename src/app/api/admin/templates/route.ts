import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/services/auth/auth.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import * as adminReader from '@/lib/services/admin/admin.reader';
import * as adminWriter from '@/lib/services/admin/admin.writer';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? undefined;
    const data = await adminReader.listAllPromptTemplates({ search });
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await adminWriter.createPromptTemplate(body);
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
