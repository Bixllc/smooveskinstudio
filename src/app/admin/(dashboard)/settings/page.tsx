"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

interface SettingsForm {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  cancellationPolicy: string;
  latePolicy: string;
  noShowPolicy: string;
  depositPolicy: string;
}

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
];

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    timezone: "America/Chicago",
    cancellationPolicy: "",
    latePolicy: "",
    noShowPolicy: "",
    depositPolicy: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          businessName: data.businessName ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          timezone: data.timezone ?? "America/Chicago",
          cancellationPolicy: data.cancellationPolicy ?? "",
          latePolicy: data.latePolicy ?? "",
          noShowPolicy: data.noShowPolicy ?? "",
          depositPolicy: data.depositPolicy ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  function updateField(field: keyof SettingsForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Settings saved");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to save settings");
    }
    setSaving(false);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Settings</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4">
        {loading ? (
          <div className="max-w-2xl space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-[#f5f4f2]"
              />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
            {/* Business info */}
            <Section title="Business Information">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Business name">
                    <Input
                      value={form.businessName}
                      onChange={(v) => updateField("businessName", v)}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address">
                    <Input
                      value={form.address}
                      onChange={(v) => updateField("address", v)}
                    />
                  </Field>
                </div>
                <Field label="Phone">
                  <Input
                    value={form.phone}
                    onChange={(v) => updateField("phone", v)}
                    type="tel"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={form.email}
                    onChange={(v) => updateField("email", v)}
                    type="email"
                  />
                </Field>
                <Field label="Timezone">
                  <select
                    value={form.timezone}
                    onChange={(e) => updateField("timezone", e.target.value)}
                    className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </Section>

            {/* Policies */}
            <Section title="Policies">
              <div className="space-y-3">
                <Field label="Cancellation policy">
                  <Textarea
                    value={form.cancellationPolicy}
                    onChange={(v) => updateField("cancellationPolicy", v)}
                  />
                </Field>
                <Field label="Late arrival policy">
                  <Textarea
                    value={form.latePolicy}
                    onChange={(v) => updateField("latePolicy", v)}
                  />
                </Field>
                <Field label="No-show policy">
                  <Textarea
                    value={form.noShowPolicy}
                    onChange={(v) => updateField("noShowPolicy", v)}
                  />
                </Field>
                <Field label="Deposit policy">
                  <Textarea
                    value={form.depositPolicy}
                    onChange={(v) => updateField("depositPolicy", v)}
                  />
                </Field>
              </div>
            </Section>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#C9A96E] px-5 py-2 text-[12px] font-medium text-[#1a1814] hover:bg-[#b8954f] transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save settings"}
            </button>

            {/* Sub-settings links */}
            <div className="rounded-xl border border-[#e8e6e1] bg-white overflow-hidden">
              <p className="border-b border-[#e8e6e1] px-5 py-3 text-[12px] font-medium text-[#1a1814]">
                Advanced Settings
              </p>
              {[
                { href: "/admin/settings/scheduling", label: "Scheduling Limits", description: "Min lead time, max days out, cancel/reschedule rules" },
                { href: "/admin/settings/alerts", label: "Booking Alerts", description: "Email notifications for new bookings, cancellations, reschedules" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between border-b border-[#e8e6e1] px-5 py-3 last:border-b-0 hover:bg-[#faf9f7] transition-colors"
                >
                  <div>
                    <p className="text-[12px] font-medium text-[#1a1814]">{item.label}</p>
                    <p className="text-[10px] text-[#9a9890]">{item.description}</p>
                  </div>
                  <IconChevronRight size={14} className="text-[#9a9890]" />
                </Link>
              ))}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e8e6e1] bg-white p-5">
      <p className="mb-4 text-[12px] font-medium text-[#1a1814]">{title}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-[#9a9890]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
    />
  );
}

function Textarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full resize-none rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
    />
  );
}
