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
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveMessage(null);
    setErrorMessage(null);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setErrorMessage(null);

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
          },
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setErrorMessage(body.error ?? 'Failed to save profile');
        return;
      }

      setSaveMessage('Profile saved');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setErrorMessage('Network error');
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

      {/* Preferences Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Preferences</h2>
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
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        {saveMessage && <span className="text-sm text-emerald-600">{saveMessage}</span>}
        {errorMessage && <span className="text-sm text-red-500">{errorMessage}</span>}
      </div>
    </div>
  );
}
