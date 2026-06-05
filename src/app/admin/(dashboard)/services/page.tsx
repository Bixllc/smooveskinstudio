"use client";

import { useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
      {children}
    </label>
  );
}

function TextInput({ value, onChange, type = "text", placeholder, required, disabled }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

function SelectInput({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
    >
      {children}
    </select>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allForms, setAllForms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    const [servicesRes, categoriesRes, formsRes] = await Promise.all([
      fetch("/api/admin/services"),
      fetch("/api/admin/categories"),
      fetch("/api/admin/forms"),
    ]);
    if (servicesRes.ok) setServices(await servicesRes.json());
    if (categoriesRes.ok) setCategories(await categoriesRes.json());
    if (formsRes.ok) {
      const data = await formsRes.json();
      setAllForms(data.filter((f: any) => f.active));
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const url = editingId ? `/api/admin/services/${editingId}` : "/api/admin/services";
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
    if (!confirm("Delete this service?")) return;
    setError(null);
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
    else {
      const data = await res.json();
      setError(data.error);
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <header className="h-[60px] bg-white border-b border-black/[0.07] px-8 flex items-center justify-between flex-shrink-0">
        <h1 className="text-[20px] font-semibold text-[#1b1814]">Services</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer border-none"
          >
            <IconPlus size={14} /> Add Service
          </button>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-7 pb-20 md:pb-7">
        {error && (
          <div className="mb-4 rounded-[9px] bg-[#fdecea] border border-[#f5c6c2] px-4 py-3 text-[13px] text-[#b53a2e]">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-black/[0.07] rounded-[14px] p-6 max-w-2xl mb-7">
            <p className="text-[15px] font-semibold text-[#1b1814] mb-5">
              {editingId ? "Edit Service" : "New Service"}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Name *</FieldLabel>
                  <TextInput value={form.name} onChange={(v) => updateForm("name", v)} required placeholder="e.g. Full Leg Wax" />
                </div>
                <div>
                  <FieldLabel>Category *</FieldLabel>
                  <SelectInput value={form.categoryId} onChange={(v) => updateForm("categoryId", v)}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </SelectInput>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors resize-none"
                  />
                </div>
                <div>
                  <FieldLabel>Duration (minutes) *</FieldLabel>
                  <TextInput type="number" value={form.durationMinutes} onChange={(v) => updateForm("durationMinutes", v)} required />
                </div>
                <div>
                  <FieldLabel>Price ($) *</FieldLabel>
                  <TextInput type="number" value={form.price} onChange={(v) => updateForm("price", v)} required />
                </div>
                <div>
                  <FieldLabel>Payment Type</FieldLabel>
                  <SelectInput value={form.paymentType} onChange={(v) => updateForm("paymentType", v)}>
                    <option value="FULL">Full Payment</option>
                    <option value="DEPOSIT">Deposit</option>
                  </SelectInput>
                </div>
                <div>
                  <FieldLabel>Deposit Amount ($)</FieldLabel>
                  <TextInput
                    type="number"
                    value={form.depositAmount}
                    onChange={(v) => updateForm("depositAmount", v)}
                    disabled={form.paymentType !== "DEPOSIT"}
                  />
                </div>
                <div>
                  <FieldLabel>Buffer Before (min)</FieldLabel>
                  <TextInput type="number" value={form.bufferBeforeMinutes} onChange={(v) => updateForm("bufferBeforeMinutes", v)} />
                </div>
                <div>
                  <FieldLabel>Buffer After (min)</FieldLabel>
                  <TextInput type="number" value={form.bufferAfterMinutes} onChange={(v) => updateForm("bufferAfterMinutes", v)} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="svcActive"
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => updateForm("active", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#c9a96e]"
                  />
                  <label htmlFor="svcActive" className="text-[13px] font-medium text-[#1b1814] cursor-pointer">Active</label>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="submit"
                  className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
                >
                  {editingId ? "Update Service" : "Create Service"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[9px] px-[18px] py-2 text-[13px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {editingId && (
                <AssignedForms serviceId={editingId} allForms={allForms} />
              )}
            </form>
          </div>
        )}

        {/* Service list */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-[14px] bg-[#f5f4f2]" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[14px] text-[#a8a39c]">No services yet. Create one above.</p>
          </div>
        ) : (
          <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden mb-10">
            <div className="grid bg-[#edeae5] border-b border-black/[0.07] px-5 py-[11px]" style={{ gridTemplateColumns: "2fr 1fr 80px 80px auto" }}>
              {["Service", "Category", "Duration", "Price", ""].map((h) => (
                <div key={h} className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a8a39c]">{h}</div>
              ))}
            </div>
            {services.map((service) => (
              <div
                key={service.id}
                className="grid px-5 py-[13px] border-b border-black/[0.07] last:border-0 hover:bg-[#f8f6f3] items-center transition-colors"
                style={{ gridTemplateColumns: "2fr 1fr 80px 80px auto" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[#1b1814]">{service.name}</span>
                    {!service.active && (
                      <span className="bg-[#f5f4f2] text-[#a8a39c] text-[10px] font-semibold px-[8px] py-[2px] rounded-full uppercase tracking-[0.04em]">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[13px] text-[#7a756e] truncate pr-2">{service.category.name}</span>
                <span className="text-[13px] text-[#7a756e]">{service.durationMinutes} min</span>
                <span className="text-[13.5px] font-medium text-[#b8892a]">${Number(service.price).toFixed(0)}</span>
                <div className="flex items-center gap-1 pl-2">
                  <button
                    onClick={() => startEdit(service)}
                    className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="bg-white text-[#b53a2e] border border-black/[0.12] rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#fdecea] transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AddOnsSection services={services.map((s) => ({ id: s.id, name: s.name }))} />
      </div>
    </div>
  );
}

// ─── Assigned Forms ────────────────────────────────────────────────────────────

interface AssignedForm {
  id: string;
  formTemplateId: string;
  displayOrder: number;
  formTemplate: { id: string; name: string; type: string };
}

function AssignedForms({ serviceId, allForms }: { serviceId: string; allForms: { id: string; name: string }[] }) {
  const [assignments, setAssignments] = useState<AssignedForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchAssignments() {
    const res = await fetch(`/api/admin/services/${serviceId}/forms`);
    if (res.ok) setAssignments(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchAssignments(); }, [serviceId]);

  async function handleAssign() {
    if (!selectedFormId) return;
    await fetch(`/api/admin/services/${serviceId}/forms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formTemplateId: selectedFormId, displayOrder: assignments.length }),
    });
    setSelectedFormId("");
    fetchAssignments();
  }

  async function handleUnassign(formTemplateId: string) {
    await fetch(`/api/admin/services/${serviceId}/forms/${formTemplateId}`, { method: "DELETE" });
    fetchAssignments();
  }

  const assignedIds = new Set(assignments.map((a) => a.formTemplateId));
  const available = allForms.filter((f) => !assignedIds.has(f.id));

  if (loading) return <p className="mt-4 text-[12px] text-[#a8a39c]">Loading forms...</p>;

  return (
    <div className="mt-6 border-t border-black/[0.07] pt-5">
      <p className="mb-3 text-[13px] font-semibold text-[#1b1814]">Assigned Forms</p>
      {assignments.length === 0 && (
        <p className="mb-3 text-[12px] text-[#a8a39c]">No forms assigned.</p>
      )}
      <div className="mb-3 space-y-1.5">
        {assignments.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-[8px] border border-black/[0.07] px-3 py-2 text-[13px] bg-[#faf9f7]">
            <span className="text-[#1b1814]">{a.formTemplate.name}</span>
            <button
              type="button"
              onClick={() => handleUnassign(a.formTemplateId)}
              className="text-[12px] text-[#b53a2e] hover:opacity-75"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {available.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="flex-1 px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13px] text-[#1b1814] outline-none focus:border-[#c9a96e]"
          >
            <option value="">Select a form to assign…</option>
            {available.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedFormId}
            className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[14px] py-[9px] text-[13px] font-semibold hover:opacity-85 transition-opacity border-none cursor-pointer disabled:opacity-40"
          >
            Assign
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add-ons Section ──────────────────────────────────────────────────────────

interface AddOn {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  active: boolean;
  serviceAddOns: { serviceId: string; service: { name: string } }[];
}

interface AddOnForm {
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
  active: boolean;
  serviceIds: string[];
}

const emptyAddOnForm: AddOnForm = {
  name: "",
  description: "",
  price: "",
  durationMinutes: "0",
  active: true,
  serviceIds: [],
};

function AddOnsSection({ services }: { services: { id: string; name: string }[] }) {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddOnForm>(emptyAddOnForm);
  const [error, setError] = useState<string | null>(null);

  async function fetchAddOns() {
    const res = await fetch("/api/admin/add-ons");
    if (res.ok) setAddOns(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchAddOns(); }, []);

  function updateForm(field: keyof AddOnForm, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleService(serviceId: string) {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  }

  function startEdit(addOn: AddOn) {
    setEditingId(addOn.id);
    setForm({
      name: addOn.name,
      description: addOn.description ?? "",
      price: String(addOn.price),
      durationMinutes: String(addOn.durationMinutes),
      active: addOn.active,
      serviceIds: addOn.serviceAddOns.map((sa) => sa.serviceId),
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyAddOnForm);
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
      price: Number(form.price),
      durationMinutes: Number(form.durationMinutes),
      active: form.active,
    };
    const url = editingId ? `/api/admin/add-ons/${editingId}` : "/api/admin/add-ons";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    const saved = await res.json();
    const addOnId = saved.id ?? editingId;
    await fetch(`/api/admin/add-ons/${addOnId}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceIds: form.serviceIds }),
    });
    resetForm();
    fetchAddOns();
  }

  async function handleToggleActive(addOn: AddOn) {
    await fetch(`/api/admin/add-ons/${addOn.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !addOn.active }),
    });
    fetchAddOns();
  }

  return (
    <div className="border-t border-black/[0.07] pt-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-[#1b1814]">Add-ons</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer border-none"
          >
            <IconPlus size={14} /> Add Add-on
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-[9px] bg-[#fdecea] border border-[#f5c6c2] px-4 py-3 text-[13px] text-[#b53a2e]">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-black/[0.07] rounded-[14px] p-6 max-w-2xl mb-7">
          <p className="text-[15px] font-semibold text-[#1b1814] mb-5">
            {editingId ? "Edit Add-on" : "New Add-on"}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Name *</FieldLabel>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  required
                  className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                />
              </div>
              <div>
                <FieldLabel>Price ($) *</FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  required
                  className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors resize-none"
                />
              </div>
              <div>
                <FieldLabel>Duration added (minutes)</FieldLabel>
                <input
                  type="number"
                  min="0"
                  value={form.durationMinutes}
                  onChange={(e) => updateForm("durationMinutes", e.target.value)}
                  className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="aoActive"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => updateForm("active", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-[#c9a96e]"
                />
                <label htmlFor="aoActive" className="text-[13px] font-medium text-[#1b1814] cursor-pointer">Active</label>
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Applies to services</FieldLabel>
                <div className="mt-1 flex flex-wrap gap-3">
                  {services.map((s) => (
                    <label key={s.id} className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={form.serviceIds.includes(s.id)}
                        onChange={() => toggleService(s.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-[#c9a96e]"
                      />
                      <span className="text-[13px] text-[#1b1814]">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
              >
                {editingId ? "Update Add-on" : "Create Add-on"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[9px] px-[18px] py-2 text-[13px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-[14px] bg-[#f5f4f2]" />
          ))}
        </div>
      ) : addOns.length === 0 ? (
        <p className="text-[14px] text-[#a8a39c]">No add-ons yet.</p>
      ) : (
        <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
          <div className="grid bg-[#edeae5] border-b border-black/[0.07] px-5 py-[11px]" style={{ gridTemplateColumns: "2fr 1fr 80px auto" }}>
            {["Add-on", "Services", "Price", ""].map((h) => (
              <div key={h} className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a8a39c]">{h}</div>
            ))}
          </div>
          {addOns.map((addOn) => (
            <div
              key={addOn.id}
              className="grid px-5 py-[13px] border-b border-black/[0.07] last:border-0 hover:bg-[#f8f6f3] items-center transition-colors"
              style={{ gridTemplateColumns: "2fr 1fr 80px auto" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-[#1b1814]">{addOn.name}</span>
                {!addOn.active && (
                  <span className="bg-[#f5f4f2] text-[#a8a39c] text-[10px] font-semibold px-[8px] py-[2px] rounded-full uppercase tracking-[0.04em]">
                    Inactive
                  </span>
                )}
              </div>
              <span className="text-[13px] text-[#7a756e] truncate pr-2">
                {addOn.serviceAddOns.length > 0
                  ? addOn.serviceAddOns.map((sa) => sa.service.name).join(", ")
                  : "—"}
              </span>
              <span className="text-[13.5px] font-medium text-[#b8892a]">${Number(addOn.price).toFixed(0)}</span>
              <div className="flex items-center gap-1 pl-2">
                <button
                  onClick={() => startEdit(addOn)}
                  className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(addOn)}
                  className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                >
                  {addOn.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
