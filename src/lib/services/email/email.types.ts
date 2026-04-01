export type EmailType = 'welcome' | 'first_completion' | 'inactivity_nudge';

export type WelcomeEmailData = {
  type: 'welcome';
  userName?: string;
};

export type FirstCompletionEmailData = {
  type: 'first_completion';
  userName?: string;
  exerciseTitle: string;
};

export type InactivityNudgeEmailData = {
  type: 'inactivity_nudge';
  userName?: string;
  daysSinceActive: number;
  lastPathTitle?: string;
};

export type EmailData = WelcomeEmailData | FirstCompletionEmailData | InactivityNudgeEmailData;

export type SendEmailPayload = {
  notificationId: string;
  to: string;
  type: EmailType;
  data: EmailData;
};
