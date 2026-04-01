export type NotificationChannel = 'email' | 'push' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'bounced';

export type CreateNotificationParams = {
  userId: string;
  type: string;
  channel: NotificationChannel;
  subject?: string;
  body?: string;
  metadata?: Record<string, unknown>;
  status?: NotificationStatus;
};

export type CreateInAppNotificationParams = {
  userId: string;
  type: string;
  subject: string;
  body?: string;
  metadata?: Record<string, unknown>;
};

export type UserNotification = {
  id: string;
  type: string;
  channel: NotificationChannel;
  subject: string | null;
  body: string | null;
  metadata: Record<string, unknown>;
  status: NotificationStatus;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
};
