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

  it('success: opens invoice URL', async () => {
    const openSpy = mockWindowOpen();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ url: 'https://stripe.com/invoice/123' }), { status: 200 })
    );

    const user = userEvent.setup();
    render(<InvoiceLink invoiceId="inv_123" />);
    await user.click(screen.getByRole('button', { name: /invoice/i }));

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith(
        'https://stripe.com/invoice/123',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  it('API error: shows toast', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'not found' }), { status: 404 })
    );

    const user = userEvent.setup();
    render(<InvoiceLink invoiceId="inv_123" />);
    await user.click(screen.getByRole('button', { name: /invoice/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load invoice');
    });
  });

  it('network error: shows toast', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(<InvoiceLink invoiceId="inv_123" />);
    await user.click(screen.getByRole('button', { name: /invoice/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load invoice');
    });
  });
});
