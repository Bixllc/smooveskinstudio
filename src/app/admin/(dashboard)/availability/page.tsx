"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { BlockTimeModal } from "@/components/admin/block-time-modal";

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
  const [showBlockModal, setShowBlockModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["availability"],
    queryFn: () =>
      fetch("/api/admin/availability").then((r) => r.json()),
  });

  const { data: blockedTimesData, refetch: refetchBlocked } = useQuery({
    queryKey: ["blocked-times"],
    queryFn: () => fetch("/api/admin/blocked-times").then((r) => r.json()),
  });

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetch("/api/admin/settings").then((r) => r.json()),
  });

  const timezone = settingsData?.timezone ?? "America/Chicago";

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
      <div className="flex h-[80px] flex-shrink-0 items-center gap-3 border-b border-black/[0.07] bg-white px-8">
        <h1 className="text-[24px] font-semibold text-[#1b1814]">Availability</h1>
        <div className="flex-1" />
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || isLoading}
          className="inline-flex items-center rounded-[9px] bg-[#c9a96e] px-[18px] py-[9px] text-[13px] font-semibold text-[#1b1814] hover:opacity-85 transition-opacity disabled:opacity-50 border-none cursor-pointer"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-8 pb-20 md:pb-8">
        <p className="mb-5 text-[13px] text-[#7a756e]">
          Set your weekly working hours. These control which time slots clients
          see when booking online.
        </p>

        {isLoading ? (
          <div className="max-w-xl space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-[#f5f4f2]"
              />
            ))}
          </div>
        ) : (
          <div className="max-w-xl space-y-3">
            {schedule.map((day) => (
              <div
                key={day.dayOfWeek}
                className="flex items-center gap-3 rounded-[10px] border border-black/[0.07] bg-white px-4 py-3"
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

        {/* Blocked Times */}
        <div className="mt-8 max-w-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[15px] font-semibold text-[#1b1814]">Blocked Times</p>
            <button
              onClick={() => setShowBlockModal(true)}
              className="inline-flex items-center gap-1.5 rounded-[9px] border border-black/[0.12] bg-white px-3 py-[7px] text-[12px] font-medium text-[#7a756e] hover:bg-[#f8f6f3] transition-colors cursor-pointer"
            >
              <IconPlus size={13} />
              Block Time
            </button>
          </div>

          {!blockedTimesData || blockedTimesData.length === 0 ? (
            <p className="text-[11px] text-[#9a9890]">No blocked times.</p>
          ) : (
            <div className="space-y-1.5">
              {(blockedTimesData as any[]).map((bt: any) => {
                const localStart = toZonedTime(new Date(bt.startTimeUtc), timezone);
                const localEnd = toZonedTime(new Date(bt.endTimeUtc), timezone);
                return (
                  <div
                    key={bt.id}
                    className="flex items-center justify-between rounded-lg border border-[#e8e6e1] bg-white px-4 py-2.5"
                  >
                    <div>
                      <p className="text-[12px] font-medium text-[#1a1814]">
                        {format(localStart, "EEE, MMM d, yyyy")}
                      </p>
                      <p className="text-[11px] text-[#9a9890]">
                        {format(localStart, "h:mm a")} – {format(localEnd, "h:mm a")}
                        {bt.reason ? ` · ${bt.reason}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const res = await fetch(`/api/admin/blocked-times/${bt.id}`, {
                          method: "DELETE",
                        });
                        if (res.ok) {
                          toast.success("Blocked time removed");
                          refetchBlocked();
                        } else {
                          toast.error("Failed to delete");
                        }
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#9a9890] hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showBlockModal && (
        <BlockTimeModal
          onClose={() => setShowBlockModal(false)}
          onSuccess={() => refetchBlocked()}
        />
      )}
    </div>
  );
}
