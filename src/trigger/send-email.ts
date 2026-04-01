/**
 * Send Email Task
 *
 * Trigger.dev task that sends an email via Resend.
 * Updates the notification status after sending.
 */

import { task } from '@trigger.dev/sdk/v3';
import { Resend } from 'resend';
import { renderEmail } from '@/lib/services/email/email.templates';
import { updateNotificationStatus } from '@/lib/services/notifications/notifications.writer';
import type { SendEmailPayload } from '@/lib/services/email/email.types';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Signa <noreply@updates.getsigna.io>';

export const sendEmailTask = task({
  id: 'send-email',
  maxDuration: 30,
  retry: { maxAttempts: 3 },

  run: async (payload: SendEmailPayload) => {
    const { subject, react } = renderEmail(payload);

    const { error } = await resend.emails.send({
      from: FROM,
      to: payload.to,
      subject,
      react,
    });

    if (error) {
      await updateNotificationStatus(payload.notificationId, 'failed');
      throw new Error(`Resend error: ${error.message}`);
    }

    await updateNotificationStatus(payload.notificationId, 'sent', new Date());

    return { sent: true, to: payload.to, type: payload.type };
  },
});
