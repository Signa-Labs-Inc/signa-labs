import { render, screen } from '@testing-library/react';
import { UpgradeBanner } from './upgrade-banner';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('UpgradeBanner', () => {
  it('renders the message prop', () => {
    render(<UpgradeBanner message="You have used all exercises" />);
    expect(screen.getByText('You have used all exercises')).toBeInTheDocument();
  });

  it('renders "Usage limit reached" heading', () => {
    render(<UpgradeBanner message="test" />);
    expect(screen.getByText('Usage limit reached')).toBeInTheDocument();
  });

  it('renders link to /pricing', () => {
    render(<UpgradeBanner message="test" />);
    const link = screen.getByRole('link', { name: /upgrade plan/i });
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('applies custom className', () => {
    const { container } = render(<UpgradeBanner message="test" className="my-custom" />);
    expect(container.firstChild).toHaveClass('my-custom');
  });
});
