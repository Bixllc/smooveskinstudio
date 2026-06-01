"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconPlus } from "@tabler/icons-react";
import { SkeletonCard } from "@/components/admin/skeleton-card";

function getCategoryColors(name: string) {
  const n = name.toLowerCase();
  if (n.includes("brow"))
    return {
      dot: "bg-[#C9A96E]",
      badge: "bg-[#f0e8d4] text-[#7a5c1a]",
    };
  if (n.includes("vajacial") || n.includes("hydrojelly") || n.includes("mask"))
    return {
      dot: "bg-[#6ea07c]",
      badge: "bg-[#d4e8d8] text-[#2a5c38]",
    };
  return {
    dot: "bg-[#c97c6e]",
    badge: "bg-[#f0d4cf] text-[#7a2f22]",
  };
}

export function DashboardClient({
  greeting,
  dateLabel,
  tz,
}: {
  greeting: string;
  dateLabel: string;
  tz: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      fetch("/api/admin/dashboard").then((r) => r.json()),
    refetchInterval: 60_000,
  });

  const todayCount = data?.todayBookings?.length ?? 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center border-b border-[#e8e6e1] bg-white px-4 gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#1a1814]">
            {greeting}, Anisha ✨
          </p>
          <p className="text-xs text-[#9a9890]">
            {dateLabel} ·{" "}
            {isLoading
              ? "…"
              : `${todayCount} appointment${todayCount !== 1 ? "s" : ""} today`}
          </p>
        </div>
        <button className="flex h-[26px] items-center gap-1 rounded-full bg-[#C9A96E] px-2.5 text-[11px] font-medium text-[#1a1814]">
          <IconPlus size={11} /> New booking
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3.5 space-y-3 pb-20 md:pb-3.5">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            <>
              <StatCard
                label="Today's revenue"
                value={`$${(data?.todayRevenue ?? 0).toFixed(0)}`}
                gold
              />
              <StatCard
                label="Bookings this month"
                value={String(data?.monthBookingCount ?? 0)}
              />
              <StatCard
                label="Cancellations (MTD)"
                value={String(data?.cancellations ?? 0)}
              />
              <StatCard
                label="MTD revenue"
                value={`$${(data?.mtdRevenue ?? 0).toFixed(0)}`}
                gold
              />
            </>
          )}
        </div>

        {/* Next appointment */}
        {isLoading ? (
          <SkeletonCard tall />
        ) : data?.nextAppt ? (
          <NextApptCard appt={data.nextAppt} tz={tz} />
        ) : (
          <div className="rounded-lg border border-[#e8e6e1] bg-white p-4 text-center">
            <p className="text-sm text-[#9a9890]">
              No upcoming appointments — enjoy the break ✨
            </p>
          </div>
        )}

        {/* Today's schedule */}
        {!isLoading && (data?.todayBookings?.length ?? 0) > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[#9a9890]">
              Rest of today
            </p>
            <div className="space-y-1">
              {data.todayBookings.map((b: any) => {
                const colors = getCategoryColors(b.service.category.name);
                const time = format(
                  toZonedTime(new Date(b.startTimeUtc), tz),
                  "h:mm a"
                );
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-2 rounded-lg border border-[#e8e6e1] bg-white px-3 py-1.5"
                  >
                    <span
                      className={`h-[7px] w-[7px] flex-shrink-0 rounded-full ${colors.dot}`}
                    />
                    <span className="w-[54px] flex-shrink-0 text-[11px] text-[#9a9890]">
                      {time}
                    </span>
                    <span className="flex-1 text-[12px] font-medium text-[#1a1814]">
                      {b.customer.fullName}
                    </span>
                    <span className="text-[11px] text-[#9a9890]">
                      {b.service.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  gold,
}: {
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#e8e6e1] bg-white p-3">
      <p className="mb-1 text-[11px] text-[#9a9890]">{label}</p>
      <p
        className={`text-xl font-medium leading-none ${
          gold ? "text-[#C9A96E]" : "text-[#1a1814]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function NextApptCard({ appt, tz }: { appt: any; tz: string }) {
  const local = toZonedTime(new Date(appt.startTimeUtc), tz);
  const colors = getCategoryColors(appt.service.category.name);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#e8e6e1] bg-white p-3">
      <div className="flex min-w-[48px] flex-col items-center justify-center rounded-lg border border-[#C9A96E44] bg-[#C9A96E18] py-1.5 px-2">
        <span className="text-base font-medium leading-none text-[#C9A96E]">
          {format(local, "h")}
        </span>
        <span className="text-[10px] text-[#C9A96E99]">
          {format(local, ":mm a")}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1a1814] truncate">
          {appt.customer.fullName}
        </p>
        <p className="text-[11px] text-[#9a9890] truncate">
          {appt.service.name} · {appt.service.durationMinutes} min
        </p>
      </div>
      <span
        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.badge}`}
      >
        {appt.service.category.name}
      </span>
    </div>
  );
}
