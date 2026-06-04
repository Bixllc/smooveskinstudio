"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  name: string;
  discountPercent: string;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

interface CouponForm {
  code: string;
  name: string;
  discountPercent: string;
  usageLimit: string;
  expiresAt: string;
  active: boolean;
}

const emptyForm: CouponForm = {
  code: "",
  name: "",
  discountPercent: "",
  usageLimit: "",
  expiresAt: "",
  active: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function fetchCoupons() {
    const res = await fetch("/api/admin/coupons");
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  function updateForm(field: keyof CouponForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(coupon: Coupon) {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      name: coupon.name,
      discountPercent: String(coupon.discountPercent),
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      active: coupon.active,
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      code: form.code,
      name: form.name,
      discountPercent: Number(form.discountPercent),
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      expiresAt: form.expiresAt || null,
      active: form.active,
    };

    const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      fetchCoupons();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function handleToggleActive(coupon: Coupon) {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    fetchCoupons();
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-light)]">Loading…</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">Coupons</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Create Coupon</Button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[var(--color-border)] bg-white p-6"
        >
          <p className="mb-4 text-sm font-medium text-[var(--color-text)]">
            {editingId ? "Edit Coupon" : "New Coupon"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cpCode">Code *</Label>
              <Input
                id="cpCode"
                value={form.code}
                onChange={(e) => updateForm("code", e.target.value.toUpperCase())}
                placeholder="SUMMER20"
                required
                disabled={!!editingId}
                className="mt-1 font-mono uppercase"
              />
              <p className="mt-1 text-xs text-[var(--color-text-light)]">Uppercase only. Cannot be changed after creation.</p>
            </div>

            <div>
              <Label htmlFor="cpName">Label *</Label>
              <Input
                id="cpName"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="Summer 2026 Promo"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cpDiscount">Discount % *</Label>
              <Input
                id="cpDiscount"
                type="number"
                min="1"
                max="100"
                step="0.01"
                value={form.discountPercent}
                onChange={(e) => updateForm("discountPercent", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cpLimit">Usage Limit</Label>
              <Input
                id="cpLimit"
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) => updateForm("usageLimit", e.target.value)}
                placeholder="Unlimited"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cpExpiry">Expiry Date</Label>
              <Input
                id="cpExpiry"
                type="date"
                value={form.expiresAt}
                onChange={(e) => updateForm("expiresAt", e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="cpActive"
                type="checkbox"
                checked={form.active}
                onChange={(e) => updateForm("active", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="cpActive">Active</Label>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="submit">{editingId ? "Update Coupon" : "Create Coupon"}</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-xs uppercase tracking-wide text-[var(--color-text-light)]">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Uses</th>
              <th className="px-4 py-3 text-left">Expires</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-white">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-4 py-3 font-mono font-medium text-[var(--color-text)]">{coupon.code}</td>
                <td className="px-4 py-3 text-[var(--color-text-light)]">{coupon.name}</td>
                <td className="px-4 py-3 text-[var(--color-text)]">{Number(coupon.discountPercent).toFixed(0)}%</td>
                <td className="px-4 py-3 text-[var(--color-text-light)]">
                  {coupon.usageCount} / {coupon.usageLimit ?? "∞"}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-light)]">
                  {coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM d, yyyy") : "Never"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={coupon.active ? "default" : "outline"}>
                    {coupon.active ? "Active" : "Disabled"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(coupon)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleToggleActive(coupon)}>
                      {coupon.active ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-light)]">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
