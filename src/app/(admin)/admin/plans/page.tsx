'use client';

import { useEffect, useState, useCallback } from 'react';
import { CreditCard, Pencil, X, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Badge } from '@/components/ui/badge';

type RateLimit = {
  limit: number;
  window: string;
};

type PlanFeatures = {
  exercises: RateLimit;
  paths: RateLimit;
  aiGenerations: RateLimit;
  submissions: RateLimit;
};

type PlanPrice = {
  id: string;
  planId: string;
  stripePriceId: string;
  currency: string;
  interval: string;
  isActive: boolean;
  unitAmount: number | null;
};

type Plan = {
  id: string;
  name: string;
  description: string | null;
  features: PlanFeatures;
  displayFeatures: string[];
  isActive: boolean;
  sortOrder: number;
  prices: {
    id: string;
    stripePriceId: string;
    currency: string;
    interval: string;
  }[];
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PlanFeatures | null>(null);
  const [saving, setSaving] = useState(false);

  // Display features editing
  const [editingFeaturesId, setEditingFeaturesId] = useState<string | null>(null);
  const [editDisplayFeatures, setEditDisplayFeatures] = useState<string[]>([]);
  const [savingFeatures, setSavingFeatures] = useState(false);

  // Prices management
  const [planPrices, setPlanPrices] = useState<Record<string, PlanPrice[]>>({});
  const [loadingPrices, setLoadingPrices] = useState<string | null>(null);
  const [expandedPrices, setExpandedPrices] = useState<string | null>(null);
  const [newPriceForm, setNewPriceForm] = useState<{
    planId: string;
    stripePriceId: string;
    interval: string;
  } | null>(null);
  const [savingPrice, setSavingPrice] = useState(false);

  // Create plan
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [createForm, setCreateForm] = useState({
    id: '',
    name: '',
    description: '',
    monthlyPrice: '',
    yearlyPrice: '',
    currency: 'usd',
  });

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const plansRes = await fetch('/api/admin/plans');
      if (!plansRes.ok) {
        setFetchError('Failed to load plans');
        return;
      }
      const data = await plansRes.json();
      setPlans(data.plans);
      setFetchError(null);
    } catch {
      setFetchError('Network error loading plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Rate limit editing
  const defaultRateLimit: RateLimit = { limit: 0, window: 'day' };

  function startEdit(plan: Plan) {
    setEditingId(plan.id);
    setEditForm({
      exercises: plan.features.exercises ?? defaultRateLimit,
      paths: plan.features.paths ?? defaultRateLimit,
      aiGenerations: plan.features.aiGenerations ?? defaultRateLimit,
      submissions: plan.features.submissions ?? defaultRateLimit,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  function updateLimit(feature: keyof PlanFeatures, field: 'limit' | 'window', value: string) {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      [feature]: {
        ...editForm[feature],
        [field]: field === 'limit' ? parseInt(value, 10) || 0 : value,
      },
    });
  }

  async function saveEdit(planId: string) {
    if (!editForm) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: editForm }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error?.message ?? 'Failed to save rate limits');
        return;
      }
      const data = await res.json();
      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, features: data.plan.features } : p))
      );
      cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  function formatLimit(rl: RateLimit | undefined) {
    if (!rl) return 'Not set';
    if (rl.limit === -1) return 'Unlimited';
    return `${rl.limit} / ${rl.window}`;
  }

  // Display features editing
  function startEditFeatures(plan: Plan) {
    setEditingFeaturesId(plan.id);
    setEditDisplayFeatures([...plan.displayFeatures]);
  }

  function cancelEditFeatures() {
    setEditingFeaturesId(null);
    setEditDisplayFeatures([]);
  }

  function updateDisplayFeature(index: number, value: string) {
    setEditDisplayFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));
  }

  function removeDisplayFeature(index: number) {
    setEditDisplayFeatures((prev) => prev.filter((_, i) => i !== index));
  }

  function addDisplayFeature() {
    setEditDisplayFeatures((prev) => [...prev, '']);
  }

  async function saveDisplayFeatures(planId: string) {
    const filtered = editDisplayFeatures.filter((f) => f.trim() !== '');
    setSavingFeatures(true);
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayFeatures: filtered }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error?.message ?? 'Failed to save display features');
        return;
      }
      const data = await res.json();
      setPlans((prev) =>
        prev.map((p) =>
          p.id === planId ? { ...p, displayFeatures: data.plan.displayFeatures } : p
        )
      );
      cancelEditFeatures();
    } finally {
      setSavingFeatures(false);
    }
  }

  // Prices management
  async function fetchPrices(planId: string) {
    setLoadingPrices(planId);
    try {
      const res = await fetch(`/api/admin/plans/${planId}/prices`);
      if (res.ok) {
        const data = await res.json();
        setPlanPrices((prev) => ({ ...prev, [planId]: data.prices }));
      } else {
        alert('Failed to load prices');
      }
    } catch {
      alert('Network error loading prices');
    } finally {
      setLoadingPrices(null);
    }
  }

  function togglePrices(planId: string) {
    if (expandedPrices === planId) {
      setExpandedPrices(null);
    } else {
      setExpandedPrices(planId);
      if (!planPrices[planId]) {
        fetchPrices(planId);
      }
    }
  }

  async function addPrice(planId: string) {
    if (!newPriceForm) return;
    setSavingPrice(true);
    try {
      const res = await fetch(`/api/admin/plans/${planId}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripePriceId: newPriceForm.stripePriceId,
          interval: newPriceForm.interval,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error?.message ?? 'Failed to add price');
        return;
      }
      setNewPriceForm(null);
      await fetchPrices(planId);
      await fetchPlans();
    } finally {
      setSavingPrice(false);
    }
  }

  async function togglePriceActive(planId: string, priceId: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/plans/${planId}/prices/${priceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error?.message ?? 'Failed to update price');
        return;
      }
      await fetchPrices(planId);
      await fetchPlans();
    } catch {
      alert('Network error updating price');
    }
  }

  async function deletePrice(planId: string, priceId: string) {
    if (!window.confirm('Are you sure you want to delete this price? This cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/plans/${planId}/prices/${priceId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error?.message ?? 'Failed to delete price');
        return;
      }
      await fetchPrices(planId);
      await fetchPlans();
    } catch {
      alert('Network error deleting price');
    }
  }

  function formatCents(cents: number | null) {
    if (cents === null) return 'N/A';
    return `$${(cents / 100).toFixed(2)}`;
  }

  const defaultCreateForm = {
    id: '',
    name: '',
    description: '',
    monthlyPrice: '',
    yearlyPrice: '',
    currency: 'usd',
  };

  async function createPlan() {
    if (!createForm.id || !createForm.name) return;
    setCreatingPlan(true);
    try {
      const monthlyPriceCents = createForm.monthlyPrice
        ? Math.round(parseFloat(createForm.monthlyPrice) * 100)
        : undefined;
      const yearlyPriceCents = createForm.yearlyPrice
        ? Math.round(parseFloat(createForm.yearlyPrice) * 100)
        : undefined;

      // Validate parsed values client-side
      if (monthlyPriceCents !== undefined && (isNaN(monthlyPriceCents) || monthlyPriceCents <= 0)) {
        alert('Monthly price must be a positive number');
        return;
      }
      if (yearlyPriceCents !== undefined && (isNaN(yearlyPriceCents) || yearlyPriceCents <= 0)) {
        alert('Yearly price must be a positive number');
        return;
      }

      const body: Record<string, unknown> = {
        id: createForm.id,
        name: createForm.name,
        description: createForm.description || undefined,
      };

      if (monthlyPriceCents !== undefined || yearlyPriceCents !== undefined) {
        body.currency = createForm.currency;
        if (monthlyPriceCents !== undefined) body.monthlyPriceCents = monthlyPriceCents;
        if (yearlyPriceCents !== undefined) body.yearlyPriceCents = yearlyPriceCents;
      }

      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error?.message ?? 'Failed to create plan');
        return;
      }
      setCreateForm(defaultCreateForm);
      setShowCreateForm(false);
      await fetchPlans();
    } finally {
      setCreatingPlan(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          icon={CreditCard}
          title="Plans"
          description="Configure plan features, display features, and pricing"
        />
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Create Plan
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">Create New Plan</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="create-plan-id" className="text-sm font-medium">
                  Plan ID (slug)
                </label>
                <Input
                  id="create-plan-id"
                  value={createForm.id}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })
                  }
                  placeholder="e.g. starter, team"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Lowercase letters, numbers, underscores. Cannot be changed later.
                </p>
              </div>
              <div>
                <label htmlFor="create-plan-name" className="text-sm font-medium">
                  Display Name
                </label>
                <Input
                  id="create-plan-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Starter, Team"
                />
              </div>
              <div>
                <label htmlFor="create-plan-desc" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="create-plan-desc"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Short description for pricing page"
                />
              </div>
            </div>

            {/* Pricing (optional) */}
            <div className="mt-6">
              <h4 className="text-sm font-medium">Pricing (optional)</h4>
              <p className="text-muted-foreground mt-1 text-xs">
                Creates a Stripe Product and Price(s) automatically. Leave blank to create a plan without pricing.
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="create-plan-currency" className="text-sm font-medium">
                    Currency
                  </label>
                  <select
                    id="create-plan-currency"
                    value={createForm.currency}
                    onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                    <option value="cad">CAD</option>
                    <option value="aud">AUD</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="create-plan-monthly" className="text-sm font-medium">
                    Monthly Price
                  </label>
                  <Input
                    id="create-plan-monthly"
                    type="number"
                    step="0.01"
                    min="0"
                    value={createForm.monthlyPrice}
                    onChange={(e) => setCreateForm({ ...createForm, monthlyPrice: e.target.value })}
                    placeholder="e.g. 19.99"
                  />
                </div>
                <div>
                  <label htmlFor="create-plan-yearly" className="text-sm font-medium">
                    Yearly Price
                  </label>
                  <Input
                    id="create-plan-yearly"
                    type="number"
                    step="0.01"
                    min="0"
                    value={createForm.yearlyPrice}
                    onChange={(e) => setCreateForm({ ...createForm, yearlyPrice: e.target.value })}
                    placeholder="e.g. 199.99"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={createPlan}
                disabled={creatingPlan || !createForm.id || !createForm.name}
              >
                {creatingPlan ? 'Creating...' : 'Create'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateForm(defaultCreateForm);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {fetchError && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {fetchError}
          <Button size="sm" variant="ghost" className="ml-2" onClick={() => { setLoading(true); fetchPlans(); }}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="bg-muted h-6 w-32 animate-pulse rounded" />
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="bg-muted h-16 animate-pulse rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {editingId === plan.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveEdit(plan.id)} disabled={saving}>
                        <Save className="mr-1 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(plan)}>
                      <Pencil className="mr-1 h-4 w-4" />
                      Edit Limits
                    </Button>
                  )}
                </div>

                {/* Rate limits */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(['exercises', 'paths', 'aiGenerations', 'submissions'] as const).map((feature) => (
                    <div key={feature} className="border-border rounded-lg border p-3">
                      <p className="text-sm font-medium capitalize">
                        {feature === 'aiGenerations' ? 'AI Generations' : feature}
                      </p>
                      {editingId === plan.id && editForm ? (
                        <div className="mt-2 flex gap-2">
                          <Input
                            type="number"
                            value={editForm[feature]?.limit ?? 0}
                            onChange={(e) => updateLimit(feature, 'limit', e.target.value)}
                            className="w-20"
                            aria-label={`${feature} limit`}
                          />
                          <select
                            value={editForm[feature]?.window ?? 'day'}
                            onChange={(e) => updateLimit(feature, 'window', e.target.value)}
                            className="border-input bg-background rounded-md border px-2 py-1 text-sm"
                            aria-label={`${feature} window`}
                          >
                            <option value="day">/ day</option>
                            <option value="week">/ week</option>
                            <option value="month">/ month</option>
                          </select>
                        </div>
                      ) : (
                        <p className="text-muted-foreground mt-1 text-sm">
                          {formatLimit(plan.features[feature])}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Display Features */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Display Features (Pricing Page)</h4>
                    {editingFeaturesId === plan.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={cancelEditFeatures}>
                          <X className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveDisplayFeatures(plan.id)}
                          disabled={savingFeatures}
                        >
                          <Save className="mr-1 h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => startEditFeatures(plan)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>

                  {editingFeaturesId === plan.id ? (
                    <div className="mt-2 space-y-2">
                      {editDisplayFeatures.map((feature, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => updateDisplayFeature(idx, e.target.value)}
                            placeholder="Feature bullet point"
                            aria-label={`Display feature ${idx + 1}`}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeDisplayFeature(idx)}
                            aria-label={`Remove feature ${idx + 1}`}
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={addDisplayFeature}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Feature
                      </Button>
                    </div>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {plan.displayFeatures.length === 0 ? (
                        <li className="text-muted-foreground text-sm italic">
                          No display features configured
                        </li>
                      ) : (
                        plan.displayFeatures.map((f, idx) => (
                          <li key={idx} className="text-muted-foreground text-sm">
                            &bull; {f}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>

                {/* Prices */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Stripe Prices</h4>
                    <Button size="sm" variant="ghost" onClick={() => togglePrices(plan.id)}>
                      {expandedPrices === plan.id ? 'Hide' : 'Manage'}
                    </Button>
                  </div>

                  {expandedPrices === plan.id && (
                    <div className="mt-3 space-y-3">
                      {loadingPrices === plan.id ? (
                        <p className="text-muted-foreground text-sm">Loading prices...</p>
                      ) : (
                        <>
                          {(planPrices[plan.id] ?? []).length === 0 ? (
                            <p className="text-muted-foreground text-sm italic">
                              No prices configured
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {(planPrices[plan.id] ?? []).map((price) => (
                                <div
                                  key={price.id}
                                  className="border-border flex items-center justify-between rounded-lg border p-3"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant={price.isActive ? 'default' : 'secondary'}>
                                        {price.interval}
                                      </Badge>
                                      <span className="font-mono text-sm">
                                        {price.stripePriceId}
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                      {formatCents(price.unitAmount)} {price.currency.toUpperCase()}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        togglePriceActive(plan.id, price.id, price.isActive)
                                      }
                                    >
                                      {price.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deletePrice(plan.id, price.id)}
                                    >
                                      <Trash2 className="text-destructive h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add price form */}
                          {newPriceForm?.planId === plan.id ? (
                            <div className="border-border flex items-end gap-2 rounded-lg border border-dashed p-3">
                              <div className="flex-1">
                                <label
                                  className="text-xs font-medium"
                                  htmlFor={`price-id-${plan.id}`}
                                >
                                  Stripe Price ID
                                </label>
                                <Input
                                  id={`price-id-${plan.id}`}
                                  value={newPriceForm.stripePriceId}
                                  onChange={(e) =>
                                    setNewPriceForm({
                                      ...newPriceForm,
                                      stripePriceId: e.target.value,
                                    })
                                  }
                                  placeholder="price_..."
                                />
                              </div>
                              <div className="w-28">
                                <label
                                  className="text-xs font-medium"
                                  htmlFor={`interval-${plan.id}`}
                                >
                                  Interval
                                </label>
                                <select
                                  id={`interval-${plan.id}`}
                                  value={newPriceForm.interval}
                                  onChange={(e) =>
                                    setNewPriceForm({ ...newPriceForm, interval: e.target.value })
                                  }
                                  className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm"
                                >
                                  <option value="month">Monthly</option>
                                  <option value="year">Yearly</option>
                                </select>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addPrice(plan.id)}
                                disabled={savingPrice || !newPriceForm.stripePriceId}
                              >
                                Add
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setNewPriceForm(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setNewPriceForm({
                                  planId: plan.id,
                                  stripePriceId: '',
                                  interval: 'month',
                                })
                              }
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Add Price
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
