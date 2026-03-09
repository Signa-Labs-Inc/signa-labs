/**
 * Profile Service
 */

import * as reader from './users-profiles.reader';
import * as writer from './users-profiles.writer';
import type { UserProfile, UpdateProfileInput } from './users-profiles.types';

export class ProfileService {
  async getProfile(userId: string): Promise<UserProfile | null> {
    return reader.getUserProfile(userId);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    // Validate username if provided
    if (input.username !== undefined && input.username !== null) {
      const username = input.username.trim().toLowerCase();

      if (username.length < 3) {
        throw new ProfileError('USERNAME_TOO_SHORT', 'Username must be at least 3 characters');
      }

      if (username.length > 30) {
        throw new ProfileError('USERNAME_TOO_LONG', 'Username must be 30 characters or less');
      }

      if (!/^[a-z0-9_-]+$/.test(username)) {
        throw new ProfileError(
          'USERNAME_INVALID',
          'Username can only contain lowercase letters, numbers, hyphens, and underscores'
        );
      }

      const taken = await reader.isUsernameTaken(username, userId);
      if (taken) {
        throw new ProfileError('USERNAME_TAKEN', 'This username is already taken');
      }

      input.username = username;
    }

    // Validate display name if provided
    if (input.displayName !== undefined && input.displayName !== null) {
      const displayName = input.displayName.trim();

      if (displayName.length > 50) {
        throw new ProfileError(
          'DISPLAY_NAME_TOO_LONG',
          'Display name must be 50 characters or less'
        );
      }

      input.displayName = displayName;
    }

    // Validate bio if provided
    if (input.bio !== undefined && input.bio !== null) {
      if (input.bio.length > 500) {
        throw new ProfileError('BIO_TOO_LONG', 'Bio must be 500 characters or less');
      }
    }

    return writer.upsertProfile(userId, input);
  }
}

export class ProfileError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ProfileError';
  }

  get httpStatus(): number {
    switch (this.code) {
      case 'USERNAME_TAKEN':
      case 'USERNAME_TOO_SHORT':
      case 'USERNAME_TOO_LONG':
      case 'USERNAME_INVALID':
      case 'DISPLAY_NAME_TOO_LONG':
      case 'BIO_TOO_LONG':
        return 400;
      default:
        return 500;
    }
  }
}
