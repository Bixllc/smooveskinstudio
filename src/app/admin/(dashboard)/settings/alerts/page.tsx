"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";

interface AlertsForm {
  alertNewBooking: boolean;
  alertCancellation: boolean;
  alertReschedule: boolean;
  summaryEmailEnabled: boolean;
  summaryEmailTime: string;
  summaryEmailFrequency: string;
}

export default function BookingAlertsPage() {
  const [form, setForm] = useState<AlertsForm>({
    alertNewBooking: true,
    alertCancellation: true,
    alertReschedule: true,
    summaryEmailEnabled: false,
    summaryEmailTime: "17:00",
    summaryEmailFrequency: "daily",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          alertNewBooking: data.alertNewBooking ?? true,
          alertCancellation: data.alertCancellation ?? true,
          alertReschedule: data.alertReschedule ?? true,
          summaryEmailEnabled: data.summaryEmailEnabled ?? false,
          summaryEmailTime: data.summaryEmailTime ?? "17:00",
          summaryEmailFrequency: data.summaryEmailFrequency ?? "daily",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Alert settings saved");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to save");
    }
    setSaving(false);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex h-[80px] flex-shrink-0 items-center gap-3 border-b border-black/[0.07] bg-white px-8">
        <Link
          href="/admin/settings"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-black/[0.07] text-[#a8a39c] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
        >
          <IconChevronLeft size={14} />
        </Link>
        <h1 className="text-[24px] font-semibold text-[#1b1814]">Booking Alerts</h1>
      </div>

      <div className="flex-1 overflow-auto px-8 py-8 pb-20 md:pb-8">
        {loading ? (
          <div className="max-w-lg space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-[#f5f4f2]" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
            <div className="rounded-xl border border-[#e8e6e1] bg-white p-6 space-y-4">
              <p className="text-[15px] font-semibold text-[#1a1814]">Admin Notifications</p>
              <p className="text-[11px] text-[#9a9890]">
                Choose which events trigger an email notification to the admin.
              </p>

              <ToggleField
                label="New booking"
                description="Send email when a new booking is confirmed"
                checked={form.alertNewBooking}
                onChange={(v) => setForm((f) => ({ ...f, alertNewBooking: v }))}
              />
              <ToggleField
                label="Cancellation"
                description="Send email when a booking is cancelled"
                checked={form.alertCancellation}
                onChange={(v) => setForm((f) => ({ ...f, alertCancellation: v }))}
              />
              <ToggleField
                label="Reschedule"
                description="Send email when a booking is rescheduled"
                checked={form.alertReschedule}
                onChange={(v) => setForm((f) => ({ ...f, alertReschedule: v }))}
              />
            </div>

            <div className="rounded-xl border border-[#e8e6e1] bg-white p-6 space-y-4">
              <p className="text-[15px] font-semibold text-[#1a1814]">Summary Email</p>

              <ToggleField
                label="Enable summary email"
                description="Receive a daily or weekly summary of bookings"
                checked={form.summaryEmailEnabled}
                onChange={(v) => setForm((f) => ({ ...f, summaryEmailEnabled: v }))}
              />

              {form.summaryEmailEnabled && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#9a9890]">Send time</label>
                    <input
                      type="time"
                      value={form.summaryEmailTime}
                      onChange={(e) => setForm((f) => ({ ...f, summaryEmailTime: e.target.value }))}
                      className="rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#9a9890]">Frequency</label>
                    <select
                      value={form.summaryEmailFrequency}
                      onChange={(e) => setForm((f) => ({ ...f, summaryEmailFrequency: e.target.value }))}
                      className="rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-[9px] bg-[#c9a96e] px-[18px] py-[9px] text-[13px] font-semibold text-[#1b1814] hover:opacity-85 transition-opacity disabled:opacity-60 border-none cursor-pointer"
            >
              {saving ? "Saving…" : "Save alerts"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[12px] text-[#1a1814]">{label}</p>
        {description && <p className="text-[10px] text-[#9a9890]">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 flex-shrink-0 rounded-full overflow-hidden transition-colors ${checked ? "bg-[#C9A96E]" : "bg-[#e8e6e1]"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}
