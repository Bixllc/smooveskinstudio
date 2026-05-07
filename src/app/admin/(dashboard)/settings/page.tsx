"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    timezone: "America/New_York",
    cancellationPolicy: "",
    latePolicy: "",
    noShowPolicy: "",
    depositPolicy: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setForm({
          businessName: data.businessName ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          timezone: data.timezone ?? "America/New_York",
          cancellationPolicy: data.cancellationPolicy ?? "",
          latePolicy: data.latePolicy ?? "",
          noShowPolicy: data.noShowPolicy ?? "",
          depositPolicy: data.depositPolicy ?? "",
        });
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  function updateField(field: keyof SettingsForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save settings");
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-light)]">Loading...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-semibold text-[var(--color-text)]">
        Business Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Info */}
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
          <p className="mb-4 text-sm font-medium text-[var(--color-text)]">
            Business Information
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={form.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={form.timezone}
                onChange={(e) => updateField("timezone", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
          <p className="mb-4 text-sm font-medium text-[var(--color-text)]">
            Policies
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
              <Textarea
                id="cancellationPolicy"
                value={form.cancellationPolicy}
                onChange={(e) => updateField("cancellationPolicy", e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="latePolicy">Late Arrival Policy</Label>
              <Textarea
                id="latePolicy"
                value={form.latePolicy}
                onChange={(e) => updateField("latePolicy", e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="noShowPolicy">No-Show Policy</Label>
              <Textarea
                id="noShowPolicy"
                value={form.noShowPolicy}
                onChange={(e) => updateField("noShowPolicy", e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="depositPolicy">Deposit Policy</Label>
              <Textarea
                id="depositPolicy"
                value={form.depositPolicy}
                onChange={(e) => updateField("depositPolicy", e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
            Settings saved successfully.
          </p>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
