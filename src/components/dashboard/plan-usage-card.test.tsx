import { render, screen } from '@testing-library/react';
import { PlanUsageCard } from './plan-usage-card';
import { buildUsageSummary } from '@/test/helpers/component-utils';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) => <a href={href} {...props}>{children}</a>,
}));

describe('PlanUsageCard', () => {
  it('renders plan name', () => {
    render(<PlanUsageCard planName="Pro" usage={[]} />);
    expect(screen.getByText('Pro Plan')).toBeInTheDocument();
  });

  it('renders usage bars for limited features', () => {
    const usage = [
      buildUsageSummary({ feature: 'exercises', label: 'Exercises', current: 3, limit: 10 }),
    ];
    render(<PlanUsageCard planName="Pro" usage={usage} />);
    expect(screen.getByText('Exercises')).toBeInTheDocument();
    expect(screen.getByText('3/10')).toBeInTheDocument();
  });

  it('hides unlimited features', () => {
    const usage = [
      buildUsageSummary({ feature: 'exercises', label: 'Exercises', current: 5, limit: -1 }),
    ];
    render(<PlanUsageCard planName="Pro" usage={usage} />);
    expect(screen.queryByText('Exercises')).not.toBeInTheDocument();
  });

  it('MiniBar green at low usage', () => {
    const usage = [
      buildUsageSummary({ current: 2, limit: 10 }),
    ];
    const { container } = render(<PlanUsageCard planName="Pro" usage={usage} />);
    const bar = container.querySelector('.bg-primary');
    expect(bar).toBeInTheDocument();
  });

  it('MiniBar amber at 80%+ usage', () => {
    const usage = [
      buildUsageSummary({ current: 8, limit: 10 }),
    ];
    const { container } = render(<PlanUsageCard planName="Pro" usage={usage} />);
    const bar = container.querySelector('.bg-amber-500');
    expect(bar).toBeInTheDocument();
  });

  it('MiniBar red at limit', () => {
    const usage = [
      buildUsageSummary({ current: 10, limit: 10 }),
    ];
    const { container } = render(<PlanUsageCard planName="Pro" usage={usage} />);
    const bar = container.querySelector('.bg-destructive');
    expect(bar).toBeInTheDocument();
  });

  it('shows upgrade nudge for Free plan', () => {
    const usage = [
      buildUsageSummary({ current: 5, limit: 10 }),
    ];
    render(<PlanUsageCard planName="Free" usage={usage} />);
    expect(screen.getByText(/unlock higher limits/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /unlock higher limits/i })).toHaveAttribute('href', '/pricing');
  });

  it('hides upgrade nudge for non-Free plan', () => {
    const usage = [
      buildUsageSummary({ current: 5, limit: 10 }),
    ];
    render(<PlanUsageCard planName="Pro" usage={usage} />);
    expect(screen.queryByText(/unlock higher limits/i)).not.toBeInTheDocument();
  });
});
