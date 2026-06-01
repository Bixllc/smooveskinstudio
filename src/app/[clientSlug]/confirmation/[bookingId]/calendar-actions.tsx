"use client";

import { useState } from "react";

export function CalendarActions({
  gcalUrl,
  icsContent,
  serviceName,
}: {
  gcalUrl: string;
  icsContent: string;
  serviceName: string;
}) {
  const [open, setOpen] = useState(false);

  function downloadIcs() {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${serviceName.replace(/\s+/g, "-").toLowerCase()}-smoove.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  return (
    <div className="relative mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8e6e1] bg-white py-3 text-[13px] font-medium text-[#1a1814] transition-colors hover:border-[#C9A96E] hover:bg-[#faf9f7]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Add to Calendar
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-[#e8e6e1] bg-white shadow-lg">
          <a
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[13px] text-[#1a1814] transition-colors hover:bg-[#faf9f7]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" fill="#4285F4" />
              <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="1.5" />
              <text x="12" y="19" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">G</text>
            </svg>
            Google Calendar
          </a>
          <button
            onClick={downloadIcs}
            className="flex w-full items-center gap-3 px-4 py-3 text-[13px] text-[#1a1814] transition-colors hover:bg-[#faf9f7]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" fill="#1a1814" />
              <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="1.5" />
            </svg>
            Apple Calendar / iCal
          </button>
        </div>
      )}
    </div>
  );
}
