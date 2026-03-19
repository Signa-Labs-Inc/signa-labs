import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceLink } from './invoice-link';
import { mockWindowOpen } from '@/test/helpers/component-utils';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { toast } from 'sonner';

describe('InvoiceLink', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Invoice button', () => {
    render(<InvoiceLink invoiceId="inv_123" />);
    expect(screen.getByRole('button', { name: /invoice/i })).toBeInTheDocument();
  });

  it('success: opens blank window then navigates to invoice URL', async () => {
    const fakeWindow = { location: { href: '' }, close: vi.fn() };
    const openSpy = vi.fn().mockReturnValue(fakeWindow);
    window.open = openSpy;

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ url: 'https://stripe.com/invoice/123' }), { status: 200 })
    );

    const user = userEvent.setup();
    render(<InvoiceLink invoiceId="inv_123" />);
    await user.click(screen.getByRole('button', { name: /invoice/i }));

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith('about:blank', '_blank', 'noopener,noreferrer');
      expect(fakeWindow.location.href).toBe('https://stripe.com/invoice/123');
    });
  });

  it('API error: closes blank window and shows toast', async () => {
    const fakeWindow = { location: { href: '' }, close: vi.fn() };
    window.open = vi.fn().mockReturnValue(fakeWindow);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'not found' }), { status: 404 })
    );

    const user = userEvent.setup();
    render(<InvoiceLink invoiceId="inv_123" />);
    await user.click(screen.getByRole('button', { name: /invoice/i }));

    await waitFor(() => {
      expect(fakeWindow.close).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Failed to load invoice');
    });
  });

  it('network error: closes blank window and shows toast', async () => {
    const fakeWindow = { location: { href: '' }, close: vi.fn() };
    window.open = vi.fn().mockReturnValue(fakeWindow);

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(<InvoiceLink invoiceId="inv_123" />);
    await user.click(screen.getByRole('button', { name: /invoice/i }));

    await waitFor(() => {
      expect(fakeWindow.close).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Failed to load invoice');
    });
  });
});
