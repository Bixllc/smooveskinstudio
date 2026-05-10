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
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

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
      <h3 className="mb-6 text-center text-xl font-semibold text-[var(--color-text)]">
        Select Date & Time
      </h3>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h4 className="mb-4 font-semibold text-[var(--color-text)]">
            Choose a Date
          </h4>
          <div className="border-t border-[var(--color-border)] pt-4">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={{ before: today }}
              className="mx-auto"
            />
          </div>
        </div>

        {/* Time slots */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h4 className="mb-4 font-semibold text-[var(--color-text)]">
            Choose a Time
          </h4>
          <div className="border-t border-[var(--color-border)] pt-4">
            {!selectedDate && (
              <p className="py-8 text-center text-sm text-[var(--color-text-light)]">
                Select a date to see available times
              </p>
            )}

            {loading && (
              <p className="py-8 text-center text-sm text-[var(--color-text-light)]">
                Loading available times...
              </p>
            )}

            {error && (
              <p className="py-8 text-center text-sm text-red-600">{error}</p>
            )}

            {selectedDate && !loading && !error && slots.length === 0 && (
              <p className="py-8 text-center text-sm text-[var(--color-text-light)]">
                No available times on this date.
              </p>
            )}

            {!loading && slots.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => onSelectSlot(slot)}
                    onMouseEnter={() => setHoveredSlot(slot)}
                    onMouseLeave={() => setHoveredSlot(null)}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      selectedSlot === slot
                        ? "bg-[var(--color-primary)] text-white shadow-md"
                        : hoveredSlot === slot
                          ? "bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]"
                          : "bg-[var(--color-background-light)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:bg-opacity-10 hover:text-[var(--color-primary)]"
                    }`}
                  >
                    {formatSlotTime(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedDate && slots.length > 0 && (
        <p className="mt-4 text-center text-xs text-[var(--color-text-light)]">
          Select a time slot to continue
        </p>
      )}
    </div>
  );
}
