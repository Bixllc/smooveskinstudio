"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface ServiceInfo {
  name: string;
  durationMinutes: number;
  price: number;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
}

interface CustomerInfoStepProps {
  service: ServiceInfo;
  selectedSlot: string;
  timezone: string;
  initialValues: CustomerInfo | null;
  onSubmit: (info: CustomerInfo) => void;
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  return `${minutes} minutes`;
}

export function CustomerInfoStep({
  service,
  selectedSlot,
  timezone,
  initialValues,
  onSubmit,
}: CustomerInfoStepProps) {
  const [fullName, setFullName] = useState(initialValues?.fullName ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const zonedDate = toZonedTime(new Date(selectedSlot), timezone);
  const dateStr = format(zonedDate, "EEEE, MMMM d, yyyy");
  const timeStr = format(zonedDate, "h:mm a");

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!phone.trim()) newErrors.phone = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <div>
      <h3 className="mb-2 text-center text-xl font-semibold text-[var(--color-text)]">
        Your Details
      </h3>
      <p className="mb-8 text-center text-sm text-[var(--color-text-light)]">
        We&apos;re almost there! Just need a few details
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Booking summary card */}
        <div className="rounded-2xl bg-[var(--color-primary)] p-6 text-white">
          <h4 className="mb-5 font-semibold">Booking Summary</h4>
          <div className="space-y-3">
            <div className="rounded-xl bg-white/20 px-4 py-3">
              <p className="text-xs uppercase opacity-80">Service</p>
              <p className="font-medium">{service.name}</p>
            </div>
            <div className="rounded-xl bg-white/20 px-4 py-3">
              <p className="text-xs uppercase opacity-80">Duration</p>
              <p className="font-medium">{formatDuration(service.durationMinutes)}</p>
            </div>
            <div className="rounded-xl bg-white/20 px-4 py-3">
              <p className="text-xs uppercase opacity-80">Date</p>
              <p className="font-medium">{dateStr}</p>
            </div>
            <div className="rounded-xl bg-white/20 px-4 py-3">
              <p className="text-xs uppercase opacity-80">Time</p>
              <p className="font-medium">{timeStr}</p>
            </div>
            <div className="rounded-xl bg-white/25 px-4 py-3">
              <p className="text-xs uppercase opacity-80">Total Amount</p>
              <p className="text-2xl font-bold">${service.price.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h4 className="mb-4 font-semibold text-[var(--color-text)]">
            Contact Information
          </h4>
          <div className="mb-5 border-t border-[var(--color-border)]" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <strong>Note:</strong> You&apos;ll receive a confirmation email with your booking details.
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
            >
              Confirm Booking &rarr;
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
