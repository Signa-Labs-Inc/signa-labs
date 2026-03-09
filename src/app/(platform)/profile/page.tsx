import { redirect } from 'next/navigation';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';
import { ProfileService } from '@/lib/services/users_profiles/users-profiles.service';
import { ProfileForm } from '@/components/profile/profile-form';

export default async function ProfilePage() {
  const user = await requireCurrentUser();

  const profileService = new ProfileService();
  const profile = await profileService.getProfile(user.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      <ProfileForm profile={profile} userEmail={user.email} />
    </div>
  );
}
