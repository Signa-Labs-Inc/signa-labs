import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { env } from '@/env';
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from '@/lib/services/subscriptions/subscriptions.service';
import { insertIdempotencyKey, markIdempotencyKeyCompleted, deleteIdempotencyKey } from '@/lib/services/subscriptions/subscriptions.writer';
import { getIdempotencyKeyStatus } from '@/lib/services/subscriptions/subscriptions.reader';
import type Stripe from 'stripe';

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Skip unhandled event types early
  if (!HANDLED_EVENTS.has(event.type)) {
    return new Response('Webhook received', { status: 200 });
  }

  // Deduplicate: check if this event was already processed or is in progress.
  // - 'completed' → return 200 so Stripe stops retrying
  // - 'processing' → return 500 so Stripe retries later (another handler is working on it)
  // - null → attempt to claim it
  const existingStatus = await getIdempotencyKeyStatus(event.id, 'stripe_webhook');
  if (existingStatus === 'completed') {
    return new Response('Webhook already processed', { status: 200 });
  }
  if (existingStatus === 'processing') {
    return new Response('Webhook is being processed', { status: 500 });
  }

  const claimed = await insertIdempotencyKey(event.id, 'stripe_webhook');
  if (!claimed) {
    // Lost the race to another concurrent request — let Stripe retry
    return new Response('Webhook claimed by another handler', { status: 500 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  } catch (error) {
    console.error(`Stripe webhook handler error [${event.id}] ${event.type}:`, error);
    // Delete the idempotency key so Stripe's retry can re-process this event.
    // Without this, the key blocks retries for 24h while Stripe retries in minutes.
    try {
      await deleteIdempotencyKey(event.id, 'stripe_webhook');
    } catch (deleteErr) {
      console.error(`Failed to delete idempotency key for ${event.id}:`, deleteErr);
    }
    return new Response('Webhook handler failed', { status: 500 });
  }

  // Mark as completed so we know this event was fully processed.
  // Wrapped in try-catch: if this fails, the event was still processed successfully.
  // Returning 200 prevents unnecessary Stripe retries.
  try {
    await markIdempotencyKeyCompleted(event.id, 'stripe_webhook');
  } catch (markErr) {
    console.error(`Failed to mark idempotency key completed for ${event.id}:`, markErr);
  }

  return new Response('Webhook received', { status: 200 });
}
