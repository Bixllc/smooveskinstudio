"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { IconX } from "@tabler/icons-react";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  category: { name: string };
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddAppointmentModal({ onClose, onSuccess }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");

  const [clientId, setClientId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/me").then((r) => r.json()),
      fetch("/api/admin/services").then((r) => r.json()),
    ]).then(([me, svcs]) => {
      setClientId(me.clientId);
      setServices(svcs);
      if (svcs.length > 0) setServiceId(svcs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!clientId || !serviceId || !date) return;
    setLoadingSlots(true);
    setSelectedSlot("");
    fetch("/api/bookings/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, serviceId, date }),
    })
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [clientId, serviceId, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    setSaving(true);
    try {
      // Create booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          serviceId,
          startTimeUtc: selectedSlot,
          customer: { fullName, email, phone, notes },
        }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) {
        toast.error(bookingData.error ?? "Failed to create booking");
        return;
      }

      // Confirm the booking (admin-added = skip payment)
      const confirmRes = await fetch(`/api/admin/bookings/${bookingData.bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      if (!confirmRes.ok) {
        toast.error("Booking created but could not confirm — check bookings");
      } else {
        toast.success("Appointment added");
        onSuccess();
        onClose();
      }
    } catch {
      toast.error("Failed to create appointment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border border-[#e8e6e1] bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[#e8e6e1] px-5 py-3.5">
          <p className="text-[13px] font-semibold text-[#1a1814]">Add Appointment</p>
          <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-full text-[#9a9890] hover:text-[#1a1814]">
            <IconX size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <MField label="Service">
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min)
                </option>
              ))}
            </select>
          </MField>

          <MField label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
            />
          </MField>

          <MField label="Time">
            {loadingSlots ? (
              <div className="text-[11px] text-[#9a9890]">Loading slots…</div>
            ) : slots.length === 0 ? (
              <div className="text-[11px] text-[#9a9890]">No available slots for this date</div>
            ) : (
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                required
                className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
              >
                <option value="">Select a time…</option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {format(new Date(slot), "h:mm a")}
                  </option>
                ))}
              </select>
            )}
          </MField>

          <div className="border-t border-[#e8e6e1] pt-3">
            <p className="mb-2 text-[11px] font-medium text-[#9a9890]">Customer Info</p>
          </div>

          <MField label="Full name">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
            />
          </MField>

          <MField label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
            />
          </MField>

          <MField label="Phone">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
            />
          </MField>

          <MField label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
            />
          </MField>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-[#e8e6e1] py-2 text-[12px] text-[#6b6860] hover:border-[#C9A96E] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || !selectedSlot} className="flex-1 rounded-lg bg-[#C9A96E] py-2 text-[12px] font-medium text-[#1a1814] hover:bg-[#b8954f] transition-colors disabled:opacity-60">
              {saving ? "Adding…" : "Add Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-[#9a9890]">{label}</label>
      {children}
    </div>
  );
}
