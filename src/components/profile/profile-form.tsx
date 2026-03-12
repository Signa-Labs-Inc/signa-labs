'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type {
  UserProfile,
  UserPreferences,
} from '@/lib/services/users_profiles/users-profiles.types';

// ============================================================
// Types
// ============================================================

type ProfileFormProps = {
  profile: UserProfile | null;
  userEmail: string;
};

type FormState = {
  displayName: string;
  username: string;
  bio: string;
  preferredCodingLanguage: string;
  editorTheme: string;
  editorFontSize: number;
  dailyGoalMinutes: number;
  emailNotifications: boolean;
  streakReminders: boolean;
};

// ============================================================
// Constants
// ============================================================

const CODING_LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'go', label: 'Go' },
  { value: 'sql', label: 'SQL' },
];

const EDITOR_THEMES = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20, 22, 24];

const DAILY_GOAL_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

// ============================================================
// Component
// ============================================================

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const prefs = (profile?.preferences ?? {}) as UserPreferences;

  const [form, setForm] = useState<FormState>({
    displayName: profile?.displayName ?? '',
    username: profile?.username ?? '',
    bio: profile?.bio ?? '',
    preferredCodingLanguage: prefs.preferred_coding_language ?? 'python',
    editorTheme: prefs.editor_theme ?? 'dark',
    editorFontSize: prefs.editor_font_size ?? 14,
    dailyGoalMinutes: prefs.daily_goal_minutes ?? 30,
    emailNotifications: prefs.email_notifications ?? true,
    streakReminders: prefs.streak_reminders ?? true,
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const updateField = useCallback(
    (field: keyof FormState, value: string | number | boolean) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName || null,
          username: form.username || null,
          bio: form.bio || null,
          preferences: {
            preferred_coding_language: form.preferredCodingLanguage,
            editor_theme: form.editorTheme,
            editor_font_size: form.editorFontSize,
            daily_goal_minutes: form.dailyGoalMinutes,
            email_notifications: form.emailNotifications,
            streak_reminders: form.streakReminders,
          },
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        toast.error(body.error ?? 'Failed to save profile');
        return;
      }

      toast.success('Profile saved');
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setIsSaving(false);
    }
  }, [form]);

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <div className="max-w-md space-y-4">
          <div>
            <Label htmlFor="email" className="text-muted-foreground text-sm">
              Email
            </Label>
            <Input id="email" value={userEmail} disabled className="mt-1" />
          </div>

          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={form.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="Your name"
              maxLength={50}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => updateField('username', e.target.value)}
              placeholder="your-username"
              maxLength={30}
              className="mt-1"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Lowercase letters, numbers, hyphens, and underscores only
            </p>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={form.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={500}
              rows={3}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring mt-1 flex w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-muted-foreground mt-1 text-xs">{form.bio.length}/500</p>
          </div>
        </div>
      </section>

      {/* Coding Preferences Section */}
      <section className="border-t pt-6 mt-6">
        <h2 className="mb-4 text-lg font-semibold">Coding Preferences</h2>
        <div className="max-w-md space-y-4">
          <div>
            <Label>Preferred Coding Language</Label>
            <Select
              value={form.preferredCodingLanguage}
              onValueChange={(value) => updateField('preferredCodingLanguage', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CODING_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground mt-1 text-xs">
              Default language when generating exercises
            </p>
          </div>

          <div>
            <Label>Editor Theme</Label>
            <Select
              value={form.editorTheme}
              onValueChange={(value) => updateField('editorTheme', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EDITOR_THEMES.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Editor Font Size</Label>
            <Select
              value={String(form.editorFontSize)}
              onValueChange={(value) => updateField('editorFontSize', Number(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Goals & Notifications Section */}
      <section className="border-t pt-6 mt-6">
        <h2 className="mb-4 text-lg font-semibold">Goals & Notifications</h2>
        <div className="max-w-md space-y-4">
          <div>
            <Label>Daily Goal</Label>
            <Select
              value={String(form.dailyGoalMinutes)}
              onValueChange={(value) => updateField('dailyGoalMinutes', Number(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAILY_GOAL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground mt-1 text-xs">
              How much time you want to spend coding each day
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-muted-foreground text-xs">
                Receive updates about your progress via email
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={form.emailNotifications}
              onCheckedChange={(checked: boolean) => updateField('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="streakReminders">Streak Reminders</Label>
              <p className="text-muted-foreground text-xs">
                Get reminded to keep your coding streak alive
              </p>
            </div>
            <Switch
              id="streakReminders"
              checked={form.streakReminders}
              onCheckedChange={(checked: boolean) => updateField('streakReminders', checked)}
            />
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
