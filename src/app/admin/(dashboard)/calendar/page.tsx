"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  subWeeks,
  isSameDay,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { AppointmentDrawer } from "@/components/admin/appointment-drawer";

// 9 AM – 7 PM = 20 half-hour slots
const HOUR_START = 9;
const HOUR_END = 19;
const SLOTS = (HOUR_END - HOUR_START) * 2;
const SLOT_H = 36; // px per 30 min

function getCategoryStyle(name: string) {
  const n = name.toLowerCase();
  if (n.includes("brow"))
    return "bg-[#f0e8d4] text-[#7a5c1a] border-l-[#C9A96E]";
  if (n.includes("vajacial") || n.includes("mask") || n.includes("hydrojelly"))
    return "bg-[#d4e8d8] text-[#2a5c38] border-l-[#6ea07c]";
  return "bg-[#f0d4cf] text-[#7a2f22] border-l-[#c97c6e]";
}

export default function CalendarPage() {
  const [weekOf, setWeekOf] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [drawerBooking, setDrawerBooking] = useState<any>(null);

  const { data, refetch } = useQuery({
    queryKey: ["calendar", weekOf.toISOString()],
    queryFn: () =>
      fetch(`/api/admin/calendar?date=${weekOf.toISOString()}`).then((r) =>
        r.json()
      ),
  });

  const tz = data?.timezone ?? "America/Chicago";
  // Mon–Sat (6 days)
  const days = Array.from({ length: 6 }, (_, i) => addDays(weekOf, i));
  const today = new Date();

  function bookingsForDay(day: Date) {
    return (data?.bookings ?? []).filter((b: any) => {
      const local = toZonedTime(new Date(b.startTimeUtc), tz);
      return isSameDay(local, day);
    });
  }

  function topPx(b: any) {
    const local = toZonedTime(new Date(b.startTimeUtc), tz);
    const mins = (local.getHours() - HOUR_START) * 60 + local.getMinutes();
    return Math.max(0, (mins / 30) * SLOT_H);
  }

  function heightPx(b: any) {
    return Math.max(SLOT_H, (b.service.durationMinutes / 30) * SLOT_H);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-2 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Calendar</span>
        <div className="flex-1" />
        <button
          onClick={() => setWeekOf((w) => subWeeks(w, 1))}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#e8e6e1] text-[#9a9890] hover:border-[#C9A96E] hover:text-[#C9A96E]"
        >
          <IconChevronLeft size={14} />
        </button>
        <span className="text-[11px] font-medium text-[#1a1814]">
          {format(weekOf, "MMM d")} –{" "}
          {format(addDays(weekOf, 5), "MMM d, yyyy")}
        </span>
        <button
          onClick={() => setWeekOf((w) => addWeeks(w, 1))}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#e8e6e1] text-[#9a9890] hover:border-[#C9A96E] hover:text-[#C9A96E]"
        >
          <IconChevronRight size={14} />
        </button>
        <button
          onClick={() =>
            setWeekOf(startOfWeek(new Date(), { weekStartsOn: 1 }))
          }
          className="h-[26px] rounded-full border border-[#e8e6e1] px-2.5 text-[11px] text-[#9a9890] hover:border-[#C9A96E] hover:text-[#C9A96E]"
        >
          Today
        </button>
      </div>

      {/* Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Time column */}
        <div className="flex w-11 flex-shrink-0 flex-col border-r border-[#e8e6e1] bg-white">
          <div className="h-8 flex-shrink-0 border-b border-[#e8e6e1]" />
          {Array.from({ length: SLOTS }, (_, i) => {
            const hour = HOUR_START + Math.floor(i / 2);
            const isHour = i % 2 === 0;
            const label = isHour
              ? format(new Date(2000, 0, 1, hour), "h a")
              : "";
            return (
              <div
                key={i}
                className="flex flex-shrink-0 items-start justify-end pr-1.5 pt-0.5 text-[9px] text-[#b0aea8]"
                style={{ height: SLOT_H }}
              >
                {label}
              </div>
            );
          })}
        </div>

        {/* Day columns */}
        <div className="flex flex-1 overflow-x-auto overflow-y-auto">
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const dayBookings = bookingsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className="flex min-w-0 flex-1 flex-col border-r border-[#e8e6e1] last:border-r-0"
                style={{ minWidth: 80 }}
              >
                {/* Day header */}
                <div
                  className={`flex h-8 flex-shrink-0 items-center justify-center border-b border-[#e8e6e1] ${
                    isToday ? "bg-[#C9A96E08]" : "bg-white"
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium ${
                      isToday ? "text-[#C9A96E]" : "text-[#9a9890]"
                    }`}
                  >
                    {format(day, "EEE d")}
                  </span>
                </div>

                {/* Slot rows + events */}
                <div
                  className={`relative ${isToday ? "bg-[#C9A96E04]" : ""}`}
                  style={{ height: SLOTS * SLOT_H }}
                >
                  {Array.from({ length: SLOTS }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-[#e8e6e1]"
                      style={{ top: i * SLOT_H, height: SLOT_H }}
                    />
                  ))}

                  {dayBookings.map((b: any) => (
                    <button
                      key={b.id}
                      onClick={() => setDrawerBooking(b)}
                      className={`absolute left-0.5 right-0.5 overflow-hidden rounded border-l-2 px-1 py-0.5 text-left text-[9px] font-medium leading-tight ${getCategoryStyle(
                        b.service.category.name
                      )}`}
                      style={{
                        top: topPx(b),
                        height: Math.max(heightPx(b) - 2, 18),
                      }}
                    >
                      <div className="truncate">{b.customer.fullName}</div>
                      <div className="truncate opacity-75">
                        {b.service.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color legend */}
      <div className="flex flex-shrink-0 items-center gap-4 border-t border-[#e8e6e1] bg-white px-4 py-2">
        {[
          { color: "#c97c6e", label: "Body & face wax" },
          { color: "#C9A96E", label: "Brow services" },
          { color: "#6ea07c", label: "Vajacial & masks" },
        ].map((item) => (
          <span
            key={item.label}
            className="flex items-center gap-1.5 text-[10px] text-[#9a9890]"
          >
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>

      {/* Appointment drawer */}
      {drawerBooking && (
        <AppointmentDrawer
          booking={drawerBooking}
          timezone={tz}
          onClose={() => setDrawerBooking(null)}
          onAction={() => {
            refetch();
            setDrawerBooking(null);
          }}
        />
      )}
    </div>
  );
}
