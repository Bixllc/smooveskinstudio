"use client";

export function DashboardClient({
  greeting,
  dateLabel,
  tz,
}: {
  greeting: string;
  dateLabel: string;
  tz: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex h-11 flex-shrink-0 items-center border-b border-[#e8e6e1] bg-white px-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#1a1814]">
            {greeting}, Anisha ✨
          </p>
          <p className="text-xs text-[#9a9890]">{dateLabel}</p>
        </div>
      </div>
      <div className="flex-1 p-4 text-sm text-[#9a9890]">Loading dashboard…</div>
    </div>
  );
}
