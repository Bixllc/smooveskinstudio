"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DAYS_OPTIONS = [30, 90, 365] as const;
type DaysOption = (typeof DAYS_OPTIONS)[number];

const SERVICE_COLORS = [
  "#C9A96E",
  "#c97c6e",
  "#6ea07c",
  "#9a9890",
  "#d4b4a0",
  "#8e9a6e",
  "#b4a0d4",
  "#a0b4d4",
];

export default function AnalyticsPage() {
  const [days, setDays] = useState<DaysOption>(30);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", days],
    queryFn: () =>
      fetch(`/api/admin/analytics?days=${days}`).then((r) => r.json()),
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Analytics</span>
        <div className="flex-1" />
        <div className="flex gap-0.5 rounded-lg border border-[#e8e6e1] bg-[#f5f4f2] p-0.5">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                days === d
                  ? "border border-[#e8e6e1] bg-white text-[#1a1814] shadow-sm"
                  : "text-[#9a9890] hover:text-[#1a1814]"
              }`}
            >
              {d === 365 ? "1 year" : `${d} days`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl bg-[#f5f4f2]"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricCard
                label="No-show rate"
                value={`${data?.noShowRate ?? 0}%`}
              />
              <MetricCard
                label="Cancellation rate"
                value={`${data?.cancellationRate ?? 0}%`}
              />
              <MetricCard
                label="New clients"
                value={String(data?.newClients ?? 0)}
                gold
              />
              <MetricCard
                label="Returning clients"
                value={String(data?.returningClients ?? 0)}
                gold
              />
            </div>

            {/* Revenue by month */}
            <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
              <p className="mb-4 text-[12px] font-medium text-[#1a1814]">
                Revenue by month
              </p>
              {(data?.revenueByMonth?.length ?? 0) === 0 ? (
                <p className="py-8 text-center text-[11px] text-[#9a9890]">
                  No data for this period
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data?.revenueByMonth ?? []}>
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#9a9890" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9a9890" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      formatter={(v: unknown) => [
                        `$${Number(v).toFixed(0)}`,
                        "Revenue",
                      ]}
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: "0.5px solid #e8e6e1",
                      }}
                    />
                    <Bar dataKey="revenue" fill="#C9A96E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top services + busiest days */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Top services */}
              <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
                <p className="mb-3 text-[12px] font-medium text-[#1a1814]">
                  Top services
                </p>
                {(data?.topServices?.length ?? 0) === 0 ? (
                  <p className="text-[11px] text-[#9a9890]">No data</p>
                ) : (
                  <div className="space-y-2">
                    {data.topServices.map((s: any, i: number) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{
                            background:
                              SERVICE_COLORS[i % SERVICE_COLORS.length],
                          }}
                        />
                        <span className="flex-1 truncate text-[11px] text-[#1a1814]">
                          {s.name}
                        </span>
                        <span className="text-[11px] font-medium text-[#C9A96E]">
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Busiest days */}
              <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
                <p className="mb-3 text-[12px] font-medium text-[#1a1814]">
                  Busiest days
                </p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={data?.byDay ?? []}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "#9a9890" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9a9890" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: "0.5px solid #e8e6e1",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#6ea07c"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({
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
      <p className="mb-1 text-[10px] text-[#9a9890]">{label}</p>
      <p
        className={`text-xl font-medium ${
          gold ? "text-[#C9A96E]" : "text-[#1a1814]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
