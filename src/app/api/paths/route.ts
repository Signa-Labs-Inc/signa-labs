import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { PathService } from '@/lib/services/paths/paths.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import type { createPathTask } from '@/trigger/create-path';
import type { CreatePathInput } from '@/lib/services/paths/paths.types';

const VALID_STARTING_LEVELS = ['beginner', 'some_experience', 'intermediate', 'advanced'];

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();

    let body: { prompt?: string; language?: string; startingLevel?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!body.prompt || body.prompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please describe what you want to learn (at least 10 characters)' },
        { status: 400 }
      );
    }

    if (!body.language) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 });
    }

    if (!body.startingLevel) {
      return NextResponse.json({ error: 'Starting level is required' }, { status: 400 });
    }

    if (!VALID_STARTING_LEVELS.includes(body.startingLevel)) {
      return NextResponse.json(
        { error: `Invalid starting level. Must be one of: ${VALID_STARTING_LEVELS.join(', ')}` },
        { status: 400 }
      );
    }

    const handle = await tasks.trigger<typeof createPathTask>('create-path', {
      userId: user.id,
      prompt: body.prompt.trim(),
      language: body.language,
      startingLevel: body.startingLevel as CreatePathInput['startingLevel'],
    });

    return NextResponse.json(
      { runId: handle.id, publicAccessToken: handle.publicAccessToken },
      { status: 202 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/paths — list user's paths
 */
export async function GET() {
  try {
    const user = await requireCurrentUser();

    const pathService = new PathService();
    const paths = await pathService.getUserPaths(user.id);

    return NextResponse.json({ paths });
  } catch (error) {
    return handleError(error);
  }
}
