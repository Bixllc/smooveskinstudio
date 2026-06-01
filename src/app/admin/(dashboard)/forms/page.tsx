"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  return {
    id: `field_${Date.now()}`,
    label: "",
    type: "text",
    required: true,
  };
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
    setForm({
      name: t.name,
      description: t.description ?? "",
      type: t.type,
      fields: t.fields,
      active: t.active,
    });
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

    const payload = {
      name: form.name,
      description: form.description || null,
      type: form.type,
      fields: form.fields,
      active: form.active,
    };

    const url = editingId ? `/api/admin/forms/${editingId}` : "/api/admin/forms";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      if (!editingId) {
        // New form created — open it for editing to assign services
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

  if (loading) {
    return <p className="text-sm text-[var(--color-text-light)]">Loading...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">Forms</h2>
        {!showEditor && (
          <Button onClick={() => setShowEditor(true)}>New Form</Button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {/* Editor */}
      {showEditor && (
        <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-white">
          <form onSubmit={handleSubmit} className="p-6">
            <p className="mb-4 text-sm font-medium text-[var(--color-text)]">
              {editingId ? "Edit Form" : "New Form"}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fName">Form Name *</Label>
                <Input
                  id="fName"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="mt-1"
                  placeholder="e.g. Brazilian Wax Consent Form"
                />
              </div>

              <div>
                <Label htmlFor="fType">Type</Label>
                <select
                  id="fType"
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="CONSENT">Consent</option>
                  <option value="INTAKE">Intake</option>
                  <option value="WAIVER">Waiver</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="fDesc">Description</Label>
                <Textarea
                  id="fDesc"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="mt-1"
                  placeholder="Briefly describe this form…"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="fActive"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="fActive">Active</Label>
              </div>
            </div>

            {/* Field builder */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--color-text)]">Fields</p>
                <Button type="button" size="sm" variant="outline" onClick={addField}>
                  + Add Field
                </Button>
              </div>

              {form.fields.length === 0 && (
                <p className="text-sm text-[var(--color-text-light)]">
                  No fields yet. Add fields or leave empty for signature-only forms.
                </p>
              )}

              <div className="space-y-3">
                {form.fields.map((field, i) => (
                  <div key={field.id} className="rounded-lg border border-[var(--color-border)] p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label>Label *</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(i, { label: e.target.value })}
                          required
                          className="mt-1"
                          placeholder="e.g. Do you have any skin conditions?"
                        />
                      </div>

                      <div>
                        <Label>Type</Label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
                          className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                        >
                          <option value="text">Short Text</option>
                          <option value="textarea">Long Text</option>
                          <option value="checkbox">Checkbox (Yes/Agree)</option>
                          <option value="select">Dropdown</option>
                          <option value="date">Date</option>
                          <option value="signature">Signature</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id={`req-${i}`}
                          checked={field.required}
                          onChange={(e) => updateField(i, { required: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor={`req-${i}`}>Required</Label>
                      </div>

                      {field.type !== "checkbox" && field.type !== "signature" && (
                        <div className="sm:col-span-2">
                          <Label>Placeholder</Label>
                          <Input
                            value={field.placeholder ?? ""}
                            onChange={(e) => updateField(i, { placeholder: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      )}

                      {field.type === "select" && (
                        <div className="sm:col-span-2">
                          <Label>Options (one per line)</Label>
                          <Textarea
                            value={(field.options ?? []).join("\n")}
                            onChange={(e) =>
                              updateField(i, {
                                options: e.target.value.split("\n").map((o) => o.trim()).filter(Boolean),
                              })
                            }
                            rows={3}
                            className="mt-1"
                            placeholder={"Option 1\nOption 2\nOption 3"}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button type="button" size="sm" variant="destructive" onClick={() => removeField(i)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button type="submit">{editingId ? "Update Form" : "Create Form"}</Button>
              <Button type="button" variant="ghost" onClick={resetEditor}>Cancel</Button>
            </div>
          </form>

          {/* Service Assignments — only shown when editing an existing form */}
          {editingId && (
            <ServiceAssignments formId={editingId} services={services} />
          )}
        </div>
      )}

      {/* Form list */}
      <div className="space-y-2">
        {forms.map((t) => (
          <div key={t.id} className="rounded-lg border border-[var(--color-border)] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-[var(--color-text)]">{t.name}</p>
                  <Badge variant="outline">{t.type}</Badge>
                  {!t.active && <Badge variant="outline">Inactive</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-[var(--color-text-light)]">
                  {t.fields.length} field{t.fields.length !== 1 ? "s" : ""} &middot;{" "}
                  {t._count.serviceAssignments} service{t._count.serviceAssignments !== 1 ? "s" : ""} &middot;{" "}
                  {t._count.submissions} submission{t._count.submissions !== 1 ? "s" : ""}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-[var(--color-text-light)]">{t.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(t)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}

        {forms.length === 0 && (
          <p className="text-sm text-[var(--color-text-light)]">
            No forms yet. Create one above.
          </p>
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
    <div className="border-t border-[var(--color-border)] p-6">
      <p className="mb-1 text-sm font-medium text-[var(--color-text)]">Assigned Services</p>
      <p className="mb-4 text-xs text-[var(--color-text-light)]">
        Customers booking these services will be shown this form.
      </p>

      {loading && <p className="text-xs text-[var(--color-text-light)]">Loading…</p>}

      {!loading && (
        <>
          <div className="mb-3 space-y-2">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle,#f9f8f6)] px-3 py-2"
              >
                <span className="text-sm text-[var(--color-text)]">{a.service.name}</span>
                <button
                  type="button"
                  onClick={() => handleUnassign(a.serviceId)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            {assignments.length === 0 && (
              <p className="text-xs text-[var(--color-text-light)]">
                Not assigned to any services yet.
              </p>
            )}
          </div>

          {available.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select a service to assign…</option>
                {available.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category.name})
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                onClick={handleAssign}
                disabled={!selectedServiceId || saving}
              >
                {saving ? "Assigning…" : "Assign"}
              </Button>
            </div>
          )}

          {available.length === 0 && assignments.length > 0 && (
            <p className="text-xs text-[var(--color-text-light)]">
              This form is assigned to all services.
            </p>
          )}
        </>
      )}
    </div>
  );
}
