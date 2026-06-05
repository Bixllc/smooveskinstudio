"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ServiceRow {
  name: string;
  quantity: number;
  totalRevenue: number;
  totalMinutes: number;
}

interface Props {
  month: number;
  year: number;
  summary: {
    totalAppointments: number;
    revenue: number;
    cancelled: number;
    noShows: number;
  };
  rows: ServiceRow[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function ReportsClient({ month, year, summary, rows }: Props) {
  const router = useRouter();

  function navigate(m: number, y: number) {
    router.push(`/admin/reports?month=${m}&year=${y}`);
  }

  function downloadCSV() {
    const headers = ["Service", "Quantity", "Total Revenue", "Hours"];
    const dataRows = rows.map((r) => [
      `"${r.name}"`,
      r.quantity,
      `"$${r.totalRevenue.toFixed(2)}"`,
      `"${(r.totalMinutes / 60).toFixed(1)}h"`,
    ]);
    const totalRow = [
      '"Total"',
      rows.reduce((s, r) => s + r.quantity, 0),
      `"$${rows.reduce((s, r) => s + r.totalRevenue, 0).toFixed(2)}"`,
      `"${(rows.reduce((s, r) => s + r.totalMinutes, 0) / 60).toFixed(1)}h"`,
    ];
    const csv = [headers.join(","), ...dataRows.map((r) => r.join(",")), totalRow.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${year}-${String(month).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
  const totalRev = rows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalHrs = rows.reduce((s, r) => s + r.totalMinutes, 0);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-[80px] flex-shrink-0 items-center gap-3 border-b border-black/[0.07] bg-white px-8">
        <h1 className="text-[24px] font-semibold text-[#1b1814]">Reports</h1>
        <div className="flex-1" />
        <select
          value={month}
          onChange={(e) => navigate(Number(e.target.value), year)}
          className="rounded-[9px] border border-black/[0.07] px-3 py-[7px] text-[13px] text-[#1b1814] outline-none focus:border-[#c9a96e] bg-white"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => navigate(month, Number(e.target.value))}
          className="rounded-[9px] border border-black/[0.07] px-3 py-[7px] text-[13px] text-[#1b1814] outline-none focus:border-[#c9a96e] bg-white"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center rounded-[9px] border border-black/[0.07] bg-white px-[18px] py-[9px] text-[13px] font-medium text-[#7a756e] hover:bg-[#f8f6f3] transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-8 pb-20 md:pb-8 space-y-[22px]">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <StatCard label="Total Appointments" value={String(summary.totalAppointments)} gold />
          <StatCard label="Revenue" value={`$${summary.revenue.toFixed(2)}`} gold />
          <StatCard label="Cancelled" value={String(summary.cancelled)} />
          <StatCard label="No-Shows" value={String(summary.noShows)} />
        </div>

        {/* Table */}
        <div className="rounded-[14px] border border-black/[0.07] bg-white overflow-hidden">
          {/* Header row */}
          <div className="grid bg-[#edeae5] border-b border-black/[0.07] px-6 py-[14px]" style={{ gridTemplateColumns: "1fr 80px 100px 80px" }}>
            {["Service", "Qty", "Revenue", "Hours"].map((h, i) => (
              <div key={h} className={`text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a8a39c] ${i > 0 ? "text-right" : ""}`}>{h}</div>
            ))}
          </div>
          {/* Data rows */}
          {rows.length === 0 ? (
            <div className="px-5 py-10 text-center text-[14px] text-[#a8a39c]">
              No appointments for {MONTHS[month - 1]} {year}
            </div>
          ) : (
            rows.map((row) => (
              <div key={row.name} className="grid px-6 py-[16px] border-b border-black/[0.07] last:border-0 hover:bg-[#f8f6f3] items-center" style={{ gridTemplateColumns: "1fr 80px 100px 80px" }}>
                <span className="text-[15px] font-medium text-[#1b1814] truncate pr-2">{row.name}</span>
                <span className="text-[14px] text-[#7a756e] text-right">{row.quantity}</span>
                <span className="text-[15px] font-medium text-[#b8892a] text-right">${row.totalRevenue.toFixed(2)}</span>
                <span className="text-[14px] text-[#7a756e] text-right">{(row.totalMinutes / 60).toFixed(1)}h</span>
              </div>
            ))
          )}
          {/* Total row */}
          {rows.length > 0 && (
            <div className="grid px-6 py-[16px] bg-[#edeae5] items-center" style={{ gridTemplateColumns: "1fr 80px 100px 80px" }}>
              <span className="text-[12px] font-semibold text-[#1b1814] uppercase tracking-[0.06em]">Total</span>
              <span className="text-[14px] font-semibold text-[#1b1814] text-right">{totalQty}</span>
              <span className="text-[15px] font-semibold text-[#b8892a] text-right">${totalRev.toFixed(2)}</span>
              <span className="text-[14px] font-semibold text-[#7a756e] text-right">{(totalHrs / 60).toFixed(1)}h</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="rounded-[14px] border border-black/[0.07] bg-white p-[18px_20px]">
      <p className="mb-[7px] text-[10.5px] font-medium uppercase tracking-[0.07em] text-[#a8a39c]">{label}</p>
      <p className={`text-[28px] font-semibold leading-none ${gold ? "text-[#b8892a]" : "text-[#1b1814]"}`}>{value}</p>
    </div>
  );
}
