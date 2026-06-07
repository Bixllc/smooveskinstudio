"use client";

import { useEffect, useState } from "react";
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
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <header className="h-[80px] bg-white border-b border-black/[0.07] px-4 md:px-8 flex items-center justify-between flex-shrink-0">
          <h1 className="text-[18px] md:text-[24px] font-semibold text-[#1b1814]">Coupons</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-[14px] bg-[#f5f4f2]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <header className="h-[80px] bg-white border-b border-black/[0.07] px-4 md:px-8 flex items-center justify-between flex-shrink-0">
        <h1 className="text-[18px] md:text-[24px] font-semibold text-[#1b1814]">Coupons</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer border-none"
          >
            + Create Coupon
          </button>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-8">
        {error && (
          <div className="mb-4 rounded-[9px] bg-[#fdecea] border border-[#f5c6c2] px-4 py-3 text-[13px] text-[#b53a2e]">
            {error}
          </div>
        )}

        {/* Create / Edit form */}
        {showForm && (
          <div className="bg-white border border-black/[0.07] rounded-[14px] p-6 max-w-[560px] mb-8">
            <p className="text-[15px] font-semibold text-[#1b1814] mb-5">
              {editingId ? "Edit Coupon" : "New Coupon"}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Code */}
                <div className="mb-4">
                  <label htmlFor="cpCode" className="block text-[12px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Code *
                  </label>
                  <input
                    id="cpCode"
                    value={form.code}
                    onChange={(e) => updateForm("code", e.target.value.toUpperCase())}
                    placeholder="SUMMER20"
                    required
                    disabled={!!editingId}
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-[#a8a39c]">Uppercase only. Cannot be changed after creation.</p>
                </div>

                {/* Label */}
                <div className="mb-4">
                  <label htmlFor="cpName" className="block text-[12px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Label *
                  </label>
                  <input
                    id="cpName"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Summer 2026 Promo"
                    required
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>

                {/* Discount % */}
                <div className="mb-4">
                  <label htmlFor="cpDiscount" className="block text-[12px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Discount % *
                  </label>
                  <input
                    id="cpDiscount"
                    type="number"
                    min="1"
                    max="100"
                    step="0.01"
                    value={form.discountPercent}
                    onChange={(e) => updateForm("discountPercent", e.target.value)}
                    required
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>

                {/* Usage Limit */}
                <div className="mb-4">
                  <label htmlFor="cpLimit" className="block text-[12px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Usage Limit
                  </label>
                  <input
                    id="cpLimit"
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => updateForm("usageLimit", e.target.value)}
                    placeholder="Unlimited"
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>

                {/* Expiry Date */}
                <div className="mb-4">
                  <label htmlFor="cpExpiry" className="block text-[12px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    id="cpExpiry"
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => updateForm("expiresAt", e.target.value)}
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>

                {/* Active checkbox */}
                <div className="mb-4 flex items-center gap-2 pt-6">
                  <input
                    id="cpActive"
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => updateForm("active", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#c9a96e]"
                  />
                  <label htmlFor="cpActive" className="text-[13px] font-medium text-[#1b1814] cursor-pointer">
                    Active
                  </label>
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer border-none"
                >
                  {editingId ? "Update Coupon" : "Create Coupon"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[9px] px-[18px] py-2 text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="hidden md:block bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
          {/* Header row */}
          <div className="grid bg-[#edeae5] border-b border-black/[0.07] px-6 py-[14px]" style={{ gridTemplateColumns: "1fr 1.2fr 0.8fr 0.6fr 1fr 0.8fr auto" }}>
            {["Code", "Label", "Discount", "Uses", "Expires", "Status", ""].map((h) => (
              <span key={h} className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a8a39c]">
                {h}
              </span>
            ))}
          </div>

          {/* Data rows */}
          {coupons.length === 0 ? (
            <div className="px-5 py-10 text-center text-[14px] text-[#a8a39c]">
              No coupons yet.
            </div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="grid px-6 py-[16px] border-b border-black/[0.07] last:border-0 hover:bg-[#f8f6f3] items-center transition-colors"
                style={{ gridTemplateColumns: "1fr 1.2fr 0.8fr 0.6fr 1fr 0.8fr auto" }}
              >
                {/* Code */}
                <span className="font-mono font-medium text-[15px] text-[#1b1814]">
                  {coupon.code}
                </span>

                {/* Label */}
                <span className="text-[14px] text-[#7a756e] truncate pr-2">{coupon.name}</span>

                {/* Discount */}
                <span className="text-[14px] text-[#7a756e]">
                  {Number(coupon.discountPercent).toFixed(0)}%
                </span>

                {/* Uses */}
                <span className="text-[14px] text-[#7a756e]">
                  {coupon.usageCount} / {coupon.usageLimit ?? "Unlimited"}
                </span>

                {/* Expires */}
                <span className="text-[14px] text-[#7a756e]">
                  {coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM d, yyyy") : "Never"}
                </span>

                {/* Status badge */}
                <div>
                  {coupon.active ? (
                    <span className="bg-[#e8f7ee] text-[#2e7d50] inline-flex px-[10px] py-[3px] rounded-full text-[11px] font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="bg-[#fdecea] text-[#b53a2e] inline-flex px-[10px] py-[3px] rounded-full text-[11px] font-semibold">
                      Disabled
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pl-2">
                  <button
                    onClick={() => startEdit(coupon)}
                    className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[9px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[9px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                  >
                    {coupon.active ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {coupons.length === 0 ? (
            <div className="text-center py-10 text-[14px] text-[#a8a39c]">No coupons yet.</div>
          ) : coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white border border-black/[0.07] rounded-[14px] px-4 py-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-mono font-semibold text-[16px] text-[#1b1814]">{coupon.code}</span>
                {coupon.active ? (
                  <span className="bg-[#e8f7ee] text-[#2e7d50] inline-flex px-[10px] py-[3px] rounded-full text-[11px] font-semibold flex-shrink-0">Active</span>
                ) : (
                  <span className="bg-[#fdecea] text-[#b53a2e] inline-flex px-[10px] py-[3px] rounded-full text-[11px] font-semibold flex-shrink-0">Disabled</span>
                )}
              </div>
              <p className="text-[13px] text-[#7a756e] mb-2">{coupon.name} · {Number(coupon.discountPercent).toFixed(0)}% off</p>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#a8a39c]">
                  {coupon.usageCount}/{coupon.usageLimit ?? "∞"} uses
                  {coupon.expiresAt ? ` · Expires ${format(new Date(coupon.expiresAt), "MMM d, yyyy")}` : ""}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(coupon)}
                    className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[8px] px-3 py-1 text-[12px] font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[8px] px-3 py-1 text-[12px] font-medium"
                  >
                    {coupon.active ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
