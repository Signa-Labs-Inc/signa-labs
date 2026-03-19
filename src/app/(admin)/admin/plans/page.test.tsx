import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPlansPage from './page';

vi.mock('@/components/admin/admin-page-header', () => ({
  AdminPageHeader: ({ title, description }: { title: string; description: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));

function makePlan(
  overrides?: Partial<{
    id: string;
    name: string;
    description: string | null;
    features: Record<string, { limit: number; window: string }>;
    displayFeatures: string[];
    isActive: boolean;
    sortOrder: number;
    prices: { id: string; stripePriceId: string; currency: string; interval: string }[];
  }>
) {
  return {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals',
    features: {
      exercises: { limit: 50, window: 'day' },
      paths: { limit: 10, window: 'month' },
      aiGenerations: { limit: 100, window: 'day' },
      submissions: { limit: 200, window: 'day' },
    },
    displayFeatures: ['50 exercises/day', 'AI support'],
    isActive: true,
    sortOrder: 1,
    prices: [],
    ...overrides,
  };
}

function plansResponse(plans: ReturnType<typeof makePlan>[]) {
  return new Response(JSON.stringify({ plans }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('AdminPlansPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loading: shows loading indicators', async () => {
    // Never resolve to keep loading state
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
    render(<AdminPlansPage />);
    // Should show skeleton placeholders (animate-pulse divs)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('success: renders plan list', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      plansResponse([makePlan({ name: 'Pro' }), makePlan({ id: 'free', name: 'Free' })])
    );

    await act(async () => {
      render(<AdminPlansPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });

  it('fetch error: shows error + retry', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), { status: 500 })
    );

    await act(async () => {
      render(<AdminPlansPage />);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to load plans/i);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('retry re-fetches', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 500 }))
      .mockResolvedValueOnce(plansResponse([makePlan({ name: 'Pro' })]));

    const user = userEvent.setup();

    await act(async () => {
      render(<AdminPlansPage />);
    });

    await waitFor(() => expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('"Create Plan" opens form', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(plansResponse([]));

    const user = userEvent.setup();

    await act(async () => {
      render(<AdminPlansPage />);
    });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /create plan/i })).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: /create plan/i }));

    expect(screen.getByLabelText(/plan id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it('create plan submits', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(plansResponse([]))
      // POST create
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ plan: makePlan({ id: 'starter', name: 'Starter' }) }), {
          status: 201,
        })
      )
      // re-fetch plans
      .mockResolvedValueOnce(plansResponse([makePlan({ id: 'starter', name: 'Starter' })]));

    const user = userEvent.setup();

    await act(async () => {
      render(<AdminPlansPage />);
    });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /create plan/i })).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: /create plan/i }));
    await user.type(screen.getByLabelText(/plan id/i), 'starter');
    await user.type(screen.getByLabelText(/display name/i), 'Starter');
    await user.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      const postCall = fetchSpy.mock.calls.find((c) => (c[1] as RequestInit)?.method === 'POST');
      expect(postCall).toBeTruthy();
    });
  });

  it('edit rate limits flow', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(plansResponse([makePlan()]))
      // PATCH save
      .mockResolvedValueOnce(new Response(JSON.stringify({ plan: makePlan() }), { status: 200 }));

    const user = userEvent.setup();

    await act(async () => {
      render(<AdminPlansPage />);
    });

    await waitFor(() => expect(screen.getByText('Pro')).toBeInTheDocument());

    // Click "Edit Limits"
    await user.click(screen.getByRole('button', { name: /edit limits/i }));

    // Should show input fields
    const limitInput = screen.getByLabelText(/exercises limit/i);
    expect(limitInput).toBeInTheDocument();

    // Change value and save
    await user.clear(limitInput);
    await user.type(limitInput, '100');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      const patchCall = fetchSpy.mock.calls.find((c) => (c[1] as RequestInit)?.method === 'PATCH');
      expect(patchCall).toBeTruthy();
    });
  });

  it('edit display features', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(plansResponse([makePlan({ displayFeatures: ['Feature A'] })]))
      // PATCH save features
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ plan: makePlan({ displayFeatures: ['Feature A', 'New Feature'] }) }),
          { status: 200 }
        )
      );

    const user = userEvent.setup();

    await act(async () => {
      render(<AdminPlansPage />);
    });

    await waitFor(() => expect(screen.getByText('Pro')).toBeInTheDocument());

    // Click Edit on display features section
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i });
    await user.click(editButtons[0]);

    // Add new feature
    await user.click(screen.getByRole('button', { name: /add feature/i }));

    // Should have 2 feature inputs now
    const featureInputs = screen.getAllByPlaceholderText(/feature bullet point/i);
    expect(featureInputs).toHaveLength(2);

    // Type into new feature
    await user.type(featureInputs[1], 'New Feature');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      const patchCall = fetchSpy.mock.calls.find((c) => (c[1] as RequestInit)?.method === 'PATCH');
      expect(patchCall).toBeTruthy();
    });
  });

  it('expand prices', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(plansResponse([makePlan()]))
      // GET prices
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            prices: [
              {
                id: 'p1',
                planId: 'pro',
                stripePriceId: 'price_123',
                currency: 'usd',
                interval: 'month',
                isActive: true,
                unitAmount: 1999,
              },
            ],
          }),
          { status: 200 }
        )
      );

    const user = userEvent.setup();

    await act(async () => {
      render(<AdminPlansPage />);
    });

    await waitFor(() => expect(screen.getByText('Pro')).toBeInTheDocument());

    // Click Manage prices
    await user.click(screen.getByRole('button', { name: /manage/i }));

    await waitFor(() => {
      expect(
        fetchSpy.mock.calls.some((c) => typeof c[0] === 'string' && c[0].includes('/prices'))
      ).toBe(true);
    });
  });

  it('delete price with confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(plansResponse([makePlan()]))
      // GET prices
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            prices: [
              {
                id: 'p1',
                planId: 'pro',
                stripePriceId: 'price_123',
                currency: 'usd',
                interval: 'month',
                isActive: true,
                unitAmount: 1999,
              },
            ],
          }),
          { status: 200 }
        )
      )
      // DELETE price
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      // re-fetch prices
      .mockResolvedValueOnce(new Response(JSON.stringify({ prices: [] }), { status: 200 }))
      // re-fetch plans
      .mockResolvedValueOnce(plansResponse([makePlan()]));

    const user = userEvent.setup();

    await act(async () => {
      render(<AdminPlansPage />);
    });

    await waitFor(() => expect(screen.getByText('Pro')).toBeInTheDocument());

    // Expand prices
    await user.click(screen.getByRole('button', { name: /manage/i }));

    await waitFor(() => expect(screen.getByText('price_123')).toBeInTheDocument());

    // Find and click the delete button (trash icon button)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('.text-destructive'));
    expect(deleteButtons.length).toBeGreaterThan(0);
    await user.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      const deleteCall = fetchSpy.mock.calls.find(
        (c) => (c[1] as RequestInit)?.method === 'DELETE'
      );
      expect(deleteCall).toBeTruthy();
    });
  });
});
