import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PricingCards } from './pricing-cards';
import { buildPlanForPricing, mockWindowLocation } from '@/test/helpers/component-utils';

describe('PricingCards', () => {
  let locationTracker: { value: string };

  beforeEach(() => {
    vi.restoreAllMocks();
    locationTracker = mockWindowLocation();
  });

  const freePlan = buildPlanForPricing({
    id: 'free',
    name: 'Free',
    description: 'Get started',
    prices: [],
    sortOrder: 0,
  });

  const proPlan = buildPlanForPricing({
    id: 'pro',
    name: 'Pro',
    description: 'For professionals',
    sortOrder: 1,
  });

  const enterprisePlan = buildPlanForPricing({
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions',
    prices: [],
    sortOrder: 2,
  });

  const plans = [freePlan, proPlan, enterprisePlan];

  it('renders all plan cards', () => {
    render(<PricingCards plans={plans} userPlan={null} isSignedIn={false} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('shows "Most Popular" badge on pro plan', () => {
    render(<PricingCards plans={plans} userPlan={null} isSignedIn={false} />);
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('shows billing toggle when yearly prices exist', () => {
    render(<PricingCards plans={plans} userPlan={null} isSignedIn={false} />);
    expect(screen.getByRole('radiogroup', { name: /billing interval/i })).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('hides toggle when no yearly prices', () => {
    const monthlyOnly = [
      buildPlanForPricing({
        id: 'pro',
        name: 'Pro',
        prices: [
          { stripePriceId: 'price_m', currency: 'usd', interval: 'month', unitAmount: 1999 },
        ],
      }),
    ];
    render(<PricingCards plans={monthlyOnly} userPlan={null} isSignedIn={false} />);
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('switching to yearly updates prices', async () => {
    const user = userEvent.setup();
    render(<PricingCards plans={[proPlan]} userPlan={null} isSignedIn={true} />);

    // Default is monthly: $19.99
    expect(screen.getByText('$19.99')).toBeInTheDocument();

    // Switch to yearly
    await user.click(screen.getByRole('radio', { name: /yearly/i }));
    await waitFor(() => {
      expect(screen.getByText('$199.90')).toBeInTheDocument();
    });
  });

  it('shows savings percent', () => {
    render(<PricingCards plans={[proPlan]} userPlan={null} isSignedIn={false} />);
    // yearly: 19990/12 = 1665.83 vs monthly 1999. savings ~17%
    expect(screen.getByText(/save \d+%/i)).toBeInTheDocument();
  });

  it('free plan shows "$0" / "forever"', () => {
    render(<PricingCards plans={[freePlan]} userPlan={null} isSignedIn={false} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('forever')).toBeInTheDocument();
  });

  it('enterprise shows "Custom"', () => {
    render(<PricingCards plans={[enterprisePlan]} userPlan={null} isSignedIn={false} />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('signed out: CTA redirects to /sign-in', async () => {
    const user = userEvent.setup();
    render(<PricingCards plans={[proPlan]} userPlan={null} isSignedIn={false} />);

    await user.click(screen.getByRole('button', { name: /upgrade to pro/i }));

    expect(locationTracker.value).toBe('/sign-in');
  });

  it('signed in, no sub: CTA triggers checkout', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ url: 'https://checkout.stripe.com/c/123' }), { status: 200 })
      );

    const user = userEvent.setup();
    render(<PricingCards plans={[proPlan]} userPlan={null} isSignedIn={true} />);

    await user.click(screen.getByRole('button', { name: /upgrade to pro/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/stripe/checkout',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('subscribed, different plan: CTA says "Manage Subscription"', () => {
    const userPlan = {
      planId: 'free',
      planName: 'Free',
      status: 'active' as const,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
    render(<PricingCards plans={[proPlan]} userPlan={userPlan} isSignedIn={true} />);
    expect(screen.getByRole('button', { name: /manage subscription/i })).toBeInTheDocument();
  });

  it('current plan: CTA disabled', () => {
    const userPlan = {
      planId: 'pro',
      planName: 'Pro',
      status: 'active' as const,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
    render(<PricingCards plans={[proPlan]} userPlan={userPlan} isSignedIn={true} />);
    const btn = screen.getByRole('button', { name: /current plan/i });
    expect(btn).toBeDisabled();
  });

  it('checkout error: shows alert', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Invalid plan' } }), { status: 400 })
    );

    const user = userEvent.setup();
    render(<PricingCards plans={[proPlan]} userPlan={null} isSignedIn={true} />);
    await user.click(screen.getByRole('button', { name: /upgrade to pro/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid plan');
    });
  });

  it('network error: shows "Network error"', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    const user = userEvent.setup();
    render(<PricingCards plans={[proPlan]} userPlan={null} isSignedIn={true} />);
    await user.click(screen.getByRole('button', { name: /upgrade to pro/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
    });
  });
});
