"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  addWeeks,
  subWeeks,
  isSameDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  startOfDay,
  getDay,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconChevronDown,
} from "@tabler/icons-react";
import { AppointmentDrawer } from "@/components/admin/appointment-drawer";
import { BlockTimeModal } from "@/components/admin/block-time-modal";
import { AddAppointmentModal } from "@/components/admin/add-appointment-modal";

// 9 AM – 7 PM = 20 half-hour slots
const HOUR_START = 9;
const HOUR_END = 19;
const SLOTS = (HOUR_END - HOUR_START) * 2;
const SLOT_H = 36; // px per 30 min

type CalendarView = "day" | "week" | "month";

function getCategoryStyle(name: string) {
  const n = name.toLowerCase();
  if (n.includes("brow"))
    return "bg-[#f0e8d4] text-[#7a5c1a] border-l-[#C9A96E]";
  if (n.includes("vajacial") || n.includes("mask") || n.includes("hydrojelly"))
    return "bg-[#d4e8d8] text-[#2a5c38] border-l-[#6ea07c]";
  return "bg-[#f0d4cf] text-[#7a2f22] border-l-[#c97c6e]";
}

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("week");
  const [weekOf, setWeekOf] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [monthOf, setMonthOf] = useState(() => startOfMonth(new Date()));
  const [drawerBooking, setDrawerBooking] = useState<any>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // Fetch calendar data based on view
  const queryDate =
    view === "week"
      ? weekOf.toISOString()
      : view === "day"
      ? startOfWeek(selectedDay, { weekStartsOn: 1 }).toISOString()
      : startOfWeek(monthOf, { weekStartsOn: 1 }).toISOString();

  const { data, refetch } = useQuery({
    queryKey: ["calendar", queryDate, view, monthOf.toISOString()],
    queryFn: async () => {
      if (view === "month") {
        // Fetch all weeks overlapping this month
        const ms = startOfMonth(monthOf);
        const me = endOfMonth(monthOf);
        const startFetch = startOfWeek(ms, { weekStartsOn: 1 });
        const responses = await Promise.all(
          Array.from({ length: 6 }, (_, i) =>
            fetch(
              `/api/admin/calendar?date=${addWeeks(startFetch, i).toISOString()}`
            ).then((r) => r.json())
          )
        );
        const allBookings = responses.flatMap((r) => r.bookings ?? []);
        return { bookings: allBookings, timezone: responses[0]?.timezone };
      }
      return fetch(`/api/admin/calendar?date=${queryDate}`).then((r) =>
        r.json()
      );
    },
  });

  const tz = data?.timezone ?? "America/Chicago";
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

  // ── Navigation label ──────────────────────────────────────────────────────
  function navLabel() {
    if (view === "week")
      return `${format(weekOf, "MMM d")} – ${format(addDays(weekOf, 5), "MMM d, yyyy")}`;
    if (view === "day") return format(selectedDay, "EEEE, MMMM d, yyyy");
    return format(monthOf, "MMMM yyyy");
  }

  function goBack() {
    if (view === "week") setWeekOf((w) => subWeeks(w, 1));
    else if (view === "day") setSelectedDay((d) => subDays(d, 1));
    else setMonthOf((m) => subMonths(m, 1));
  }

  function goForward() {
    if (view === "week") setWeekOf((w) => addWeeks(w, 1));
    else if (view === "day") setSelectedDay((d) => addDays(d, 1));
    else setMonthOf((m) => addMonths(m, 1));
  }

  function goToday() {
    const now = new Date();
    setWeekOf(startOfWeek(now, { weekStartsOn: 1 }));
    setSelectedDay(startOfDay(now));
    setMonthOf(startOfMonth(now));
  }

  // ── Time grid (reused for day and week) ───────────────────────────────────
  function TimeGrid({ dayList }: { dayList: Date[] }) {
    return (
      <div className="flex flex-1 overflow-hidden">
        {/* Time column */}
        <div className="flex w-11 flex-shrink-0 flex-col border-r border-[#e8e6e1] bg-white">
          <div className="h-8 flex-shrink-0 border-b border-[#e8e6e1]" />
          {Array.from({ length: SLOTS }, (_, i) => {
            const hour = HOUR_START + Math.floor(i / 2);
            const isHour = i % 2 === 0;
            const label = isHour ? format(new Date(2000, 0, 1, hour), "h a") : "";
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
          {dayList.map((day) => {
            const isToday = isSameDay(day, today);
            const dayBookings = bookingsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className="flex min-w-0 flex-1 flex-col border-r border-[#e8e6e1] last:border-r-0"
                style={{ minWidth: dayList.length === 1 ? "auto" : 80 }}
              >
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
                      <div className="truncate opacity-75">{b.service.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Month grid ─────────────────────────────────────────────────────────────
  function MonthGrid() {
    const ms = startOfMonth(monthOf);
    const me = endOfMonth(monthOf);
    // Pad to full weeks
    const gridStart = startOfWeek(ms, { weekStartsOn: 1 });
    // Calculate grid end: ensure we cover the full month + padding
    const weeksNeeded = Math.ceil(
      (getDay(me) === 0 ? 7 : getDay(me) + (7 - getDay(ms)) + 1) / 7 + 4
    );
    const gridEnd = addDays(gridStart, 41); // always 6 rows
    const gridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    return (
      <div className="flex-1 overflow-auto p-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[10px] font-medium text-[#9a9890]"
            >
              {d}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-0.5">
          {gridDays.map((day) => {
            const isCurrentMonth = day.getMonth() === monthOf.getMonth();
            const isToday = isSameDay(day, today);
            const dayBookings = bookingsForDay(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDay(day);
                  setWeekOf(startOfWeek(day, { weekStartsOn: 1 }));
                  setView("day");
                }}
                className={`min-h-[72px] rounded-lg border p-1.5 text-left transition-colors ${
                  isToday
                    ? "border-[#C9A96E] bg-[#C9A96E08]"
                    : isCurrentMonth
                    ? "border-[#e8e6e1] bg-white hover:border-[#C9A96E]"
                    : "border-transparent bg-[#f5f4f2] opacity-50"
                }`}
              >
                <div
                  className={`mb-1 text-[11px] font-medium ${
                    isToday ? "text-[#C9A96E]" : "text-[#1a1814]"
                  }`}
                >
                  {format(day, "d")}
                </div>
                {dayBookings.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    {dayBookings.slice(0, 2).map((b: any) => (
                      <div
                        key={b.id}
                        className={`truncate rounded px-1 py-0.5 text-[9px] ${getCategoryStyle(
                          b.service.category.name
                        )}`}
                      >
                        {b.customer.fullName}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-[9px] text-[#9a9890]">
                        +{dayBookings.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-2 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Calendar</span>
        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex gap-0.5 rounded-lg border border-[#e8e6e1] bg-[#f5f4f2] p-0.5">
          {(["Day", "Week", "Month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v.toLowerCase() as CalendarView)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                view === v.toLowerCase()
                  ? "border border-[#e8e6e1] bg-white text-[#1a1814] shadow-sm"
                  : "text-[#9a9890] hover:text-[#1a1814]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Nav arrows */}
        <button
          onClick={goBack}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#e8e6e1] text-[#9a9890] hover:border-[#C9A96E] hover:text-[#C9A96E]"
        >
          <IconChevronLeft size={14} />
        </button>
        <span className="min-w-[140px] text-center text-[11px] font-medium text-[#1a1814]">
          {navLabel()}
        </span>
        <button
          onClick={goForward}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#e8e6e1] text-[#9a9890] hover:border-[#C9A96E] hover:text-[#C9A96E]"
        >
          <IconChevronRight size={14} />
        </button>
        <button
          onClick={goToday}
          className="h-[26px] rounded-full border border-[#e8e6e1] px-2.5 text-[11px] text-[#9a9890] hover:border-[#C9A96E] hover:text-[#C9A96E]"
        >
          Today
        </button>

        {/* Add dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu((v) => !v)}
            className="flex h-[26px] items-center gap-1 rounded-full bg-[#C9A96E] px-2.5 text-[11px] font-medium text-[#1a1814] hover:bg-[#b8954f] transition-colors"
          >
            <IconPlus size={12} />
            Add
            <IconChevronDown size={11} />
          </button>
          {showAddMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowAddMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-[#e8e6e1] bg-white shadow-lg">
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    setShowAppointmentModal(true);
                  }}
                  className="flex w-full items-center px-3 py-2 text-[12px] text-[#1a1814] hover:bg-[#faf9f7] rounded-t-xl"
                >
                  Appointment
                </button>
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    setShowBlockModal(true);
                  }}
                  className="flex w-full items-center px-3 py-2 text-[12px] text-[#1a1814] hover:bg-[#faf9f7] rounded-b-xl border-t border-[#e8e6e1]"
                >
                  Block Time
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {view === "week" && (
        <>
          <TimeGrid dayList={days} />
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
        </>
      )}

      {view === "day" && (
        <TimeGrid dayList={[selectedDay]} />
      )}

      {view === "month" && <MonthGrid />}

      {/* Modals */}
      {showBlockModal && (
        <BlockTimeModal
          onClose={() => setShowBlockModal(false)}
          onSuccess={() => refetch()}
        />
      )}
      {showAppointmentModal && (
        <AddAppointmentModal
          onClose={() => setShowAppointmentModal(false)}
          onSuccess={() => refetch()}
        />
      )}

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
