import { currentUser } from '@clerk/nextjs/server';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { ProfileService } from '@/lib/services/users_profiles/users-profiles.service';
import { ProfileForm } from '@/components/profile/profile-form';
import Image from 'next/image';

export default async function ProfilePage() {
  const user = await requireCurrentUser();
  const clerkUser = await currentUser();

  const profileService = new ProfileService();
  const profile = await profileService.getProfile(user.id);

  const avatarUrl = clerkUser?.imageUrl;
  const heading = profile?.displayName || user.email;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center gap-4">
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt="User avatar"
            width={56}
            height={56}
            className="rounded-full"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
        </div>
      </div>

      <ProfileForm profile={profile} userEmail={user.email} />
    </div>
  );
}
