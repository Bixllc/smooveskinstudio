"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useRouter } from "next/navigation";
import { IconPlus, IconChevronRight } from "@tabler/icons-react";

function getCategoryColors(name: string) {
  const n = name.toLowerCase();
  if (n.includes("brow")) return { dot: "bg-[#C9A96E]" };
  if (n.includes("vajacial") || n.includes("hydrojelly") || n.includes("mask")) return { dot: "bg-[#4ab87a]" };
  return { dot: "bg-[#e05c4a]" };
}

export function DashboardClient({ greeting, dateLabel, tz, clientSlug }: { greeting: string; dateLabel: string; tz: string; clientSlug: string }) {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetch("/api/admin/dashboard").then((r) => r.json()),
    refetchInterval: 60_000,
  });

  const todayCount = data?.todayBookings?.length ?? 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-[80px] flex-shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-8">
        <div>
          <p className="text-[26px] font-semibold text-[#1b1814]">{greeting}, Anisha</p>
        </div>
        <button
          onClick={() => router.push(`/${clientSlug}/book`)}
          className="inline-flex items-center gap-1.5 rounded-[9px] bg-[#c9a96e] px-[20px] py-[11px] text-[14px] font-semibold text-[#1b1814] transition-opacity hover:opacity-85 border-none cursor-pointer"
        >
          <IconPlus size={17} stroke={2.2} /> New booking
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 pb-20 md:pb-8">

        {/* Date + count */}
        <p className="mb-5 text-[13px] text-[#a8a39c]">
          {dateLabel} · {isLoading ? "…" : `${todayCount} appointment${todayCount !== 1 ? "s" : ""} today`}
        </p>

        {/* Metrics */}
        <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[110px] animate-pulse rounded-[14px] border border-black/[0.07] bg-white" />
            ))
          ) : (
            <>
              <MetricCard label="Today's revenue" value={`$${(data?.todayRevenue ?? 0).toFixed(0)}`} gold />
              <MetricCard label="Bookings this month" value={String(data?.monthBookingCount ?? 0)} />
              <MetricCard label="Cancellations (MTD)" value={String(data?.cancellations ?? 0)} />
              <MetricCard label="MTD revenue" value={`$${(data?.mtdRevenue ?? 0).toFixed(0)}`} gold />
            </>
          )}
        </div>

        {/* Up next */}
        {isLoading ? (
          <div className="mb-6 h-[96px] animate-pulse rounded-[14px] bg-[#d4bb8e]" />
        ) : data?.nextAppt ? (
          <UpNextCard appt={data.nextAppt} tz={tz} />
        ) : (
          <div className="mb-6 rounded-[14px] border border-black/[0.07] bg-white p-6 text-center">
            <p className="text-[15px] text-[#a8a39c]">No upcoming appointments — enjoy the break</p>
          </div>
        )}

        {/* Rest of today */}
        {!isLoading && (data?.todayBookings?.length ?? 0) > 0 && (
          <>
            <div className="mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a8a39c]">Rest of today</span>
            </div>
            <div className="overflow-hidden rounded-[14px] border border-black/[0.07] bg-white">
              {data.todayBookings.map((b: any) => {
                const colors = getCategoryColors(b.service.category?.name ?? "");
                const time = format(toZonedTime(new Date(b.startTimeUtc), tz), "h:mm a");
                return (
                  <div key={b.id} className="flex cursor-pointer items-center gap-4 border-b border-black/[0.07] px-6 py-5 last:border-0 transition-colors hover:bg-[#f8f6f3]">
                    <span className="min-w-[80px] text-[13px] tabular-nums text-[#7a756e]">{time}</span>
                    <span className={`h-2 w-2 flex-shrink-0 rounded-full ${colors.dot}`} />
                    <span className="flex-1 text-[15px] font-medium text-[#1b1814]">{b.customer.fullName}</span>
                    <span className="text-[13px] text-[#7a756e]">{b.service.name}</span>
                    <IconChevronRight size={15} stroke={2} className="text-[#a8a39c]" />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="rounded-[14px] border border-black/[0.07] bg-white p-6">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.07em] text-[#a8a39c]">{label}</p>
      <p className={`text-[36px] font-semibold leading-none ${gold ? "text-[#b8892a]" : "text-[#1b1814]"}`}>{value}</p>
    </div>
  );
}

function UpNextCard({ appt, tz }: { appt: any; tz: string }) {
  const local = toZonedTime(new Date(appt.startTimeUtc), tz);
  return (
    <div className="mb-6 flex items-center gap-5 rounded-[14px] bg-[#c9a96e] p-6">
      <div className="min-w-[68px] rounded-[10px] bg-[rgba(27,24,20,0.17)] px-[16px] py-[14px] text-center">
        <div className="text-[30px] font-bold leading-none text-[#1b1814]">{format(local, "h")}</div>
        <div className="mt-[3px] text-[11px] font-semibold tracking-[0.03em] text-[rgba(27,24,20,0.52)]">{format(local, ":mm a")}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[rgba(27,24,20,0.48)]">Up next</div>
        <div className="truncate text-[20px] font-semibold text-[#1b1814]">{appt.customer.fullName}</div>
        <div className="mt-1 truncate text-[14px] text-[rgba(27,24,20,0.58)]">{appt.service.name} · {appt.service.durationMinutes} min</div>
      </div>
      <div className="flex-shrink-0 rounded-[20px] bg-[rgba(27,24,20,0.13)] px-4 py-[6px] text-[13px] font-medium text-[#1b1814]">
        {appt.service.category?.name ?? ""}
      </div>
    </div>
  );
}
