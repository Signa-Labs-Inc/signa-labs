import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import * as userService from '@/lib/services/users/users.service';
import { USER_DEFAULT_ROLE } from '@/lib/services/users/users.constants';
export async function POST(req: NextRequest) {
  try {
    const event = await verifyWebhook(req);
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses } = event.data;
        const email = email_addresses[0]?.email_address;
        const isVerified = email_addresses[0]?.verification?.status === 'verified';
        if (!email) {
          console.error('Clerk webhook: user.created with no email', id);
          return new Response('User has no email address', { status: 400 });
        }
        await userService.createUser({
          clerkId: id,
          email,
          orgId: null,
          role: USER_DEFAULT_ROLE,
          emailVerifiedAt: isVerified ? new Date() : undefined,
        });
        break;
      }
      case 'user.updated': {
        const { id, email_addresses } = event.data;
        const emailObj = email_addresses[0];
        const isVerified = emailObj?.verification?.status === 'verified';
        const existingUser = await userService.getUserByClerkId(id);
        await userService.updateUser(id, {
          email: emailObj?.email_address,
          emailVerifiedAt: isVerified && !existingUser?.emailVerifiedAt ? new Date() : undefined,
        });
        break;
      }
      case 'user.deleted': {
        const { id } = event.data;
        if (!id) {
          console.error('Clerk webhook: user.deleted with no id');
          return new Response('User ID is required', { status: 400 });
        }
        await userService.deleteUser(id);
        break;
      }
      default:
        break;
    }
    return new Response('Webhook received', { status: 200 });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return new Response('Webhook verification failed', { status: 400 });
  }
}
