"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  const label =
    i === 0
      ? "12:00 AM"
      : i < 12
      ? `${i}:00 AM`
      : i === 12
      ? "12:00 PM"
      : `${i - 12}:00 PM`;
  return { value: `${h}:00`, label };
});

interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  active: boolean;
  startTime: string;
  endTime: string;
}

export default function AvailabilityPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["availability"],
    queryFn: () =>
      fetch("/api/admin/availability").then((r) => r.json()),
  });

  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
    if (data) setSchedule(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      fetch("/api/admin/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      }),
    onSuccess: () => {
      toast.success("Availability saved");
      qc.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: () => toast.error("Failed to save"),
  });

  function updateDay(
    dayOfWeek: number,
    field: keyof DaySchedule,
    value: any
  ) {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      )
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Availability</span>
        <div className="flex-1" />
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || isLoading}
          className="flex h-[26px] items-center rounded-full bg-[#C9A96E] px-3 text-[11px] font-medium text-[#1a1814] disabled:opacity-60 hover:bg-[#b8954f] transition-colors"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4">
        <p className="mb-4 text-[12px] text-[#9a9890]">
          Set your weekly working hours. These control which time slots clients
          see when booking online.
        </p>

        {isLoading ? (
          <div className="max-w-xl space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-[#f5f4f2]"
              />
            ))}
          </div>
        ) : (
          <div className="max-w-xl space-y-2">
            {schedule.map((day) => (
              <div
                key={day.dayOfWeek}
                className="flex items-center gap-3 rounded-lg border border-[#e8e6e1] bg-white px-4 py-3"
              >
                <input
                  type="checkbox"
                  id={`day-${day.dayOfWeek}`}
                  checked={day.active}
                  onChange={(e) =>
                    updateDay(day.dayOfWeek, "active", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-[#e8e6e1] accent-[#C9A96E] cursor-pointer"
                />
                <label
                  htmlFor={`day-${day.dayOfWeek}`}
                  className="w-10 cursor-pointer text-[12px] font-medium text-[#1a1814]"
                >
                  {day.dayName}
                </label>

                {day.active ? (
                  <>
                    <select
                      value={day.startTime}
                      onChange={(e) =>
                        updateDay(day.dayOfWeek, "startTime", e.target.value)
                      }
                      className="rounded-lg border border-[#e8e6e1] px-2 py-1.5 text-[11px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
                    >
                      {HOURS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] text-[#9a9890]">to</span>
                    <select
                      value={day.endTime}
                      onChange={(e) =>
                        updateDay(day.dayOfWeek, "endTime", e.target.value)
                      }
                      className="rounded-lg border border-[#e8e6e1] px-2 py-1.5 text-[11px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
                    >
                      {HOURS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <span className="text-[11px] text-[#b0aea8]">Closed</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
