"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";

interface SchedulingForm {
  minBookingLeadHours: number;
  maxBookingDaysOut: number;
  cancelRescheduleWindowHours: number;
  allowClientCancel: boolean;
  allowClientReschedule: boolean;
}

export default function SchedulingLimitsPage() {
  const [form, setForm] = useState<SchedulingForm>({
    minBookingLeadHours: 2,
    maxBookingDaysOut: 100,
    cancelRescheduleWindowHours: 24,
    allowClientCancel: true,
    allowClientReschedule: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          minBookingLeadHours: data.minBookingLeadHours ?? 2,
          maxBookingDaysOut: data.maxBookingDaysOut ?? 100,
          cancelRescheduleWindowHours: data.cancelRescheduleWindowHours ?? 24,
          allowClientCancel: data.allowClientCancel ?? true,
          allowClientReschedule: data.allowClientReschedule ?? true,
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
      toast.success("Scheduling limits saved");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to save");
    }
    setSaving(false);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex h-[60px] flex-shrink-0 items-center gap-3 border-b border-black/[0.07] bg-white px-8">
        <Link
          href="/admin/settings"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-black/[0.07] text-[#a8a39c] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
        >
          <IconChevronLeft size={14} />
        </Link>
        <h1 className="text-[20px] font-semibold text-[#1b1814]">Scheduling Limits</h1>
      </div>

      <div className="flex-1 overflow-auto px-8 py-7 pb-20 md:pb-7">
        {loading ? (
          <div className="max-w-lg space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-[#f5f4f2]" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
            <div className="rounded-xl border border-[#e8e6e1] bg-white p-5 space-y-4">
              <p className="text-[12px] font-medium text-[#1a1814]">Booking Window</p>

              <Field label="Minimum lead time (hours)" hint="How many hours in advance clients must book">
                <NumberInput
                  value={form.minBookingLeadHours}
                  onChange={(v) => setForm((f) => ({ ...f, minBookingLeadHours: v }))}
                  min={0}
                  max={168}
                />
              </Field>

              <Field label="Maximum days out" hint="How far in advance clients can book (days)">
                <NumberInput
                  value={form.maxBookingDaysOut}
                  onChange={(v) => setForm((f) => ({ ...f, maxBookingDaysOut: v }))}
                  min={1}
                  max={365}
                />
              </Field>
            </div>

            <div className="rounded-xl border border-[#e8e6e1] bg-white p-5 space-y-4">
              <p className="text-[12px] font-medium text-[#1a1814]">Cancel &amp; Reschedule</p>

              <Field label="Cancel/reschedule window (hours)" hint="Clients cannot cancel or reschedule within this many hours">
                <NumberInput
                  value={form.cancelRescheduleWindowHours}
                  onChange={(v) => setForm((f) => ({ ...f, cancelRescheduleWindowHours: v }))}
                  min={0}
                  max={168}
                />
              </Field>

              <ToggleField
                label="Allow clients to cancel online"
                checked={form.allowClientCancel}
                onChange={(v) => setForm((f) => ({ ...f, allowClientCancel: v }))}
              />

              <ToggleField
                label="Allow clients to reschedule online"
                checked={form.allowClientReschedule}
                onChange={(v) => setForm((f) => ({ ...f, allowClientReschedule: v }))}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-[9px] bg-[#c9a96e] px-[18px] py-[9px] text-[13px] font-semibold text-[#1b1814] hover:opacity-85 transition-opacity disabled:opacity-60 border-none cursor-pointer"
            >
              {saving ? "Saving…" : "Save limits"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-0.5 block text-[11px] font-medium text-[#9a9890]">{label}</label>
      {hint && <p className="mb-1.5 text-[10px] text-[#b0aea8]">{hint}</p>}
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
    />
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#1a1814]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-[#C9A96E]" : "bg-[#e8e6e1]"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}
