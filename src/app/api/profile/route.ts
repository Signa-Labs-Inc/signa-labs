import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { ProfileService, ProfileError } from '@/lib/services/users_profiles/users-profiles.service';
import { handleError } from '@/lib/utils/api.handler-errors';
import type { UpdateProfileInput } from '@/lib/services/users_profiles/users-profiles.types';

const profileService = new ProfileService();

/**
 * GET /api/profile — get current user's profile
 */
export async function GET() {
  try {
    const user = await requireCurrentUser();
    const profile = await profileService.getProfile(user.id);

    return NextResponse.json({ profile });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/profile — update current user's profile
 */
export async function PUT(request: NextRequest) {
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

    return handleError(error);
  }
}
