"use client";

import { useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import type { FormField, FieldType } from "@/lib/forms";

interface FormTemplate {
  id: string;
  name: string;
  description: string | null;
  type: string;
  fields: FormField[];
  active: boolean;
  _count: { serviceAssignments: number; submissions: number };
}

interface Service {
  id: string;
  name: string;
  category: { name: string };
}

interface AssignedService {
  id: string;
  serviceId: string;
  displayOrder: number;
  required: boolean;
  service: { id: string; name: string };
}

interface FormState {
  name: string;
  description: string;
  type: string;
  fields: FormField[];
  active: boolean;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  type: "CONSENT",
  fields: [],
  active: true,
};

function newField(): FormField {
  return { id: `field_${Date.now()}`, label: "", type: "text", required: true };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
      {children}
    </label>
  );
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function fetchForms() {
    const [formsRes, servicesRes] = await Promise.all([
      fetch("/api/admin/forms"),
      fetch("/api/admin/services"),
    ]);
    if (formsRes.ok) setForms(await formsRes.json());
    if (servicesRes.ok) setServices(await servicesRes.json());
    setLoading(false);
  }

  useEffect(() => { fetchForms(); }, []);

  function startEdit(t: FormTemplate) {
    setEditingId(t.id);
    setForm({ name: t.name, description: t.description ?? "", type: t.type, fields: t.fields, active: t.active });
    setShowEditor(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetEditor() {
    setForm(emptyForm);
    setEditingId(null);
    setShowEditor(false);
    setError(null);
  }

  function updateField(index: number, patch: Partial<FormField>) {
    setForm((prev) => {
      const fields = [...prev.fields];
      fields[index] = { ...fields[index], ...patch };
      return { ...prev, fields };
    });
  }

  function removeField(index: number) {
    setForm((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
  }

  function addField() {
    setForm((prev) => ({ ...prev, fields: [...prev.fields, newField()] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { name: form.name, description: form.description || null, type: form.type, fields: form.fields, active: form.active };
    const url = editingId ? `/api/admin/forms/${editingId}` : "/api/admin/forms";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      if (!editingId) {
        const created = await res.json();
        setEditingId(created.id);
      }
      fetchForms();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this form? If it has submissions it will be deactivated instead.")) return;
    const res = await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
    if (res.ok) fetchForms();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <header className="h-[80px] bg-white border-b border-black/[0.07] px-4 md:px-8 flex items-center justify-between flex-shrink-0">
        <h1 className="text-[18px] md:text-[24px] font-semibold text-[#1b1814]">Forms</h1>
        {!showEditor && (
          <button
            onClick={() => setShowEditor(true)}
            className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer border-none"
          >
            <IconPlus size={14} /> New Form
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

        {/* Editor */}
        {showEditor && (
          <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden max-w-2xl mb-7">
            <form onSubmit={handleSubmit} className="p-6">
              <p className="text-[15px] font-semibold text-[#1b1814] mb-5">
                {editingId ? "Edit Form" : "New Form"}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Form Name *</FieldLabel>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="e.g. Brazilian Wax Consent Form"
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>
                <div>
                  <FieldLabel>Type</FieldLabel>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  >
                    <option value="CONSENT">Consent</option>
                    <option value="INTAKE">Intake</option>
                    <option value="WAIVER">Waiver</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={2}
                    placeholder="Briefly describe this form…"
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors resize-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="fActive"
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 accent-[#c9a96e]"
                  />
                  <label htmlFor="fActive" className="text-[13px] font-medium text-[#1b1814] cursor-pointer">Active</label>
                </div>
              </div>

              {/* Field builder */}
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[15px] font-semibold text-[#1b1814]">Fields</p>
                  <button
                    type="button"
                    onClick={addField}
                    className="inline-flex items-center gap-1 rounded-[8px] border border-black/[0.12] bg-white px-3 py-[7px] text-[12px] font-medium text-[#7a756e] hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                  >
                    <IconPlus size={12} /> Add Field
                  </button>
                </div>

                {form.fields.length === 0 && (
                  <p className="text-[13px] text-[#a8a39c]">
                    No fields yet. Add fields or leave empty for signature-only forms.
                  </p>
                )}

                <div className="space-y-3">
                  {form.fields.map((field, i) => (
                    <div key={field.id} className="rounded-[10px] border border-black/[0.07] p-4 bg-[#faf9f7]">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <FieldLabel>Label *</FieldLabel>
                          <input
                            value={field.label}
                            onChange={(e) => updateField(i, { label: e.target.value })}
                            required
                            placeholder="e.g. Do you have any skin conditions?"
                            className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                          />
                        </div>
                        <div>
                          <FieldLabel>Type</FieldLabel>
                          <select
                            value={field.type}
                            onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
                            className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                          >
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="checkbox">Checkbox (Yes/Agree)</option>
                            <option value="select">Dropdown</option>
                            <option value="date">Date</option>
                            <option value="signature">Signature</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id={`req-${i}`}
                            checked={field.required}
                            onChange={(e) => updateField(i, { required: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 accent-[#c9a96e]"
                          />
                          <label htmlFor={`req-${i}`} className="text-[13px] font-medium text-[#1b1814] cursor-pointer">Required</label>
                        </div>
                        {field.type !== "checkbox" && field.type !== "signature" && (
                          <div className="sm:col-span-2">
                            <FieldLabel>Placeholder</FieldLabel>
                            <input
                              value={field.placeholder ?? ""}
                              onChange={(e) => updateField(i, { placeholder: e.target.value })}
                              className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                            />
                          </div>
                        )}
                        {field.type === "select" && (
                          <div className="sm:col-span-2">
                            <FieldLabel>Options (one per line)</FieldLabel>
                            <textarea
                              value={(field.options ?? []).join("\n")}
                              onChange={(e) =>
                                updateField(i, {
                                  options: e.target.value.split("\n").map((o) => o.trim()).filter(Boolean),
                                })
                              }
                              rows={3}
                              placeholder={"Option 1\nOption 2\nOption 3"}
                              className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors resize-none"
                            />
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeField(i)}
                          className="bg-white text-[#b53a2e] border border-black/[0.12] rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#fdecea] transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
                >
                  {editingId ? "Update Form" : "Create Form"}
                </button>
                <button
                  type="button"
                  onClick={resetEditor}
                  className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[9px] px-[18px] py-2 text-[13px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>

            {editingId && (
              <ServiceAssignments formId={editingId} services={services} />
            )}
          </div>
        )}

        {/* Form list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-[14px] bg-[#f5f4f2]" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[14px] text-[#a8a39c]">No forms yet. Create one above.</p>
          </div>
        ) : (
          <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
            <div className="grid bg-[#edeae5] border-b border-black/[0.07] px-6 py-[14px]" style={{ gridTemplateColumns: "2fr 80px 80px 80px auto" }}>
              {["Form", "Type", "Fields", "Uses", ""].map((h) => (
                <div key={h} className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a8a39c]">{h}</div>
              ))}
            </div>
            {forms.map((t) => (
              <div
                key={t.id}
                className="grid px-6 py-[16px] border-b border-black/[0.07] last:border-0 hover:bg-[#f8f6f3] items-center transition-colors"
                style={{ gridTemplateColumns: "2fr 80px 80px 80px auto" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-medium text-[#1b1814]">{t.name}</span>
                    {!t.active && (
                      <span className="bg-[#f5f4f2] text-[#a8a39c] text-[10px] font-semibold px-[8px] py-[2px] rounded-full uppercase tracking-[0.04em]">
                        Inactive
                      </span>
                    )}
                  </div>
                  {t.description && (
                    <p className="mt-0.5 text-[12px] text-[#7a756e] truncate">{t.description}</p>
                  )}
                </div>
                <span className="text-[12px] text-[#7a756e]">{t.type}</span>
                <span className="text-[14px] text-[#7a756e]">{t.fields.length}</span>
                <span className="text-[14px] text-[#7a756e]">{t._count.submissions}</span>
                <div className="flex items-center gap-1 pl-2">
                  <button
                    onClick={() => startEdit(t)}
                    className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="bg-white text-[#b53a2e] border border-black/[0.12] rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#fdecea] transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Service Assignments ──────────────────────────────────────────────────────

function ServiceAssignments({ formId, services }: { formId: string; services: Service[] }) {
  const [assignments, setAssignments] = useState<AssignedService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchAssignments() {
    const res = await fetch(`/api/admin/forms/${formId}`);
    if (res.ok) {
      const data = await res.json();
      setAssignments(data.serviceAssignments ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchAssignments(); }, [formId]);

  async function handleAssign() {
    if (!selectedServiceId || saving) return;
    setSaving(true);
    await fetch(`/api/admin/services/${selectedServiceId}/forms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formTemplateId: formId, displayOrder: assignments.length }),
    });
    setSelectedServiceId("");
    await fetchAssignments();
    setSaving(false);
  }

  async function handleUnassign(serviceId: string) {
    await fetch(`/api/admin/services/${serviceId}/forms/${formId}`, { method: "DELETE" });
    fetchAssignments();
  }

  const assignedServiceIds = new Set(assignments.map((a) => a.serviceId));
  const available = services.filter((s) => !assignedServiceIds.has(s.id));

  return (
    <div className="border-t border-black/[0.07] p-6">
      <p className="mb-1 text-[15px] font-semibold text-[#1b1814]">Assigned Services</p>
      <p className="mb-4 text-[12px] text-[#7a756e]">
        Customers booking these services will be shown this form.
      </p>
      {loading && <p className="text-[12px] text-[#a8a39c]">Loading…</p>}
      {!loading && (
        <>
          <div className="mb-3 space-y-1.5">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-[8px] border border-black/[0.07] bg-[#faf9f7] px-3 py-2">
                <span className="text-[13px] text-[#1b1814]">{a.service.name}</span>
                <button
                  type="button"
                  onClick={() => handleUnassign(a.serviceId)}
                  className="text-[12px] text-[#b53a2e] hover:opacity-75"
                >
                  Remove
                </button>
              </div>
            ))}
            {assignments.length === 0 && (
              <p className="text-[12px] text-[#a8a39c]">Not assigned to any services yet.</p>
            )}
          </div>
          {available.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="flex-1 px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13px] text-[#1b1814] outline-none focus:border-[#c9a96e]"
              >
                <option value="">Select a service to assign…</option>
                {available.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category.name})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssign}
                disabled={!selectedServiceId || saving}
                className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[14px] py-[9px] text-[13px] font-semibold hover:opacity-85 transition-opacity border-none cursor-pointer disabled:opacity-40"
              >
                {saving ? "Assigning…" : "Assign"}
              </button>
            </div>
          )}
          {available.length === 0 && assignments.length > 0 && (
            <p className="text-[12px] text-[#a8a39c]">This form is assigned to all services.</p>
          )}
        </>
      )}
    </div>
  );
}
