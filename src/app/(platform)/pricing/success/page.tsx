import type { Metadata } from 'next';
import { CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/users/users.reader';
import { hasActiveSubscription } from '@/lib/services/subscriptions/subscriptions.service';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Subscription Confirmed' };

export default async function CheckoutSuccessPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect('/sign-in');
  }

  const user = await getUserByClerkId(clerkId);
  const isActive = user ? await hasActiveSubscription(user.id) : false;

  if (isActive) {
    return (
      <div className="animate-fade-in flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto max-w-md text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            You&apos;re all set!
          </h1>
          <p className="text-muted-foreground mt-3">
            Your subscription is now active. You have access to all your plan
            features.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">View Plan Details</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Subscription not yet active — webhook may still be processing
  return (
    <div className="animate-fade-in flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <Clock className="text-muted-foreground mx-auto h-16 w-16" />
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          Processing your subscription...
        </h1>
        <p className="text-muted-foreground mt-3">
          Your payment was received. It may take a moment for your subscription
          to activate. Please refresh this page in a few seconds.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/pricing/success">Refresh</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing">Back to Pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
