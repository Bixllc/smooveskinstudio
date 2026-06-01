"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

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
}

interface BookSelectionProps {
  clientSlug: string;
  clientId: string;
  categories: Category[];
  businessSettings: BusinessSettings;
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

function isMostPopular(_serviceName: string): boolean {
  return false;
}

// Generate next N days starting from today
function getDateStrip(n = 14): Date[] {
  const today = startOfToday();
  return Array.from({ length: n }, (_, i) => addDays(today, i));
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

const STEPS = ["Service", "Date & Time", "Your Info"];

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2 px-3 py-2">
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
                className={`text-[12px] font-medium ${
                  active ? "text-[#1a1814]" : done ? "text-[#C9A96E]" : "text-[#9a9890]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 ${current > n ? "bg-[#C9A96E]" : "bg-[#e8e6e1]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  step,
  service,
  slot,
  timezone,
  onChangeService,
  onChangeSlot,
  onBook,
  isSubmitting,
}: {
  step: 1 | 2 | 3;
  service: Service | null;
  slot: string | null;
  timezone: string;
  onChangeService: () => void;
  onChangeSlot: () => void;
  onBook: () => void;
  isSubmitting: boolean;
}) {
  const canBook = step === 3;

  return (
    <aside className="flex flex-col gap-4">
      {/* Live booking summary */}
      <div className="rounded-2xl border border-[#e8e6e1] bg-white p-5 shadow-sm">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9a9890]">
          Your Booking
        </p>

        {/* Service row */}
        <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#e8e6e1] pb-3">
          <div>
            <p className="text-[11px] text-[#9a9890]">Service</p>
            {service ? (
              <p className="text-[13px] font-medium text-[#1a1814]">{service.name}</p>
            ) : (
              <p className="text-[13px] text-[#c0bdb8] italic">Not selected</p>
            )}
          </div>
          {service && step > 1 && (
            <button
              onClick={onChangeService}
              className="shrink-0 text-[11px] font-medium text-[#C9A96E] underline hover:text-[#b8954f]"
            >
              Change
            </button>
          )}
        </div>

        {/* Date/time row */}
        <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#e8e6e1] py-3">
          <div>
            <p className="text-[11px] text-[#9a9890]">Date & Time</p>
            {slot ? (
              <>
                <p className="text-[13px] font-medium text-[#1a1814]">
                  {format(toZonedTime(new Date(slot), timezone), "EEEE, MMM d")}
                </p>
                <p className="text-[12px] text-[#6b6860]">
                  {formatSlotTime(slot, timezone)}
                </p>
              </>
            ) : (
              <p className="text-[13px] text-[#c0bdb8] italic">Not selected</p>
            )}
          </div>
          {slot && step > 2 && (
            <button
              onClick={onChangeSlot}
              className="shrink-0 text-[11px] font-medium text-[#C9A96E] underline hover:text-[#b8954f]"
            >
              Change
            </button>
          )}
        </div>

        {/* Price */}
        {service && (
          <div className="pt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-[12px] text-[#9a9890]">
                {formatDuration(service.durationMinutes)}
              </p>
              <p className="text-xl font-bold text-[#1a1814]">
                ${service.price.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      {canBook && (
        <button
          onClick={onBook}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#C9A96E] py-3.5 text-[13px] font-semibold text-[#1a1814] transition-colors hover:bg-[#b8954f] disabled:opacity-60"
        >
          {isSubmitting ? "Booking…" : "Book Appointment"}
        </button>
      )}

    </aside>
  );
}

// ─── Step 1 — Service Selection ───────────────────────────────────────────────

function Step1Service({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect: (s: Service) => void;
}) {
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? "");

  const currentServices =
    categories.find((c) => c.id === activeCat)?.services ?? [];

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-[#1a1814]">
        Select your service
      </h2>

      {/* Category tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
              activeCat === cat.id
                ? "bg-[#1a1814] text-[#C9A96E]"
                : "bg-[#f5f4f2] text-[#6b6860] hover:bg-[#e8e6e1]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Service cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {currentServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  onSelect,
}: {
  service: Service;
  onSelect: (s: Service) => void;
}) {
  return (
    <button
      onClick={() => onSelect(service)}
      className="group flex flex-col items-start rounded-2xl border border-[#e8e6e1] bg-white p-5 text-left transition-all hover:border-[#C9A96E] hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex w-full items-start justify-between gap-2">
        <p className="text-[14px] font-semibold text-[#1a1814]">
          {service.name}
        </p>
        <span className="shrink-0 text-[14px] font-bold text-[#1a1814]">
          ${service.price.toFixed(2)}
        </span>
      </div>

      <p className="mt-1 text-[12px] text-[#9a9890]">
        {formatDuration(service.durationMinutes)}
      </p>

      {service.description && (
        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#9a9890]">
          {service.description}
        </p>
      )}
    </button>
  );
}

// ─── Step 2 — Date & Time ─────────────────────────────────────────────────────

const DATE_STRIP_DAYS = 21;

function Step2DateTime({
  clientId,
  service,
  timezone,
  onSelect,
}: {
  clientId: string;
  service: Service;
  timezone: string;
  onSelect: (slotUtc: string) => void;
}) {
  const dates = getDateStrip(DATE_STRIP_DAYS);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dateStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setLoading(true);
    setSlots([]);
    setError(null);
    fetch("/api/bookings/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, serviceId: service.id, date: dateStr }),
    })
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setError("Failed to load times. Try again."))
      .finally(() => setLoading(false));
  }, [selectedDate, clientId, service.id]);

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-[#1a1814]">
        Pick your date & time
      </h2>
      <p className="mb-5 text-[13px] text-[#9a9890]">
        Select a date, then choose an available time slot
      </p>

      {/* Date strip */}
      <div
        ref={dateStripRef}
        className="mb-5 flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {dates.map((date) => {
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition-all ${
                isSelected
                  ? "border-[#C9A96E] bg-[#1a1814] text-white"
                  : "border-[#e8e6e1] bg-white text-[#1a1814] hover:border-[#C9A96E]"
              }`}
            >
              <span className={`text-[10px] uppercase font-medium ${isSelected ? "text-[#C9A96E]" : "text-[#9a9890]"}`}>
                {format(date, "EEE")}
              </span>
              <span className="mt-0.5 text-[16px] font-bold leading-none">
                {format(date, "d")}
              </span>
              <span className={`text-[10px] ${isSelected ? "text-[#C9A96E]" : "text-[#9a9890]"}`}>
                {format(date, "MMM")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {!selectedDate && (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#e8e6e1] bg-[#f9f8f6]">
          <p className="text-[13px] text-[#9a9890]">Select a date to see available times</p>
        </div>
      )}

      {loading && (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#e8e6e1] bg-[#f9f8f6]">
          <p className="text-[13px] text-[#9a9890]">Loading available times…</p>
        </div>
      )}

      {error && (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-red-100 bg-red-50">
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      {selectedDate && !loading && !error && slots.length === 0 && (
        <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8e6e1] bg-[#f9f8f6]">
          <p className="text-[13px] font-medium text-[#1a1814]">No availability</p>
          <p className="mt-1 text-[12px] text-[#9a9890]">Try a different date</p>
        </div>
      )}

      {!loading && slots.length > 0 && (
        <>
          <p className="mb-3 text-[12px] text-[#9a9890]">
            {slots.length} time{slots.length !== 1 ? "s" : ""} available on{" "}
            {selectedDate ? format(selectedDate, "EEEE, MMMM d") : ""}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                key={slot}
                onClick={() => onSelect(slot)}
                className="rounded-xl border border-[#e8e6e1] bg-white py-2.5 text-[13px] font-medium text-[#1a1814] transition-all hover:border-[#C9A96E] hover:bg-[#1a1814] hover:text-[#C9A96E]"
              >
                {formatSlotTime(slot, timezone)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step 3 — Your Info ───────────────────────────────────────────────────────

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  isNewClient: boolean;
}

function Step3YourInfo({
  onSubmit,
  isSubmitting,
  error,
}: {
  onSubmit: (info: CustomerInfo) => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<CustomerInfo>({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
    isNewClient: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});

  function set<K extends keyof CustomerInfo>(key: K, val: CustomerInfo[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const errs: Partial<Record<keyof CustomerInfo, string>> = {};
    if (!form.fullName.trim()) errs.fullName = "Name is required";
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email";
    }
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), notes: form.notes.trim() });
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-[#1a1814]">
        Almost there!
      </h2>
      <p className="mb-6 text-[13px] text-[#9a9890]">
        Just a few details so we can confirm your appointment
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Jane Smith"
            className={`w-full rounded-xl border px-4 py-3 text-[13px] text-[#1a1814] outline-none transition-colors placeholder:text-[#c0bdb8] focus:border-[#C9A96E] ${
              errors.fullName ? "border-red-400" : "border-[#e8e6e1]"
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-[11px] text-red-500">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@example.com"
            className={`w-full rounded-xl border px-4 py-3 text-[13px] text-[#1a1814] outline-none transition-colors placeholder:text-[#c0bdb8] focus:border-[#C9A96E] ${
              errors.email ? "border-red-400" : "border-[#e8e6e1]"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="(682) 555-0100"
            className={`w-full rounded-xl border px-4 py-3 text-[13px] text-[#1a1814] outline-none transition-colors placeholder:text-[#c0bdb8] focus:border-[#C9A96E] ${
              errors.phone ? "border-red-400" : "border-[#e8e6e1]"
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">
            Notes <span className="text-[#c0bdb8] font-normal">(optional)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Any skin sensitivities, preferences, or questions for Anisha…"
            rows={3}
            className="w-full resize-none rounded-xl border border-[#e8e6e1] px-4 py-3 text-[13px] text-[#1a1814] outline-none transition-colors placeholder:text-[#c0bdb8] focus:border-[#C9A96E]"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.isNewClient}
            onChange={(e) => set("isNewClient", e.target.checked)}
            className="h-4 w-4 rounded accent-[#C9A96E]"
          />
          <span className="text-[13px] text-[#6b6860]">
            This is my first time at Smoove Skin Studio
          </span>
        </label>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-[12px] text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#C9A96E] py-3.5 text-[14px] font-semibold text-[#1a1814] transition-colors hover:bg-[#b8954f] disabled:opacity-60"
        >
          {isSubmitting ? "Booking your appointment…" : "Book Appointment →"}
        </button>

        <p className="text-center text-[11px] text-[#9a9890]">
          You&apos;ll receive a confirmation email right away
        </p>
      </form>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BookSelection({
  clientSlug,
  clientId,
  categories,
  businessSettings,
}: BookSelectionProps) {
  const router = useRouter();
  const { timezone } = businessSettings;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [service, setService] = useState<Service | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSelectService(s: Service) {
    setService(s);
    setSlot(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectSlot(slotUtc: string) {
    setSlot(slotUtc);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(info: CustomerInfo) {
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
          customer: {
            fullName: info.fullName,
            email: info.email,
            phone: info.phone,
            notes: info.notes || undefined,
          },
          formAnswers: [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/${clientSlug}/confirmation/${data.bookingId}`);
      }
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
        <StepIndicator current={step} />
      </div>

      {/* Main content */}
      <div className="px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left: step content */}
            <div className="rounded-2xl border border-[#e8e6e1] bg-white p-6 shadow-sm">
              {step === 1 && (
                <Step1Service categories={categories} onSelect={handleSelectService} />
              )}
              {step === 2 && service && (
                <>
                  <div className="mb-5 flex items-center gap-2">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-[12px] text-[#9a9890] hover:text-[#C9A96E] transition-colors"
                    >
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
                  <Step2DateTime
                    clientId={clientId}
                    service={service}
                    timezone={timezone}
                    onSelect={handleSelectSlot}
                  />
                </>
              )}
              {step === 3 && (
                <>
                  <div className="mb-5 flex items-center gap-2">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1 text-[12px] text-[#9a9890] hover:text-[#C9A96E] transition-colors"
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
                  <Step3YourInfo
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    error={submitError}
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
                onChangeService={() => { setStep(1); setSlot(null); }}
                onChangeSlot={() => setStep(2)}
                onBook={() => {
                  const form = document.querySelector<HTMLFormElement>("form");
                  form?.requestSubmit();
                }}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: sticky bottom bar */}
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
                <p className="text-[12px] font-medium text-[#1a1814]">
                  {formatSlotTime(slot, timezone)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
