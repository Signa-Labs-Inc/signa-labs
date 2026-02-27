import { requireCurrentUser } from '@/lib/services/auth/auth.service';

export default async function SettingsPage() {
  const user = await requireCurrentUser();
  return <h1>Settings {user?.email}</h1>;
}
