import type { Metadata } from 'next';
import { requireCurrentUser } from '@/lib/services/auth/auth.service';

export const metadata: Metadata = { title: 'Profile' };
import { ProfileService } from '@/lib/services/users_profiles/users-profiles.service';
import { ProfileForm } from '@/components/profile/profile-form';

function getInitials(name: string): string {
  return name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default async function ProfilePage() {
  const user = await requireCurrentUser();

  const profileService = new ProfileService();
  const profile = await profileService.getProfile(user.id);

  const heading = profile?.displayName || user.email;
  const initials = getInitials(heading);

  return (
    <div className="animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-2xl px-6 py-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-400 text-lg font-bold text-white shadow-lg shadow-primary/20">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
              <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <ProfileForm profile={profile} userEmail={user.email} />
      </div>
    </div>
  );
}
