import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { ProfileService, ProfileError } from '@/lib/services/users_profiles/users-profiles.service';
import type { UpdateProfileInput } from '@/lib/services/users_profiles/users-profiles.types';

const profileService = new ProfileService();

/**
 * GET /api/profile — get current user's profile
 */
export async function GET(): Promise<NextResponse> {
  try {
    const user = await requireCurrentUser();
    const profile = await profileService.getProfile(user.id);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[GET /api/profile]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/profile — update current user's profile
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as UpdateProfileInput;

    const profile = await profileService.updateProfile(user.id, body);

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof ProfileError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.httpStatus }
      );
    }

    console.error('[PUT /api/profile]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
