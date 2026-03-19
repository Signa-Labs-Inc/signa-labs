import { toSubscriptionStatus, toPaymentStatus } from '../subscriptions.types';

describe('toSubscriptionStatus', () => {
  const validStatuses = [
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused',
    'incomplete',
    'incomplete_expired',
  ];

  it.each(validStatuses)('returns "%s" for valid status', (status) => {
    expect(toSubscriptionStatus(status)).toBe(status);
  });

  it('throws for invalid status', () => {
    expect(() => toSubscriptionStatus('invalid')).toThrow('Invalid subscription status: invalid');
  });

  it('throws for empty string', () => {
    expect(() => toSubscriptionStatus('')).toThrow('Invalid subscription status: ');
  });

  it('throws for case mismatch', () => {
    expect(() => toSubscriptionStatus('Active')).toThrow('Invalid subscription status: Active');
  });
});

describe('toPaymentStatus', () => {
  const validStatuses = ['succeeded', 'failed', 'refunded', 'partial_refund'];

  it.each(validStatuses)('returns "%s" for valid status', (status) => {
    expect(toPaymentStatus(status)).toBe(status);
  });

  it('throws for invalid status', () => {
    expect(() => toPaymentStatus('pending')).toThrow('Invalid payment status: pending');
  });

  it('throws for empty string', () => {
    expect(() => toPaymentStatus('')).toThrow('Invalid payment status: ');
  });
});
