"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
                    <polyline
                      points="2,6 5,9 10,3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span
                className={`hidden text-[11px] font-medium sm:inline sm:text-[12px] ${
                  active
                    ? "text-[#1a1814]"
                    : done
                    ? "text-[#C9A96E]"
                    : "text-[#9a9890]"
                }`}
              >
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-3 sm:w-6 ${
                  current > n ? "bg-[#C9A96E]" : "bg-[#e8e6e1]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Calendar Widget ──────────────────────────────────────────────────────────

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarWidget({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = startOfToday();
  const [viewMonth, setViewMonth] = useState(today);
  const monthStart = startOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(endOfMonth(viewMonth));
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          disabled={isSameMonth(viewMonth, today)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e6e1] bg-white text-[#9a9890] transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-[14px] font-semibold text-[#1a1814]">
          {format(viewMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e6e1] bg-white text-[#9a9890] transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {DOW.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#9a9890]">
            {d}
          </div>
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
  step,
  service,
  slot,
  timezone,
  slots,
  slotsLoading,
  selectedDate,
  onGoTo,
  onSelectSlot,
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
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9a9890]">
          Your Booking
        </p>

        <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#e8e6e1] pb-3">
          <div>
            <p className="text-[11px] text-[#9a9890]">Service</p>
            {service ? (
              <p className="text-[13px] font-medium text-[#1a1814]">{service.name}</p>
            ) : (
              <p className="text-[13px] italic text-[#c0bdb8]">Not selected</p>
            )}
          </div>
          {service && step > 1 && (
            <button onClick={() => onGoTo(1)} className="shrink-0 text-[11px] font-medium text-[#C9A96E] underline hover:text-[#b8954f]">
              Change
            </button>
          )}
        </div>

        <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#e8e6e1] py-3">
          <div>
            <p className="text-[11px] text-[#9a9890]">Date & Time</p>
            {slot ? (
              <>
                <p className="text-[13px] font-medium text-[#1a1814]">
                  {format(toZonedTime(new Date(slot), timezone), "EEEE, MMM d")}
                </p>
                <p className="text-[12px] text-[#6b6860]">{formatSlotTime(slot, timezone)}</p>
              </>
            ) : (
              <p className="text-[13px] italic text-[#c0bdb8]">Not selected</p>
            )}
          </div>
          {slot && step > 2 && (
            <button onClick={() => onGoTo(2)} className="shrink-0 text-[11px] font-medium text-[#C9A96E] underline hover:text-[#b8954f]">
              Change
            </button>
          )}
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
          <p className="mb-1 text-[12px] font-semibold text-[#1a1814]">
            {format(selectedDate, "EEEE, MMMM d")}
          </p>
          <p className="mb-4 text-[11px] text-[#9a9890]">Available times</p>

          {slotsLoading && (
            <div className="flex h-24 items-center justify-center">
              <p className="text-[12px] text-[#9a9890]">Loading…</p>
            </div>
          )}
          {!slotsLoading && slots.length === 0 && (
            <div className="flex h-24 flex-col items-center justify-center rounded-xl bg-[#f9f8f6]">
              <p className="text-[12px] font-medium text-[#1a1814]">No availability</p>
              <p className="mt-0.5 text-[11px] text-[#9a9890]">Try another date</p>
            </div>
          )}
          {!slotsLoading && slots.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => onSelectSlot(s)}
                  className="rounded-xl border border-[#e8e6e1] bg-white py-2 text-[12px] font-medium text-[#1a1814] transition-all hover:border-[#C9A96E] hover:bg-[#C9A96E] hover:text-white"
                >
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
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
              activeCat === cat.id
                ? "bg-[#C9A96E] text-white"
                : "bg-[#f5f4f2] text-[#6b6860] hover:bg-[#C9A96E] hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {currentServices.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className="group flex flex-col items-start rounded-2xl border border-[#e8e6e1] bg-white p-5 text-left transition-all hover:border-[#C9A96E] hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <p className="text-[14px] font-semibold text-[#1a1814]">{service.name}</p>
              <span className="shrink-0 text-[14px] font-bold text-[#1a1814]">${service.price.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-[12px] text-[#9a9890]">{formatDuration(service.durationMinutes)}</p>
            {service.description && (
              <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#9a9890]">{service.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2 — Calendar ────────────────────────────────────────────────────────

function Step2Calendar({
  selectedDate,
  onDateSelect,
  slots,
  slotsLoading,
  timezone,
  onSelectSlot,
}: {
  selectedDate: Date | null;
  onDateSelect: (d: Date) => void;
  slots: string[];
  slotsLoading: boolean;
  timezone: string;
  onSelectSlot: (s: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-[#1a1814]">Pick your date & time</h2>
      <p className="mb-5 text-[13px] text-[#9a9890]">
        Select a date — available times will appear on the right
      </p>
      <CalendarWidget selectedDate={selectedDate} onSelect={onDateSelect} />

      {selectedDate && (
        <div className="mt-6 lg:hidden">
          <p className="mb-1 text-[13px] font-semibold text-[#1a1814]">
            {format(selectedDate, "EEEE, MMMM d")}
          </p>
          <p className="mb-3 text-[11px] text-[#9a9890]">Available times</p>
          {slotsLoading && (
            <div className="flex h-20 items-center justify-center rounded-xl bg-[#f9f8f6]">
              <p className="text-[12px] text-[#9a9890]">Loading…</p>
            </div>
          )}
          {!slotsLoading && slots.length === 0 && (
            <div className="flex h-20 flex-col items-center justify-center rounded-xl bg-[#f9f8f6]">
              <p className="text-[12px] font-medium text-[#1a1814]">No availability</p>
              <p className="mt-0.5 text-[11px] text-[#9a9890]">Try another date</p>
            </div>
          )}
          {!slotsLoading && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => onSelectSlot(s)}
                  className="rounded-xl border border-[#e8e6e1] bg-white py-2.5 text-[13px] font-medium text-[#1a1814] transition-all hover:border-[#C9A96E] hover:bg-[#C9A96E] hover:text-white"
                >
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

// ─── Consent Accordion ────────────────────────────────────────────────────────

function ConsentAccordion({
  businessSettings,
  signed,
  onSign,
  error,
}: {
  businessSettings: BusinessSettings;
  signed: boolean;
  onSign: (name: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [appliedName, setAppliedName] = useState("");

  const policies = [
    businessSettings.cancellationPolicy && { title: "Cancellation Policy", text: businessSettings.cancellationPolicy },
    businessSettings.latePolicy && { title: "Late Arrival Policy", text: businessSettings.latePolicy },
    businessSettings.noShowPolicy && { title: "No-Show Policy", text: businessSettings.noShowPolicy },
    businessSettings.depositPolicy && { title: "Deposit Policy", text: businessSettings.depositPolicy },
  ].filter(Boolean) as { title: string; text: string }[];

  function handleApply() {
    if (!typedName.trim()) return;
    setAppliedName(typedName.trim());
    onSign(typedName.trim());
    setOpen(false);
  }

  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">
        Consent Form <span className="text-red-400">*</span>
      </label>

      <div className={`overflow-hidden rounded-xl border transition-colors ${error ? "border-red-400" : "border-[#e8e6e1]"}`}>
        {/* Header */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between bg-[#faf9f7] px-4 py-3 text-left transition-colors hover:bg-[#f5f4f2]"
        >
          <div className="flex items-center gap-2.5">
            {signed ? (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C9A96E]">
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : (
              <div className="h-5 w-5 shrink-0 rounded-full border-2 border-[#e8e6e1]" />
            )}
            <div>
              <p className="text-[13px] font-medium text-[#1a1814]">Studio Policies & Consent</p>
              {signed && (
                <p className="text-[11px] text-[#9a9890]">
                  Signed as{" "}
                  <span style={{ fontFamily: "cursive", fontStyle: "italic", fontSize: "13px", color: "#1a1814" }}>
                    {appliedName}
                  </span>
                </p>
              )}
              {!signed && (
                <p className="text-[11px] text-[#9a9890]">Click to review and sign</p>
              )}
            </div>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9a9890"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Expanded content */}
        {open && (
          <div className="border-t border-[#e8e6e1]">
            {/* Policy text */}
            <div className="max-h-48 overflow-y-auto px-4 py-4 text-[12px] leading-relaxed text-[#6b6860]">
              {policies.length > 0 ? (
                policies.map((p) => (
                  <div key={p.title} className="mb-4 last:mb-0">
                    <p className="mb-1 font-semibold text-[#1a1814]">{p.title}</p>
                    <p>{p.text}</p>
                  </div>
                ))
              ) : (
                <div>
                  <p className="mb-2 font-semibold text-[#1a1814]">Appointment Policies</p>
                  <p className="mb-2">Please arrive on time for your appointment. Late arrivals may result in a shortened service or rescheduling.</p>
                  <p className="mb-2">Cancellations must be made at least 24 hours in advance. Late cancellations or no-shows may be subject to a fee.</p>
                  <p>By booking, you confirm you understand and agree to our studio policies.</p>
                </div>
              )}
            </div>

            {/* Signature section */}
            <div className="border-t border-dashed border-[#e8e6e1] bg-white px-4 py-4">
              <p className="mb-3 text-[12px] font-medium text-[#1a1814]">
                Sign below to acknowledge you have read and agree to the policies above
              </p>

              <div>
                <label className="mb-1.5 block text-[11px] text-[#9a9890]">
                  Type your full name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-[#e8e6e1] px-4 py-2.5 text-[13px] text-[#1a1814] outline-none transition-colors placeholder:text-[#c0bdb8] focus:border-[#C9A96E]"
                />
              </div>

              {/* Signature preview */}
              {typedName.trim() && (
                <div className="mt-3 rounded-xl border border-dashed border-[#e8e6e1] bg-[#faf9f7] px-4 py-3">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-[#9a9890]">
                    Signature Preview
                  </p>
                  <p
                    className="text-[28px] text-[#1a1814]"
                    style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontStyle: "italic" }}
                  >
                    {typedName}
                  </p>
                  <div className="mt-2 border-t border-[#e8e6e1]" />
                </div>
              )}

              <button
                type="button"
                onClick={handleApply}
                disabled={!typedName.trim()}
                className="mt-3 w-full rounded-xl bg-[#1a1814] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2d2925] disabled:opacity-40"
              >
                Apply Signature
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ─── Step 3 — Your Info + Consent ─────────────────────────────────────────────

function Step3YourInfo({
  onSubmit,
  isSubmitting,
  error,
  businessSettings,
}: {
  onSubmit: (info: CustomerInfo) => void;
  isSubmitting: boolean;
  error: string | null;
  businessSettings: BusinessSettings;
}) {
  const [form, setForm] = useState<CustomerInfo>({ fullName: "", email: "", phone: "", notes: "" });
  const [signed, setSigned] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo | "consent", string>>>({});

  function set<K extends keyof CustomerInfo>(key: K, val: CustomerInfo[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const errs: Partial<Record<keyof CustomerInfo | "consent", string>> = {};
    if (!form.fullName.trim()) errs.fullName = "Name is required";
    if (!form.email.trim()) { errs.email = "Email is required"; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errs.email = "Enter a valid email"; }
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!signed) errs.consent = "Please sign the consent form to continue";
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
      <p className="mb-6 text-[13px] text-[#9a9890]">Fill in your details and sign the consent form to continue to payment</p>

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
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any skin sensitivities, preferences, or questions…" rows={3} className="w-full resize-none rounded-xl border border-[#e8e6e1] px-4 py-3 text-[13px] text-[#1a1814] outline-none transition-colors placeholder:text-[#c0bdb8] focus:border-[#C9A96E]" />
        </div>

        <ConsentAccordion
          businessSettings={businessSettings}
          signed={signed}
          onSign={() => { setSigned(true); setErrors((prev) => ({ ...prev, consent: undefined })); }}
          error={errors.consent}
        />

        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-[12px] text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#C9A96E] py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#b8954f] disabled:opacity-60"
        >
          {isSubmitting ? "Preparing payment…" : "Continue to Payment →"}
        </button>

        <p className="text-center text-[11px] text-[#9a9890]">
          You&apos;ll enter your card details on the next step
        </p>
      </form>
    </div>
  );
}

// ─── Step 4 — Payment ─────────────────────────────────────────────────────────

function PaymentForm({
  amount,
  bookingId,
  clientSlug,
  isSubmitting,
  setIsSubmitting,
  submitError,
  setSubmitError,
}: {
  amount: number;
  bookingId: string;
  clientSlug: string;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  submitError: string | null;
  setSubmitError: (v: string | null) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${clientSlug}/confirmation/${bookingId}`,
      },
    });

    if (error) {
      setSubmitError(error.message ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
    }
    // On success, Stripe redirects automatically
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-[#e8e6e1] p-4">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {submitError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-[12px] text-red-600">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full rounded-xl bg-[#C9A96E] py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#b8954f] disabled:opacity-60"
      >
        {isSubmitting ? "Processing…" : `Pay $${amount.toFixed(2)} →`}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-[#9a9890]">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Secured by Stripe. Your card info is never stored on our servers.
      </p>
    </form>
  );
}

function Step4Payment({
  clientSecret,
  service,
  bookingId,
  clientSlug,
  isSubmitting,
  setIsSubmitting,
  submitError,
  setSubmitError,
}: {
  clientSecret: string;
  service: Service;
  bookingId: string;
  clientSlug: string;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  submitError: string | null;
  setSubmitError: (v: string | null) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-[#1a1814]">Payment</h2>
      <p className="mb-6 text-[13px] text-[#9a9890]">
        Enter your card details to confirm your appointment
      </p>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#C9A96E",
              colorBackground: "#ffffff",
              colorText: "#1a1814",
              colorDanger: "#ef4444",
              fontFamily: "inherit",
              borderRadius: "12px",
              spacingUnit: "4px",
            },
          },
        }}
      >
        <PaymentForm
          amount={service.price}
          bookingId={bookingId}
          clientSlug={clientSlug}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          submitError={submitError}
          setSubmitError={setSubmitError}
        />
      </Elements>
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
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

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

  function handleSelectService(s: Service) {
    setService(s);
    setSlot(null);
    setSelectedDate(null);
    setSlots([]);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectSlot(slotUtc: string) {
    setSlot(slotUtc);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleStep3Submit(info: CustomerInfo) {
    if (!service || !slot) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          serviceId: service.id,
          startTimeUtc: slot,
          customer: { fullName: info.fullName, email: info.email, phone: info.phone, notes: info.notes || undefined },
          formAnswers: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }
      setPaymentClientSecret(data.clientSecret);
      setPendingBookingId(data.bookingId);
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
      <div
        className="border-b border-[#e8e6e1] bg-white py-3"
        style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
      >
        <StepIndicator current={step} onGoTo={handleGoTo} />
      </div>

      <div className="px-4 py-6 pb-24 lg:pb-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left */}
            <div className="rounded-2xl border border-[#e8e6e1] bg-white p-6 shadow-sm">
              {step === 1 && (
                <Step1Service categories={categories} onSelect={handleSelectService} />
              )}

              {step === 2 && service && (
                <>
                  <div className="mb-5 flex items-center gap-2">
                    <button onClick={() => handleGoTo(1)} className="flex items-center gap-1 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Back
                    </button>
                    <span className="text-[#e8e6e1]">·</span>
                    <span className="text-[12px] font-medium text-[#1a1814]">{service.name}</span>
                    <span className="ml-auto rounded-full bg-[#f5f4f2] px-2.5 py-0.5 text-[11px] text-[#6b6860]">
                      {formatDuration(service.durationMinutes)} · ${service.price.toFixed(2)}
                    </span>
                  </div>
                  <Step2Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    slots={slots}
                    slotsLoading={slotsLoading}
                    timezone={timezone}
                    onSelectSlot={handleSelectSlot}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <div className="mb-5 flex items-center gap-2">
                    <button onClick={() => handleGoTo(2)} className="flex items-center gap-1 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
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
                  />
                </>
              )}

              {step === 4 && paymentClientSecret && pendingBookingId && service && (
                <>
                  <div className="mb-5 flex items-center gap-2">
                    <button
                      onClick={() => { handleGoTo(3); setSubmitError(null); }}
                      className="flex items-center gap-1 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
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
                  <Step4Payment
                    clientSecret={paymentClientSecret}
                    service={service}
                    bookingId={pendingBookingId}
                    clientSlug={clientSlug}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    submitError={submitError}
                    setSubmitError={setSubmitError}
                  />
                </>
              )}
            </div>

            {/* Right: sidebar */}
            <div className="hidden lg:block">
              <Sidebar
                step={step}
                service={service}
                slot={slot}
                timezone={timezone}
                slots={slots}
                slotsLoading={slotsLoading}
                selectedDate={selectedDate}
                onGoTo={handleGoTo}
                onSelectSlot={handleSelectSlot}
              />
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
              <p className="text-[12px] text-[#9a9890]">
                {formatDuration(service.durationMinutes)} · ${service.price.toFixed(2)}
              </p>
            </div>
            {slot && (
              <div className="text-right">
                <p className="text-[12px] text-[#6b6860]">
                  {format(toZonedTime(new Date(slot), timezone), "MMM d")}
                </p>
                <p className="text-[12px] font-medium text-[#1a1814]">{formatSlotTime(slot, timezone)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
