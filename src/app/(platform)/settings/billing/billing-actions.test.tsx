import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BillingActions } from './billing-actions';
import { mockWindowLocation } from '@/test/helpers/component-utils';

describe('BillingActions', () => {
  let locationTracker: { value: string };

  beforeEach(() => {
    vi.restoreAllMocks();
    locationTracker = mockWindowLocation();
  });

  it('renders manage billing button', () => {
    render(<BillingActions />);
    expect(
      screen.getByRole('button', { name: /change plan, cancel, or update payment/i })
    ).toBeInTheDocument();
  });

  it('success: redirects to portal URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ url: 'https://billing.stripe.com/portal/123' }), { status: 200 })
    );

    const user = userEvent.setup();
    render(<BillingActions />);
    await user.click(screen.getByRole('button', { name: /change plan/i }));

    await waitFor(() => {
      expect(locationTracker.value).toBe('https://billing.stripe.com/portal/123');
    });
  });

  it('API error: shows error alert', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'No subscription found' } }), { status: 400 })
    );

    const user = userEvent.setup();
    render(<BillingActions />);
    await user.click(screen.getByRole('button', { name: /change plan/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No subscription found');
    });
  });

  it('network error: shows error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    const user = userEvent.setup();
    render(<BillingActions />);
    await user.click(screen.getByRole('button', { name: /change plan/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    });
  });
});
