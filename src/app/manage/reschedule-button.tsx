"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface RescheduleButtonProps {
  token: string;
  clientId: string;
  serviceId: string;
  timezone: string;
}

export function RescheduleButton({ token, clientId, serviceId, timezone }: RescheduleButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchSlots(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlots([]);
    if (!date) return;
    setLoadingSlots(true);
    try {
      const res = await fetch("/api/bookings/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, serviceId, date }),
      });
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function formatSlot(utcIso: string) {
    const d = new Date(utcIso);
    return d.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  async function handleConfirm() {
    if (!selectedSlot || confirming) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "reschedule", newStartTimeUtc: selectedSlot }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setConfirming(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setConfirming(false);
    }
  }

  // Min date = today
  const today = new Date().toISOString().split("T")[0];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center rounded-xl border border-[#e8e6e1] py-3 text-[13px] font-medium text-[#6b6860] transition-colors hover:border-[#C9A96E] hover:text-[#1a1814]"
      >
        Reschedule Appointment
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e8e6e1] bg-white p-5">
      <p className="mb-1 text-[13px] font-semibold text-[#1a1814]">Pick a new date & time</p>
      <p className="mb-4 text-[12px] text-[#6b6860]">Select an available slot below to reschedule your appointment.</p>

      {/* Date picker */}
      <div className="mb-4">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#9a9890]">
          Date
        </label>
        <input
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => fetchSlots(e.target.value)}
          className="w-full rounded-xl border border-[#e8e6e1] px-3 py-2.5 text-[13px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
        />
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="mb-4">
          <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-[#9a9890]">
            Available Times
          </label>
          {loadingSlots && (
            <p className="text-[12px] text-[#9a9890]">Loading times…</p>
          )}
          {!loadingSlots && slots.length === 0 && (
            <p className="text-[12px] text-[#9a9890]">No times available on this date. Try another day.</p>
          )}
          {!loadingSlots && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-xl border py-2 text-[12px] font-medium transition-colors ${
                    selectedSlot === slot
                      ? "border-[#1a1814] bg-[#1a1814] text-white"
                      : "border-[#e8e6e1] text-[#1a1814] hover:border-[#C9A96E]"
                  }`}
                >
                  {formatSlot(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="mb-3 text-[12px] text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => { setOpen(false); setSelectedDate(""); setSlots([]); setSelectedSlot(null); setError(null); }}
          disabled={confirming}
          className="flex-1 rounded-xl border border-[#e8e6e1] bg-white py-2.5 text-[13px] font-medium text-[#6b6860] transition-colors hover:border-[#1a1814] hover:text-[#1a1814]"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedSlot || confirming}
          className="flex-1 rounded-xl bg-[#C9A96E] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#b8954f] disabled:opacity-40"
        >
          {confirming ? "Rescheduling…" : "Confirm New Time"}
        </button>
      </div>
    </div>
  );
}
