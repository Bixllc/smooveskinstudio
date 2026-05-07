"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import "react-day-picker/style.css";

interface DateTimeStepProps {
  clientId: string;
  serviceId: string;
  timezone: string;
  selectedSlot: string | null;
  onSelectSlot: (slotUtc: string) => void;
}

export function DateTimeStep({
  clientId,
  serviceId,
  timezone,
  selectedSlot,
  onSelectSlot,
}: DateTimeStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();

  async function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    setSelectedDate(date);
    setSlots([]);
    setError(null);
    setLoading(true);

    const dateStr = format(date, "yyyy-MM-dd");

    try {
      const res = await fetch("/api/bookings/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, serviceId, date: dateStr }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load time slots.");
        setLoading(false);
        return;
      }

      setSlots(data.slots ?? []);
    } catch {
      setError("Failed to load time slots.");
    } finally {
      setLoading(false);
    }
  }

  function formatSlotTime(slotUtc: string) {
    const zonedDate = toZonedTime(new Date(slotUtc), timezone);
    return format(zonedDate, "h:mm a");
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium text-[var(--color-text)]">
        Select a Date & Time
      </h3>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={{ before: today }}
          className="mx-auto"
        />
      </div>

      {selectedDate && (
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-medium text-[var(--color-text)]">
            Available times for {format(selectedDate, "MMMM d, yyyy")}
          </h4>

          {loading && (
            <p className="text-sm text-[var(--color-text-light)]">
              Loading available times...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && slots.length === 0 && (
            <p className="text-sm text-[var(--color-text-light)]">
              No available times on this date. Please select another date.
            </p>
          )}

          {!loading && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => onSelectSlot(slot)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    selectedSlot === slot
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  {formatSlotTime(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
