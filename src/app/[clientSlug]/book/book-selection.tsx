"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfToday,
  isSameDay,
  isBefore,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

declare global {
  interface Window {
    Square?: any;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  services: Service[];
}

interface BusinessSettings {
  phone: string | null;
  address: string | null;
  timezone: string;
  cancellationPolicy: string | null;
  latePolicy: string | null;
  noShowPolicy: string | null;
  depositPolicy: string | null;
}

interface BookSelectionProps {
  clientSlug: string;
  clientId: string;
  categories: Category[];
  businessSettings: BusinessSettings;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
}

type FieldType = "text" | "textarea" | "checkbox" | "select" | "date" | "signature";

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface ServiceForm {
  id: string;
  name: string;
  description: string | null;
  type: string;
  fields: FormField[];
  required: boolean;
}

// formAnswers: { formTemplateId → { fieldId → value } }
type FormAnswers = Record<string, Record<string, string | boolean>>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hr`;
  }
  return `${minutes} min`;
}

function formatSlotTime(slotUtc: string, timezone: string): string {
  const zoned = toZonedTime(new Date(slotUtc), timezone);
  return format(zoned, "h:mm a");
}

function isFormComplete(form: ServiceForm, answers: Record<string, string | boolean> = {}): boolean {
  for (const field of form.fields) {
    if (!field.required) continue;
    const val = answers[field.id];
    if (field.type === "checkbox" && val !== true) return false;
    if (field.type === "signature" && (!val || String(val).trim() === "")) return false;
    if (field.type !== "checkbox" && field.type !== "signature") {
      if (val === undefined || val === null || String(val).trim() === "") return false;
    }
  }
  // If form has no fields but is required, it's complete (no fields to fill)
  return true;
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

const STEPS = ["Service", "Date & Time", "Your Info", "Payment"];

function StepIndicator({
  current,
  onGoTo,
}: {
  current: 1 | 2 | 3 | 4;
  onGoTo: (n: 1 | 2 | 3 | 4) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4;
        const done = current > n;
        const active = current === n;
        return (
          <div key={label} className="flex items-center">
            <button
              onClick={() => done && onGoTo(n)}
              disabled={!done}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-2 transition-colors sm:gap-2 sm:px-3 ${
                done ? "cursor-pointer hover:bg-[#faf7f2]" : "cursor-default"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                  done
                    ? "bg-[#C9A96E] text-[#1a1814]"
                    : active
                    ? "border-2 border-[#C9A96E] bg-white text-[#1a1814]"
                    : "bg-[#e8e6e1] text-[#9a9890]"
                }`}
              >
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span
                className={`hidden text-[11px] font-medium sm:inline sm:text-[12px] ${
                  active ? "text-[#1a1814]" : done ? "text-[#C9A96E]" : "text-[#9a9890]"
                }`}
              >
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-3 sm:w-6 ${current > n ? "bg-[#C9A96E]" : "bg-[#e8e6e1]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Calendar Widget ──────────────────────────────────────────────────────────

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarWidget({ selectedDate, onSelect }: { selectedDate: Date | null; onSelect: (d: Date) => void }) {
  const today = startOfToday();
  const [viewMonth, setViewMonth] = useState(today);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth)),
    end: endOfWeek(endOfMonth(viewMonth)),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          disabled={isSameMonth(viewMonth, today)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e6e1] bg-white text-[#9a9890] transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span className="text-[14px] font-semibold text-[#1a1814]">{format(viewMonth, "MMMM yyyy")}</span>
        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e6e1] bg-white text-[#9a9890] transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7">
        {DOW.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#9a9890]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const isPast = isBefore(day, today);
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isTodayDay = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => !isPast && onSelect(day)}
              disabled={isPast}
              className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium transition-all
                ${isPast ? "cursor-not-allowed text-[#d0cec9]" : ""}
                ${!isPast && !isSelected && isCurrentMonth ? "text-[#1a1814] hover:bg-[#C9A96E] hover:text-white" : ""}
                ${!isCurrentMonth && !isPast ? "text-[#c0bdb8]" : ""}
                ${isSelected ? "bg-[#C9A96E] text-white shadow-sm" : ""}
              `}
            >
              {format(day, "d")}
              {isTodayDay && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#C9A96E]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  step, service, slot, timezone, slots, slotsLoading, selectedDate, onGoTo, onSelectSlot,
}: {
  step: 1 | 2 | 3 | 4;
  service: Service | null;
  slot: string | null;
  timezone: string;
  slots: string[];
  slotsLoading: boolean;
  selectedDate: Date | null;
  onGoTo: (n: 1 | 2 | 3 | 4) => void;
  onSelectSlot: (s: string) => void;
}) {
  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[#e8e6e1] bg-white p-5 shadow-sm">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9a9890]">Your Booking</p>
        <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#e8e6e1] pb-3">
          <div>
            <p className="text-[11px] text-[#9a9890]">Service</p>
            {service ? <p className="text-[13px] font-medium text-[#1a1814]">{service.name}</p> : <p className="text-[13px] italic text-[#c0bdb8]">Not selected</p>}
          </div>
          {service && step > 1 && <button onClick={() => onGoTo(1)} className="shrink-0 text-[11px] font-medium text-[#C9A96E] underline hover:text-[#b8954f]">Change</button>}
        </div>
        <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#e8e6e1] py-3">
          <div>
            <p className="text-[11px] text-[#9a9890]">Date & Time</p>
            {slot ? (
              <>
                <p className="text-[13px] font-medium text-[#1a1814]">{format(toZonedTime(new Date(slot), timezone), "EEEE, MMM d")}</p>
                <p className="text-[12px] text-[#6b6860]">{formatSlotTime(slot, timezone)}</p>
              </>
            ) : <p className="text-[13px] italic text-[#c0bdb8]">Not selected</p>}
          </div>
          {slot && step > 2 && <button onClick={() => onGoTo(2)} className="shrink-0 text-[11px] font-medium text-[#C9A96E] underline hover:text-[#b8954f]">Change</button>}
        </div>
        {service && (
          <div className="flex items-baseline justify-between pt-3">
            <p className="text-[12px] text-[#9a9890]">{formatDuration(service.durationMinutes)}</p>
            <p className="text-xl font-bold text-[#1a1814]">${service.price.toFixed(2)}</p>
          </div>
        )}
      </div>

      {step === 2 && selectedDate && (
        <div className="rounded-2xl border border-[#e8e6e1] bg-white p-5 shadow-sm">
          <p className="mb-1 text-[12px] font-semibold text-[#1a1814]">{format(selectedDate, "EEEE, MMMM d")}</p>
          <p className="mb-4 text-[11px] text-[#9a9890]">Available times</p>
          {slotsLoading && <div className="flex h-24 items-center justify-center"><p className="text-[12px] text-[#9a9890]">Loading…</p></div>}
          {!slotsLoading && slots.length === 0 && (
            <div className="flex h-24 flex-col items-center justify-center rounded-xl bg-[#f9f8f6]">
              <p className="text-[12px] font-medium text-[#1a1814]">No availability</p>
              <p className="mt-0.5 text-[11px] text-[#9a9890]">Try another date</p>
            </div>
          )}
          {!slotsLoading && slots.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((s) => (
                <button key={s} onClick={() => onSelectSlot(s)} className="rounded-xl border border-[#e8e6e1] bg-white py-2 text-[12px] font-medium text-[#1a1814] transition-all hover:border-[#C9A96E] hover:bg-[#C9A96E] hover:text-white">
                  {formatSlotTime(s, timezone)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

// ─── Step 1 — Service Selection ───────────────────────────────────────────────

function Step1Service({ categories, onSelect }: { categories: Category[]; onSelect: (s: Service) => void }) {
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? "");
  const currentServices = categories.find((c) => c.id === activeCat)?.services ?? [];

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-[#1a1814]">Select your service</h2>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${activeCat === cat.id ? "bg-[#C9A96E] text-white" : "bg-[#f5f4f2] text-[#6b6860] hover:bg-[#C9A96E] hover:text-white"}`}>
            {cat.name}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {currentServices.map((service) => (
          <button key={service.id} onClick={() => onSelect(service)}
            className="group flex flex-col items-start rounded-2xl border border-[#e8e6e1] bg-white p-5 text-left transition-all hover:border-[#C9A96E] hover:shadow-md active:scale-[0.99]">
            <div className="flex w-full items-start justify-between gap-2">
              <p className="text-[14px] font-semibold text-[#1a1814]">{service.name}</p>
              <span className="shrink-0 text-[14px] font-bold text-[#1a1814]">${service.price.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-[12px] text-[#9a9890]">{formatDuration(service.durationMinutes)}</p>
            {service.description && <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#9a9890]">{service.description}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2 — Calendar ────────────────────────────────────────────────────────

function Step2Calendar({ selectedDate, onDateSelect, slots, slotsLoading, timezone, onSelectSlot }: {
  selectedDate: Date | null; onDateSelect: (d: Date) => void; slots: string[];
  slotsLoading: boolean; timezone: string; onSelectSlot: (s: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-[#1a1814]">Pick your date & time</h2>
      <p className="mb-5 text-[13px] text-[#9a9890]">Select a date — available times will appear on the right</p>
      <CalendarWidget selectedDate={selectedDate} onSelect={onDateSelect} />
      {selectedDate && (
        <div className="mt-6 lg:hidden">
          <p className="mb-1 text-[13px] font-semibold text-[#1a1814]">{format(selectedDate, "EEEE, MMMM d")}</p>
          <p className="mb-3 text-[11px] text-[#9a9890]">Available times</p>
          {slotsLoading && <div className="flex h-20 items-center justify-center rounded-xl bg-[#f9f8f6]"><p className="text-[12px] text-[#9a9890]">Loading…</p></div>}
          {!slotsLoading && slots.length === 0 && (
            <div className="flex h-20 flex-col items-center justify-center rounded-xl bg-[#f9f8f6]">
              <p className="text-[12px] font-medium text-[#1a1814]">No availability</p>
              <p className="mt-0.5 text-[11px] text-[#9a9890]">Try another date</p>
            </div>
          )}
          {!slotsLoading && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button key={s} onClick={() => onSelectSlot(s)}
                  className="rounded-xl border border-[#e8e6e1] bg-white py-2.5 text-[13px] font-medium text-[#1a1814] transition-all hover:border-[#C9A96E] hover:bg-[#C9A96E] hover:text-white">
                  {formatSlotTime(s, timezone)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dynamic Form Accordion ───────────────────────────────────────────────────

function DynamicFormAccordion({
  form,
  answers,
  onUpdateAnswers,
  showError,
}: {
  form: ServiceForm;
  answers: Record<string, string | boolean>;
  onUpdateAnswers: (fieldId: string, value: string | boolean) => void;
  showError: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [signatureTyped, setSignatureTyped] = useState("");
  const completed = isFormComplete(form, answers);

  // Find signature fields
  const signatureFields = form.fields.filter((f) => f.type === "signature");
  const nonSignatureFields = form.fields.filter((f) => f.type !== "signature");

  function handleApplySignature(fieldId: string) {
    if (!signatureTyped.trim()) return;
    onUpdateAnswers(fieldId, signatureTyped.trim());
    setOpen(false);
  }

  return (
    <div>
      <div className={`overflow-hidden rounded-xl border transition-colors ${showError && !completed ? "border-red-400" : "border-[#e8e6e1]"}`}>
        {/* Header */}
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between bg-[#faf9f7] px-4 py-3 text-left transition-colors hover:bg-[#f5f4f2]">
          <div className="flex items-center gap-2.5">
            {completed ? (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C9A96E]">
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : (
              <div className="h-5 w-5 shrink-0 rounded-full border-2 border-[#e8e6e1]" />
            )}
            <div>
              <p className="text-[13px] font-medium text-[#1a1814]">{form.name}</p>
              {completed && signatureFields.length > 0 ? (
                <p className="text-[11px] text-[#9a9890]">
                  Signed as{" "}
                  <span style={{ fontFamily: "'Brush Script MT','Segoe Script',cursive", fontStyle: "italic", fontSize: "14px", color: "#1a1814" }}>
                    {String(answers[signatureFields[0].id] ?? "")}
                  </span>
                </p>
              ) : completed ? (
                <p className="text-[11px] text-[#9a9890]">Completed</p>
              ) : (
                <p className="text-[11px] text-[#9a9890]">Click to review{form.required ? " and sign" : ""}</p>
              )}
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9890" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="border-t border-[#e8e6e1]">
            {/* Description */}
            {form.description && (
              <div className="px-4 pt-4 text-[12px] leading-relaxed text-[#6b6860]">
                <p>{form.description}</p>
              </div>
            )}

            {/* Non-signature fields */}
            {nonSignatureFields.length > 0 && (
              <div className="space-y-3 px-4 py-4">
                {nonSignatureFields.map((field) => (
                  <div key={field.id}>
                    <label className="mb-1 block text-[12px] font-medium text-[#1a1814]">
                      {field.label}
                      {field.required && <span className="ml-1 text-red-400">*</span>}
                    </label>
                    {field.type === "checkbox" ? (
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={answers[field.id] === true}
                          onChange={(e) => onUpdateAnswers(field.id, e.target.checked)}
                          className="h-4 w-4 rounded border-[#e8e6e1] accent-[#C9A96E]"
                        />
                        <span className="text-[12px] text-[#6b6860]">I agree</span>
                      </label>
                    ) : field.type === "select" ? (
                      <select
                        value={String(answers[field.id] ?? "")}
                        onChange={(e) => onUpdateAnswers(field.id, e.target.value)}
                        className="w-full rounded-xl border border-[#e8e6e1] px-3 py-2.5 text-[13px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
                      >
                        <option value="">Select…</option>
                        {(field.options ?? []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={String(answers[field.id] ?? "")}
                        onChange={(e) => onUpdateAnswers(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full resize-none rounded-xl border border-[#e8e6e1] px-4 py-2.5 text-[13px] text-[#1a1814] outline-none placeholder:text-[#c0bdb8] focus:border-[#C9A96E]"
                      />
                    ) : field.type === "date" ? (
                      <input
                        type="date"
                        value={String(answers[field.id] ?? "")}
                        onChange={(e) => onUpdateAnswers(field.id, e.target.value)}
                        className="w-full rounded-xl border border-[#e8e6e1] px-4 py-2.5 text-[13px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(answers[field.id] ?? "")}
                        onChange={(e) => onUpdateAnswers(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-[#e8e6e1] px-4 py-2.5 text-[13px] text-[#1a1814] outline-none placeholder:text-[#c0bdb8] focus:border-[#C9A96E]"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Signature fields */}
            {signatureFields.map((field) => (
              <div key={field.id} className="border-t border-dashed border-[#e8e6e1] bg-white px-4 py-4">
                <p className="mb-3 text-[12px] font-medium text-[#1a1814]">
                  {field.label}
                  {field.required && <span className="ml-1 text-red-400">*</span>}
                </p>
                <input
                  type="text"
                  value={answers[field.id] ? "" : signatureTyped}
                  onChange={(e) => setSignatureTyped(e.target.value)}
                  placeholder="Type your full name"
                  readOnly={!!answers[field.id]}
                  className="w-full rounded-xl border border-[#e8e6e1] px-4 py-2.5 text-[13px] text-[#1a1814] outline-none transition-colors placeholder:text-[#c0bdb8] focus:border-[#C9A96E] read-only:bg-[#f9f8f6]"
                />
                {!answers[field.id] && signatureTyped.trim() && (
                  <div className="mt-3 rounded-xl border border-dashed border-[#e8e6e1] bg-[#faf9f7] px-4 py-3">
                    <p className="mb-1.5 text-[10px] uppercase tracking-widest text-[#9a9890]">Signature Preview</p>
                    <p className="text-[30px] leading-tight text-[#1a1814]"
                      style={{ fontFamily: "'Brush Script MT','Segoe Script',cursive", fontStyle: "italic" }}>
                      {signatureTyped}
                    </p>
                    <div className="mt-2 border-t border-[#c0bdb8]" />
                  </div>
                )}
                {answers[field.id] && (
                  <div className="mt-3 rounded-xl border border-dashed border-[#e8e6e1] bg-[#faf9f7] px-4 py-3">
                    <p className="mb-1.5 text-[10px] uppercase tracking-widest text-[#9a9890]">Signed</p>
                    <p className="text-[30px] leading-tight text-[#1a1814]"
                      style={{ fontFamily: "'Brush Script MT','Segoe Script',cursive", fontStyle: "italic" }}>
                      {String(answers[field.id])}
                    </p>
                    <div className="mt-2 border-t border-[#c0bdb8]" />
                  </div>
                )}
                {!answers[field.id] && (
                  <button
                    type="button"
                    onClick={() => handleApplySignature(field.id)}
                    disabled={!signatureTyped.trim()}
                    className="mt-3 w-full rounded-xl bg-[#1a1814] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2d2925] disabled:opacity-40"
                  >
                    Apply Signature
                  </button>
                )}
                {answers[field.id] && (
                  <button
                    type="button"
                    onClick={() => { onUpdateAnswers(field.id, ""); setSignatureTyped(""); setOpen(true); }}
                    className="mt-2 text-[11px] text-[#9a9890] underline hover:text-[#1a1814]"
                  >
                    Clear signature
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Business Policies Accordion ─────────────────────────────────────────────

function PoliciesAccordion({ businessSettings }: { businessSettings: BusinessSettings }) {
  const [open, setOpen] = useState(false);

  const policies = [
    businessSettings.cancellationPolicy && { title: "Cancellation Policy", text: businessSettings.cancellationPolicy },
    businessSettings.latePolicy && { title: "Late Arrival Policy", text: businessSettings.latePolicy },
    businessSettings.noShowPolicy && { title: "No-Show Policy", text: businessSettings.noShowPolicy },
    businessSettings.depositPolicy && { title: "Deposit Policy", text: businessSettings.depositPolicy },
  ].filter(Boolean) as { title: string; text: string }[];

  if (policies.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8e6e1]">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-[#faf9f7] px-4 py-3 text-left transition-colors hover:bg-[#f5f4f2]">
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[13px] font-medium text-[#1a1814]">Studio Policies</p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9890" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="max-h-48 overflow-y-auto border-t border-[#e8e6e1] px-4 py-4 text-[12px] leading-relaxed text-[#6b6860]">
          {policies.map((p) => (
            <div key={p.title} className="mb-4 last:mb-0">
              <p className="mb-1 font-semibold text-[#1a1814]">{p.title}</p>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 3 — Your Info + Forms ───────────────────────────────────────────────

function Step3YourInfo({
  onSubmit, isSubmitting, error, businessSettings, serviceForms, formAnswers, onUpdateFormAnswer,
}: {
  onSubmit: (info: CustomerInfo) => void;
  isSubmitting: boolean;
  error: string | null;
  businessSettings: BusinessSettings;
  serviceForms: ServiceForm[];
  formAnswers: FormAnswers;
  onUpdateFormAnswer: (formId: string, fieldId: string, value: string | boolean) => void;
}) {
  const [form, setForm] = useState<CustomerInfo>({ fullName: "", email: "", phone: "", notes: "" });
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo | "forms", string>>>({});

  function set<K extends keyof CustomerInfo>(key: K, val: CustomerInfo[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const errs: Partial<Record<keyof CustomerInfo | "forms", string>> = {};
    if (!form.fullName.trim()) errs.fullName = "Name is required";
    if (!form.email.trim()) { errs.email = "Email is required"; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errs.email = "Enter a valid email"; }
    if (!form.phone.trim()) errs.phone = "Phone number is required";

    const incompleteForms = serviceForms.filter(
      (f) => f.required && !isFormComplete(f, formAnswers[f.id] ?? {})
    );
    if (incompleteForms.length > 0) {
      errs.forms = `Please complete: ${incompleteForms.map((f) => f.name).join(", ")}`;
      setShowFormErrors(true);
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), notes: form.notes.trim() });
  }

  const inputCls = (field: keyof CustomerInfo) =>
    `w-full rounded-xl border px-4 py-3 text-[13px] text-[#1a1814] outline-none transition-colors placeholder:text-[#c0bdb8] focus:border-[#C9A96E] ${errors[field] ? "border-red-400" : "border-[#e8e6e1]"}`;

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-[#1a1814]">Almost there!</h2>
      <p className="mb-6 text-[13px] text-[#9a9890]">Fill in your details and complete any required forms to continue</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">Full Name <span className="text-red-400">*</span></label>
          <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Jane Smith" className={inputCls("fullName")} />
          {errors.fullName && <p className="mt-1 text-[11px] text-red-500">{errors.fullName}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">Email Address <span className="text-red-400">*</span></label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" className={inputCls("email")} />
          {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">Phone Number <span className="text-red-400">*</span></label>
          <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(682) 555-0100" className={inputCls("phone")} />
          {errors.phone && <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">Notes <span className="font-normal text-[#c0bdb8]">(optional)</span></label>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any skin sensitivities, preferences, or questions…" rows={3}
            className="w-full resize-none rounded-xl border border-[#e8e6e1] px-4 py-3 text-[13px] text-[#1a1814] outline-none transition-colors placeholder:text-[#c0bdb8] focus:border-[#C9A96E]" />
        </div>

        {/* Studio policies (informational) */}
        <PoliciesAccordion businessSettings={businessSettings} />

        {/* Dynamic consent/intake forms */}
        {serviceForms.length > 0 && (
          <div className="space-y-3">
            {serviceForms.map((svcForm) => (
              <div key={svcForm.id}>
                <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">
                  {svcForm.name}
                  {svcForm.required && <span className="ml-1 text-red-400">*</span>}
                </label>
                <DynamicFormAccordion
                  form={svcForm}
                  answers={formAnswers[svcForm.id] ?? {}}
                  onUpdateAnswers={(fieldId, value) => onUpdateFormAnswer(svcForm.id, fieldId, value)}
                  showError={showFormErrors}
                />
              </div>
            ))}
          </div>
        )}

        {errors.forms && (
          <p className="text-[11px] text-red-500">{errors.forms}</p>
        )}

        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-[12px] text-red-600">{error}</div>}

        <button type="submit" disabled={isSubmitting}
          className="w-full rounded-xl bg-[#C9A96E] py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#b8954f] disabled:opacity-60">
          {isSubmitting ? "Preparing payment…" : "Continue to Payment →"}
        </button>

        <p className="text-center text-[11px] text-[#9a9890]">You&apos;ll enter your card details on the next step</p>
      </form>
    </div>
  );
}

// ─── Step 4 — Square Payment ──────────────────────────────────────────────────

function Step4Payment({ bookingId, clientSlug, chargeAmount }: {
  bookingId: string; clientSlug: string; chargeAmount: number;
}) {
  const router = useRouter();
  const cardRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [cardMounted, setCardMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Square.js
  useEffect(() => {
    if (window.Square) { setSdkReady(true); return; }
    const existing = document.querySelector('script[data-square-sdk]');
    if (existing) { existing.addEventListener("load", () => setSdkReady(true)); return; }
    const script = document.createElement("script");
    const isProd = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production";
    script.src = isProd
      ? "https://web.squarecdn.com/v1/square.js"
      : "https://sandbox.web.squarecdn.com/v1/square.js";
    script.setAttribute("data-square-sdk", "true");
    script.onload = () => setSdkReady(true);
    script.onerror = () => setError("Could not load payment form. Please refresh the page.");
    document.head.appendChild(script);
  }, []);

  // Mount card form
  useEffect(() => {
    if (!sdkReady || cardMounted || !window.Square) return;

    async function mountCard() {
      try {
        const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
        const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
        if (!appId || !locationId) {
          setError("Payment is not configured yet. Please contact the studio.");
          return;
        }
        const payments = window.Square.payments(appId, locationId);
        const card = await payments.card({
          style: {
            ".input-container": { borderRadius: "12px" },
            ".input-container.is-focus": { borderColor: "#C9A96E" },
            ".input-container.is-error": { borderColor: "#ef4444" },
            ".message-text": { color: "#6b6860" },
            ".message-icon": { color: "#6b6860" },
          },
        });
        await card.attach("#square-card-container");
        cardRef.current = card;
        setCardMounted(true);
      } catch {
        setError("Could not load card form. Please refresh and try again.");
      }
    }

    mountCard();
  }, [sdkReady, cardMounted]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!cardRef.current || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const result = await cardRef.current.tokenize();
    if (result.status !== "OK") {
      setError(result.errors?.[0]?.message ?? "Card validation failed. Please check your details.");
      setIsSubmitting(false);
      return;
    }

    const res = await fetch("/api/payments/square", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: result.token, bookingId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    router.push(`/${clientSlug}/confirmation/${bookingId}`);
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-[#1a1814]">Payment</h2>
      <p className="mb-6 text-[13px] text-[#9a9890]">Enter your card details to confirm your appointment</p>

      <form onSubmit={handlePay} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">Card Details</label>
          <div
            ref={containerRef}
            id="square-card-container"
            className="min-h-[88px] rounded-xl border border-[#e8e6e1] bg-white p-3"
          />
          {!cardMounted && !error && (
            <p className="mt-2 text-center text-[12px] text-[#9a9890]">Loading payment form…</p>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-[12px] text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={!cardMounted || isSubmitting}
          className="w-full rounded-xl bg-[#C9A96E] py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#b8954f] disabled:opacity-60"
        >
          {isSubmitting ? "Processing…" : `Pay $${chargeAmount.toFixed(2)} →`}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-[#9a9890]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Secured by Square. Your card info is never stored on our servers.
        </p>
      </form>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BookSelection({ clientSlug, clientId, categories, businessSettings }: BookSelectionProps) {
  const { timezone } = businessSettings;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [service, setService] = useState<Service | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [chargeAmount, setChargeAmount] = useState<number>(0);
  const [serviceForms, setServiceForms] = useState<ServiceForm[]>([]);
  const [formAnswers, setFormAnswers] = useState<FormAnswers>({});

  useEffect(() => {
    if (!selectedDate || !service || step !== 2) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setSlotsLoading(true);
    setSlots([]);
    fetch("/api/bookings/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, serviceId: service.id, date: dateStr }),
    })
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, service, clientId, step]);

  function handleGoTo(n: 1 | 2 | 3 | 4) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSelectService(s: Service) {
    setService(s);
    setSlot(null);
    setSelectedDate(null);
    setSlots([]);
    setFormAnswers({});

    // Fetch forms for this service
    try {
      const res = await fetch(`/api/services/${s.id}/forms`);
      if (res.ok) {
        const forms: ServiceForm[] = await res.json();
        setServiceForms(forms);
      } else {
        setServiceForms([]);
      }
    } catch {
      setServiceForms([]);
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectSlot(slotUtc: string) {
    setSlot(slotUtc);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleUpdateFormAnswer(formId: string, fieldId: string, value: string | boolean) {
    setFormAnswers((prev) => ({
      ...prev,
      [formId]: { ...(prev[formId] ?? {}), [fieldId]: value },
    }));
  }

  async function handleStep3Submit(info: CustomerInfo) {
    if (!service || !slot) return;
    setIsSubmitting(true);
    setSubmitError(null);

    // Build formAnswers payload
    const formAnswersPayload = serviceForms.map((f) => ({
      formTemplateId: f.id,
      answers: formAnswers[f.id] ?? {},
    }));

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          serviceId: service.id,
          startTimeUtc: slot,
          customer: {
            fullName: info.fullName,
            email: info.email,
            phone: info.phone,
            notes: info.notes || undefined,
          },
          formAnswers: formAnswersPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }
      setPendingBookingId(data.bookingId);
      setChargeAmount(data.chargeAmount);
      setIsSubmitting(false);
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* Step indicator — full bleed */}
      <div className="border-b border-[#e8e6e1] bg-white py-3" style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}>
        <StepIndicator current={step} onGoTo={handleGoTo} />
      </div>

      <div className="px-4 py-6 pb-24 lg:pb-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left */}
            <div className="rounded-2xl border border-[#e8e6e1] bg-white p-6 shadow-sm">
              {step === 1 && <Step1Service categories={categories} onSelect={handleSelectService} />}

              {step === 2 && service && (
                <>
                  <div className="mb-5 flex items-center gap-2">
                    <button onClick={() => handleGoTo(1)} className="flex items-center gap-1 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      Back
                    </button>
                    <span className="text-[#e8e6e1]">·</span>
                    <span className="text-[12px] font-medium text-[#1a1814]">{service.name}</span>
                    <span className="ml-auto rounded-full bg-[#f5f4f2] px-2.5 py-0.5 text-[11px] text-[#6b6860]">
                      {formatDuration(service.durationMinutes)} · ${service.price.toFixed(2)}
                    </span>
                  </div>
                  <Step2Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} slots={slots} slotsLoading={slotsLoading} timezone={timezone} onSelectSlot={handleSelectSlot} />
                </>
              )}

              {step === 3 && (
                <>
                  <div className="mb-5 flex items-center gap-2">
                    <button onClick={() => handleGoTo(2)} className="flex items-center gap-1 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      Back
                    </button>
                    {slot && (
                      <>
                        <span className="text-[#e8e6e1]">·</span>
                        <span className="text-[12px] text-[#6b6860]">
                          {format(toZonedTime(new Date(slot), timezone), "EEE, MMM d")} at {formatSlotTime(slot, timezone)}
                        </span>
                      </>
                    )}
                  </div>
                  <Step3YourInfo
                    onSubmit={handleStep3Submit}
                    isSubmitting={isSubmitting}
                    error={submitError}
                    businessSettings={businessSettings}
                    serviceForms={serviceForms}
                    formAnswers={formAnswers}
                    onUpdateFormAnswer={handleUpdateFormAnswer}
                  />
                </>
              )}

              {step === 4 && pendingBookingId && (
                <>
                  <div className="mb-5 flex items-center gap-2">
                    <button onClick={() => { handleGoTo(3); setSubmitError(null); }}
                      className="flex items-center gap-1 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      Back
                    </button>
                    {slot && (
                      <>
                        <span className="text-[#e8e6e1]">·</span>
                        <span className="text-[12px] text-[#6b6860]">
                          {format(toZonedTime(new Date(slot), timezone), "EEE, MMM d")} at {formatSlotTime(slot, timezone)}
                        </span>
                      </>
                    )}
                  </div>
                  <Step4Payment bookingId={pendingBookingId} clientSlug={clientSlug} chargeAmount={chargeAmount} />
                </>
              )}
            </div>

            {/* Right: sidebar */}
            <div className="hidden lg:block">
              <Sidebar step={step} service={service} slot={slot} timezone={timezone} slots={slots} slotsLoading={slotsLoading} selectedDate={selectedDate} onGoTo={handleGoTo} onSelectSlot={handleSelectSlot} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      {service && step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e8e6e1] bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#1a1814]">{service.name}</p>
              <p className="text-[12px] text-[#9a9890]">{formatDuration(service.durationMinutes)} · ${service.price.toFixed(2)}</p>
            </div>
            {slot && (
              <div className="text-right">
                <p className="text-[12px] text-[#6b6860]">{format(toZonedTime(new Date(slot), timezone), "MMM d")}</p>
                <p className="text-[12px] font-medium text-[#1a1814]">{formatSlotTime(slot, timezone)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
