"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { IconX } from "@tabler/icons-react";

interface BlockTimeModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string; // YYYY-MM-DD
}

export function BlockTimeModal({ onClose, onSuccess, defaultDate }: BlockTimeModalProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(defaultDate ?? today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blocked-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime, endTime, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to block time");
      } else {
        toast.success("Time blocked");
        onSuccess();
        onClose();
      }
    } catch {
      toast.error("Failed to block time");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#e8e6e1] bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[#e8e6e1] px-5 py-3.5">
          <p className="text-[13px] font-semibold text-[#1a1814]">Block Time</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#9a9890] hover:text-[#1a1814]"
          >
            <IconX size={14} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <ModalField label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
            />
          </ModalField>
          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Start time">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
              />
            </ModalField>
            <ModalField label="End time">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
              />
            </ModalField>
          </div>
          <ModalField label="Reason (optional)">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Lunch break, Personal time…"
              className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
            />
          </ModalField>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#e8e6e1] py-2 text-[12px] text-[#6b6860] hover:border-[#C9A96E] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-[#C9A96E] py-2 text-[12px] font-medium text-[#1a1814] hover:bg-[#b8954f] transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Block Time"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-[#9a9890]">{label}</label>
      {children}
    </div>
  );
}
