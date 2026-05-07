"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  durationMinutes: number;
  price: string;
  depositAmount: string | null;
  paymentType: string;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  active: boolean;
  category: { name: string };
}

interface Category {
  id: string;
  name: string;
}

interface ServiceForm {
  name: string;
  description: string;
  categoryId: string;
  durationMinutes: string;
  price: string;
  depositAmount: string;
  paymentType: string;
  bufferBeforeMinutes: string;
  bufferAfterMinutes: string;
  active: boolean;
}

const emptyForm: ServiceForm = {
  name: "",
  description: "",
  categoryId: "",
  durationMinutes: "60",
  price: "",
  depositAmount: "",
  paymentType: "FULL",
  bufferBeforeMinutes: "0",
  bufferAfterMinutes: "0",
  active: true,
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    const [servicesRes, categoriesRes] = await Promise.all([
      fetch("/api/admin/services"),
      fetch("/api/admin/categories"),
    ]);
    if (servicesRes.ok) setServices(await servicesRes.json());
    if (categoriesRes.ok) setCategories(await categoriesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function updateForm(field: keyof ServiceForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description ?? "",
      categoryId: service.categoryId,
      durationMinutes: String(service.durationMinutes),
      price: String(service.price),
      depositAmount: service.depositAmount ? String(service.depositAmount) : "",
      paymentType: service.paymentType,
      bufferBeforeMinutes: String(service.bufferBeforeMinutes),
      bufferAfterMinutes: String(service.bufferAfterMinutes),
      active: service.active,
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
      name: form.name,
      description: form.description || null,
      categoryId: form.categoryId,
      durationMinutes: Number(form.durationMinutes),
      price: Number(form.price),
      depositAmount: form.depositAmount ? Number(form.depositAmount) : null,
      paymentType: form.paymentType,
      bufferBeforeMinutes: Number(form.bufferBeforeMinutes),
      bufferAfterMinutes: Number(form.bufferAfterMinutes),
      active: form.active,
    };

    const url = editingId
      ? `/api/admin/services/${editingId}`
      : "/api/admin/services";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      fetchData();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setError(null);

    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchData();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-light)]">Loading...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Services
        </h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Add Service</Button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[var(--color-border)] bg-white p-6"
        >
          <p className="mb-4 text-sm font-medium text-[var(--color-text)]">
            {editingId ? "Edit Service" : "New Service"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="svcName">Name *</Label>
              <Input
                id="svcName"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="svcCategory">Category *</Label>
              <select
                id="svcCategory"
                value={form.categoryId}
                onChange={(e) => updateForm("categoryId", e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="svcDesc">Description</Label>
              <Textarea
                id="svcDesc"
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="svcDuration">Duration (minutes) *</Label>
              <Input
                id="svcDuration"
                type="number"
                min="5"
                value={form.durationMinutes}
                onChange={(e) => updateForm("durationMinutes", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="svcPrice">Price ($) *</Label>
              <Input
                id="svcPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="svcPaymentType">Payment Type</Label>
              <select
                id="svcPaymentType"
                value={form.paymentType}
                onChange={(e) => updateForm("paymentType", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="FULL">Full Payment</option>
                <option value="DEPOSIT">Deposit</option>
              </select>
            </div>

            <div>
              <Label htmlFor="svcDeposit">Deposit Amount ($)</Label>
              <Input
                id="svcDeposit"
                type="number"
                min="0"
                step="0.01"
                value={form.depositAmount}
                onChange={(e) => updateForm("depositAmount", e.target.value)}
                disabled={form.paymentType !== "DEPOSIT"}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="svcBufferBefore">Buffer Before (min)</Label>
              <Input
                id="svcBufferBefore"
                type="number"
                min="0"
                value={form.bufferBeforeMinutes}
                onChange={(e) => updateForm("bufferBeforeMinutes", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="svcBufferAfter">Buffer After (min)</Label>
              <Input
                id="svcBufferAfter"
                type="number"
                min="0"
                value={form.bufferAfterMinutes}
                onChange={(e) => updateForm("bufferAfterMinutes", e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="svcActive"
                type="checkbox"
                checked={form.active}
                onChange={(e) => updateForm("active", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="svcActive">Active</Label>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="submit">
              {editingId ? "Update Service" : "Create Service"}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Service list */}
      <div className="space-y-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white p-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {service.name}
                </p>
                {!service.active && (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-light)]">
                {service.category.name} &middot; {service.durationMinutes} min
                &middot; ${Number(service.price).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => startEdit(service)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(service.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <p className="text-sm text-[var(--color-text-light)]">
            No services yet. Create one above.
          </p>
        )}
      </div>
    </div>
  );
}
